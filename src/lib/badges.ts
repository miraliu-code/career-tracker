import { inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { badgesEarned, systemStatus } from "@/db/schema";
import { BADGES, type BadgeStats } from "@/lib/badges-config";

const MARK_CONTACTED_KEY = "mark_contacted_count";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function readCounter(key: string): Promise<number> {
  const [row] = await db
    .select({ value: systemStatus.value })
    .from(systemStatus)
    .where(sql`${systemStatus.key} = ${key}`)
    .limit(1);
  const n = Number(row?.value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** Increment a system_status counter and return the new value. */
export async function incrementCounter(
  key = MARK_CONTACTED_KEY,
): Promise<number> {
  const next = (await readCounter(key)) + 1;
  await db
    .insert(systemStatus)
    .values({ key, value: String(next), updatedAt: new Date() })
    .onConflictDoUpdate({
      target: systemStatus.key,
      set: { value: String(next), updatedAt: new Date() },
    });
  return next;
}

/** Build the stats snapshot used by every badge check. */
export async function computeBadgeStats(): Promise<BadgeStats> {
  const t = today();
  const [appAgg, ivAgg, conAgg, fundAgg, evtAgg, coAgg, markCount] =
    await Promise.all([
      db.execute(sql`
        select
          count(*)::int as total,
          count(*) filter (where status = 'offer')::int as offers,
          count(*) filter (where status = 'rejected')::int as rejections,
          count(*) filter (where why_interested is not null or my_pitch is not null or questions_to_ask is not null)::int as prep_filled,
          count(*) filter (where deadline is not null and deadline < ${t} and status not in ('offer','rejected'))::int as overdue_deadlines,
          count(*) filter (where deadline is not null and status <> 'not_started' and (deadline - created_at::date) > 7)::int as early_bird
        from applications
      `),
      db.execute(sql`
        select
          count(*)::int as total,
          count(*) filter (where outcome = 'passed')::int as passed,
          count(*) filter (where outcome = 'rejected')::int as rejected
        from interviews
      `),
      db.execute(sql`
        select
          count(*)::int as total,
          count(*) filter (where next_followup_date is not null)::int as followups,
          count(*) filter (where next_followup_date is not null and next_followup_date <= ${t})::int as overdue
        from contacts
      `),
      db.execute(sql`
        select
          count(*)::int as total,
          count(*) filter (where status in ('applied','interviewing','awarded','rejected'))::int as submitted,
          count(*) filter (where status = 'awarded')::int as awarded
        from funding_programs
      `),
      db.execute(sql`
        select
          count(*)::int as total,
          count(*) filter (where status in ('attending','completed'))::int as attended
        from events
      `),
      db.execute(sql`select count(*)::int as total from companies`),
      readCounter(MARK_CONTACTED_KEY),
    ]);

  const app = appAgg.rows[0] as Record<string, number>;
  const iv = ivAgg.rows[0] as Record<string, number>;
  const con = conAgg.rows[0] as Record<string, number>;
  const fund = fundAgg.rows[0] as Record<string, number>;
  const evt = evtAgg.rows[0] as Record<string, number>;
  const co = coAgg.rows[0] as Record<string, number>;

  return {
    applications: app.total,
    interviews: iv.total,
    interviewsPassed: iv.passed,
    offers: app.offers,
    rejections: app.rejections + iv.rejected,
    contacts: con.total,
    followupsLogged: con.followups,
    markContactedCount: markCount,
    overdueFollowups: con.overdue,
    funding: fund.total,
    fundingSubmitted: fund.submitted,
    fundingAwarded: fund.awarded,
    events: evt.total,
    eventsAttended: evt.attended,
    companies: co.total,
    prepFilled: app.prep_filled,
    overdueDeadlines: app.overdue_deadlines,
    earlyBird: app.early_bird,
  };
}

/**
 * Evaluate every badge against current DB state and persist any newly-earned
 * ones. Returns the keys earned *this* call so the UI can celebrate them.
 */
export async function checkBadges(): Promise<string[]> {
  const [stats, earnedRows] = await Promise.all([
    computeBadgeStats(),
    db.select({ badgeKey: badgesEarned.badgeKey }).from(badgesEarned),
  ]);
  const already = new Set(earnedRows.map((r) => r.badgeKey));

  const newlyEarned = BADGES.filter(
    (b) => !already.has(b.key) && b.check(stats),
  ).map((b) => b.key);

  if (newlyEarned.length > 0) {
    await db
      .insert(badgesEarned)
      .values(newlyEarned.map((badgeKey) => ({ badgeKey })))
      .onConflictDoNothing();
  }

  return newlyEarned;
}

export type EarnedBadge = { badgeKey: string; earnedAt: Date | null };

/** All earned badges, newest first. */
export async function getEarnedBadges(): Promise<EarnedBadge[]> {
  return db
    .select({ badgeKey: badgesEarned.badgeKey, earnedAt: badgesEarned.earnedAt })
    .from(badgesEarned)
    .orderBy(sql`${badgesEarned.earnedAt} desc`);
}

/** Guard for callers that only have a set of keys handy. */
export async function keysAlreadyEarned(keys: string[]): Promise<Set<string>> {
  if (keys.length === 0) return new Set();
  const rows = await db
    .select({ badgeKey: badgesEarned.badgeKey })
    .from(badgesEarned)
    .where(inArray(badgesEarned.badgeKey, keys));
  return new Set(rows.map((r) => r.badgeKey));
}

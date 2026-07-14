"use server";

import { and, gte, isNotNull, lte, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { applications, contacts, fundingPrograms } from "@/db/schema";
import { getSystemStatus, setSystemStatus } from "@/lib/system-status";
import type { CompanionContext } from "@/lib/mascot-voice";

const HIDDEN_KEY = "companion_hidden";

export async function isCompanionHidden(): Promise<boolean> {
  const row = await getSystemStatus(HIDDEN_KEY);
  return row?.value === "1";
}

export async function setCompanionHidden(hidden: boolean): Promise<void> {
  await setSystemStatus(HIDDEN_KEY, hidden ? "1" : "0");
}

/**
 * Current at-a-glance state for the companion: the nearest upcoming
 * application/funding deadline and how many follow-ups are overdue.
 */
export async function getCompanionContext(): Promise<CompanionContext> {
  const today = new Date().toISOString().slice(0, 10);

  const [appDl, fundDl, overdue] = await Promise.all([
    db
      .select({ name: applications.roleTitle, deadline: applications.deadline })
      .from(applications)
      .where(
        and(
          isNotNull(applications.deadline),
          gte(applications.deadline, today),
          // Skip reminders snoozed into the future, matching the dashboard.
          or(
            sql`${applications.snoozedUntil} is null`,
            lte(applications.snoozedUntil, today),
          ),
        ),
      )
      .orderBy(sql`${applications.deadline} asc`)
      .limit(1),
    db
      .select({ name: fundingPrograms.name, deadline: fundingPrograms.deadline })
      .from(fundingPrograms)
      .where(
        and(
          isNotNull(fundingPrograms.deadline),
          gte(fundingPrograms.deadline, today),
        ),
      )
      .orderBy(sql`${fundingPrograms.deadline} asc`)
      .limit(1),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(contacts)
      .where(
        and(
          isNotNull(contacts.nextFollowupDate),
          lte(contacts.nextFollowupDate, today),
        ),
      ),
  ]);

  // Pick the sooner of the two deadlines.
  const candidates = [...appDl, ...fundDl].filter((r) => r.deadline);
  candidates.sort((a, b) => a.deadline!.localeCompare(b.deadline!));
  const nearest = candidates[0] ?? null;

  const msPerDay = 86_400_000;
  const nearestDays = nearest
    ? Math.round(
        (Date.parse(`${nearest.deadline}T00:00:00Z`) -
          Date.parse(`${today}T00:00:00Z`)) /
          msPerDay,
      )
    : null;

  return {
    nearestName: nearest?.name ?? null,
    nearestDays,
    overdueFollowups: overdue[0]?.n ?? 0,
  };
}

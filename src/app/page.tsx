import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/db";
import {
  alertFindings,
  applicationRequirements,
  interviews,
} from "@/db/schema";
import type { Application, Contact, FundingProgram } from "@/db/schema";
import { isRequirementDone } from "@/lib/requirements";
import {
  CompanyLabel,
  STATUS_LABELS,
  STATUS_STYLES,
  urgencyStyle,
} from "@/components/badges";
import {
  MASCOTS,
  RandomMascot,
  mascotName,
  randomMascotSeed,
} from "@/components/mascots";
import {
  BriefcaseIcon,
  ChatIcon,
  GradCapIcon,
  HeartIcon,
  SproutIcon,
} from "@/components/icons";
import { daysFromToday, formatDate } from "@/lib/dates";

import { getEarnedBadges } from "@/lib/badges";
import { BADGE_BY_KEY, BADGE_COUNT, TIER_STYLES } from "@/lib/badges-config";
import { companionLine, type MascotName } from "@/lib/mascot-voice";
import { getGmailHealth } from "@/lib/system-status";
import { TrophyIcon } from "@/components/icons";

import { GmailHealthBanner } from "./gmail-health-banner";
import { InboxSignals } from "./inbox-signals";

export const dynamic = "force-dynamic";

const APPLICATION_STATUSES = [
  "not_started",
  "applied",
  "interviewing",
  "offer",
  "rejected",
] as const;

const FUNDING_STATUSES = [
  "not_started",
  "applied",
  "interviewing",
  "awarded",
  "rejected",
] as const;

const INTERVIEW_OUTCOMES = ["pending", "passed", "rejected"] as const;

const INTERVIEW_OUTCOME_LABELS: Record<string, string> = {
  pending: "Pending",
  passed: "Passed",
  rejected: "Rejected",
};

const INTERVIEW_OUTCOME_STYLES: Record<string, string> = {
  pending: "bg-honey-mist text-honey",
  passed: "bg-moss-mist text-moss",
  rejected: "bg-rose-mist text-rose-deep",
};

function countByStatus<T extends { status: string | null }>(
  rows: T[],
  statuses: readonly string[],
): Record<string, number> {
  const counts = Object.fromEntries(statuses.map((s) => [s, 0]));
  for (const row of rows) {
    if (row.status && row.status in counts) counts[row.status] += 1;
  }
  return counts;
}

type DeadlineItem = {
  key: string;
  title: string;
  company: { name: string; industry: string | null } | null;
  eligibilityTags: string[] | null;
  kind: "application" | "funding";
  deadline: string;
  daysRemaining: number;
  requirementsNote: string | null;
};

function StatusBreakdown({
  counts,
  statuses,
}: {
  counts: Record<string, number>;
  statuses: readonly string[];
}) {
  return (
    <ul className="mt-4 flex flex-wrap gap-1.5">
      {statuses.map((status) => (
        <li
          key={status}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
        >
          {STATUS_LABELS[status]}
          <span className="font-semibold">{counts[status]}</span>
        </li>
      ))}
    </ul>
  );
}

function DaysRemaining({ days }: { days: number }) {
  const label =
    days === 0 ? "Due today" : days === 1 ? "1 day left" : `${days} days left`;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${urgencyStyle(days)}`}
    >
      {label}
    </span>
  );
}

export default async function DashboardPage() {
  const deadlinesSeed = randomMascotSeed();
  const followupSeed = randomMascotSeed();
  const [
    allApplications,
    allFunding,
    allContacts,
    allCompanies,
    allInterviews,
    allRequirements,
    newSignals,
    gmailHealth,
  ] = await Promise.all([
    db.query.applications.findMany(),
    db.query.fundingPrograms.findMany(),
    db.query.contacts.findMany(),
    db.query.companies.findMany(),
    db.select({ outcome: interviews.outcome }).from(interviews),
    db.select().from(applicationRequirements),
    db
      .select()
      .from(alertFindings)
      .where(eq(alertFindings.status, "new"))
      .orderBy(desc(alertFindings.receivedAt))
      .limit(10),
    getGmailHealth(),
  ]);

  const earnedBadges = await getEarnedBadges();
  const recentBadges = earnedBadges.slice(0, 3);

  const companyById = new Map(allCompanies.map((c) => [c.id, c]));

  // Per-application note about incomplete requirements, surfaced on the
  // dashboard only for deadlines within the next 14 days.
  const incompleteByApp = new Map<number, { recs: number; other: number }>();
  for (const req of allRequirements) {
    if (!req.active || isRequirementDone(req.status)) continue;
    const acc = incompleteByApp.get(req.applicationId) ?? { recs: 0, other: 0 };
    if (req.requirementType === "recommendation") acc.recs += 1;
    else acc.other += 1;
    incompleteByApp.set(req.applicationId, acc);
  }
  const requirementsNoteFor = (applicationId: number): string | null => {
    const acc = incompleteByApp.get(applicationId);
    if (!acc || (acc.recs === 0 && acc.other === 0)) return null;
    const parts: string[] = [];
    if (acc.recs > 0) {
      parts.push(
        `${acc.recs} recommendation${acc.recs === 1 ? "" : "s"} still not requested`,
      );
    }
    if (acc.other > 0) {
      parts.push(
        `${acc.other} other requirement${acc.other === 1 ? "" : "s"} incomplete`,
      );
    }
    return parts.join(" · ");
  };

  const applicationCounts = countByStatus(allApplications, APPLICATION_STATUSES);
  const fundingCounts = countByStatus(allFunding, FUNDING_STATUSES);
  const interviewCounts = countByStatus(
    allInterviews.map((i) => ({ status: i.outcome })),
    INTERVIEW_OUTCOMES,
  );

  const followupSoonCount = allContacts.filter(
    (c) => c.nextFollowupDate && daysFromToday(c.nextFollowupDate) <= 7,
  ).length;

  // A snooze pushes an estimated-opening reminder out of view until its date.
  const isSnoozed = (snoozedUntil: string | null) =>
    snoozedUntil !== null && daysFromToday(snoozedUntil) > 0;

  const upcomingDeadlines: DeadlineItem[] = [
    ...allApplications
      .filter(
        (a): a is Application & { deadline: string } =>
          a.deadline !== null && !isSnoozed(a.snoozedUntil),
      )
      .map((a) => {
        const company = a.companyId
          ? (companyById.get(a.companyId) ?? null)
          : null;
        return {
          key: `app-${a.id}`,
          title: a.roleTitle,
          company: company
            ? { name: company.name, industry: company.industry }
            : null,
          eligibilityTags: null,
          kind: "application" as const,
          deadline: a.deadline,
          daysRemaining: daysFromToday(a.deadline),
          requirementsNote:
            daysFromToday(a.deadline) <= 14 ? requirementsNoteFor(a.id) : null,
        };
      }),
    ...allFunding
      .filter(
        (f): f is FundingProgram & { deadline: string } => f.deadline !== null,
      )
      .map((f) => ({
        key: `fund-${f.id}`,
        title: f.name,
        company: null,
        eligibilityTags: f.eligibilityTags,
        kind: "funding" as const,
        deadline: f.deadline,
        daysRemaining: daysFromToday(f.deadline),
        requirementsNote: null,
      })),
  ]
    .filter((d) => d.daysRemaining >= 0 && d.daysRemaining <= 30)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const needsFollowup = allContacts
    .filter(
      (c): c is Contact & { nextFollowupDate: string } =>
        c.nextFollowupDate !== null && daysFromToday(c.nextFollowupDate) <= 0,
    )
    .sort((a, b) => a.nextFollowupDate.localeCompare(b.nextFollowupDate));

  // Mascot greeting summarizing the most pressing current state.
  const nearest = upcomingDeadlines[0] ?? null;
  const greetingMascot = MASCOTS[randomMascotSeed()].name as MascotName;
  const greeting = companionLine(greetingMascot, {
    nearestName: nearest?.title ?? null,
    nearestDays: nearest?.daysRemaining ?? null,
    overdueFollowups: needsFollowup.length,
  });

  return (
    <div className="flex-1">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-forest">
            <span className="flex size-10 items-center justify-center rounded-full bg-moss text-cream"><SproutIcon className="size-5" /></span>
            Career Tracker
          </h1>
          <p className="mt-1 text-sm text-sage-deep">
            Your applications, funding, and follow-ups — all growing in one
            place.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-blush/40 px-3.5 py-1.5 text-sm text-forest">
            <span className="font-semibold text-rose">{greetingMascot}:</span>
            {greeting}
          </p>
        </header>

        <GmailHealthBanner {...gmailHealth} />

        <InboxSignals findings={newSignals} />

        {/* Badges widget */}
        <Link
          href="/badges"
          className="mb-10 flex flex-wrap items-center gap-4 rounded-2xl border border-sage/30 border-l-[3px] border-l-rose bg-white p-5 shadow-soft transition-shadow hover:shadow-md"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose text-cream">
            <TrophyIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-forest">
              Badges{" "}
              <span className="font-normal text-sage">
                {earnedBadges.length} of {BADGE_COUNT} earned
              </span>
            </p>
            {recentBadges.length > 0 ? (
              <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-sage-deep">
                Recently earned:{" "}
                {recentBadges.map((b, i) => (
                  <span key={b.badgeKey}>
                    <span className="font-medium text-forest">
                      {BADGE_BY_KEY[b.badgeKey]?.name ?? b.badgeKey}
                    </span>
                    {i < recentBadges.length - 1 ? "," : ""}
                  </span>
                ))}
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-sage-deep">
                Start tracking to unlock your first badge.
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {recentBadges.map((b) => {
              const badge = BADGE_BY_KEY[b.badgeKey];
              if (!badge) return null;
              const Icon = badge.icon;
              return (
                <span
                  key={b.badgeKey}
                  title={badge.name}
                  className={`flex size-8 items-center justify-center rounded-full ${TIER_STYLES[badge.tier].icon}`}
                >
                  <Icon className="size-4" />
                </span>
              );
            })}
          </div>
        </Link>

        {/* Summary metrics */}
        <section aria-label="Summary metrics" className="mb-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/applications"
              className="group rounded-2xl border border-sage/30 border-l-[3px] border-l-rose bg-blush/40 p-6 shadow-soft transition-shadow hover:shadow-md"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-sage-deep">
                <span className="flex size-7 items-center justify-center rounded-full bg-rose text-cream">
                  <BriefcaseIcon className="size-4" />
                </span>
                Applications
              </p>
              <p className="mt-1 text-3xl font-semibold text-forest">
                {allApplications.length}
              </p>
              <StatusBreakdown
                counts={applicationCounts}
                statuses={APPLICATION_STATUSES}
              />
            </Link>

            <Link
              href="/funding"
              className="group rounded-2xl border border-sage/30 border-l-[3px] border-l-sage-deep bg-sage/15 p-6 shadow-soft transition-shadow hover:shadow-md"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-sage-deep">
                <span className="flex size-7 items-center justify-center rounded-full bg-sage-deep text-cream">
                  <GradCapIcon className="size-4" />
                </span>
                Funding Programs
              </p>
              <p className="mt-1 text-3xl font-semibold text-forest">
                {allFunding.length}
              </p>
              <StatusBreakdown
                counts={fundingCounts}
                statuses={FUNDING_STATUSES}
              />
            </Link>

            <Link
              href="/contacts"
              className="group rounded-2xl border border-sage/30 border-l-[3px] border-l-rose-deep bg-rose/10 p-6 shadow-soft transition-shadow hover:shadow-md"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-sage-deep">
                <span className="flex size-7 items-center justify-center rounded-full bg-rose-deep text-cream">
                  <HeartIcon className="size-4" />
                </span>
                Follow-Ups Due
              </p>
              <p className="mt-1 text-3xl font-semibold text-forest">
                {followupSoonCount}
              </p>
              <p className="mt-4 text-xs text-sage-deep">
                Contacts overdue or due within the next 7 days
              </p>
            </Link>

            <Link
              href="/applications"
              className="group rounded-2xl border border-sage/30 border-l-[3px] border-l-honey bg-honey-mist/30 p-6 shadow-soft transition-shadow hover:shadow-md"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-sage-deep">
                <span className="flex size-7 items-center justify-center rounded-full bg-honey text-cream">
                  <ChatIcon className="size-4" />
                </span>
                Interviews
              </p>
              <p className="mt-1 text-3xl font-semibold text-forest">
                {allInterviews.length}
              </p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {INTERVIEW_OUTCOMES.map((outcome) => (
                  <li
                    key={outcome}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${INTERVIEW_OUTCOME_STYLES[outcome]}`}
                  >
                    {INTERVIEW_OUTCOME_LABELS[outcome]}
                    <span className="font-semibold">
                      {interviewCounts[outcome]}
                    </span>
                  </li>
                ))}
              </ul>
            </Link>
          </div>
        </section>

        {/* Upcoming deadlines */}
        <section aria-label="Upcoming deadlines" className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-forest">
            Upcoming Deadlines{" "}
            <span className="font-normal text-sage">
              (Next 30 Days)
            </span>
          </h2>
          {upcomingDeadlines.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-dashed border-sage/50 bg-white p-8 text-center">
              <RandomMascot
                seed={deadlinesSeed}
                className="mx-auto mb-3 size-24"
              />
              <p className="text-sm font-medium text-forest">
                Nothing due in the next 30 days
              </p>
              <p className="mt-1 text-sm text-sage-deep">
                {mascotName(deadlinesSeed)} is lounging on your deadlines —
                enjoy the quiet, or go find the next one.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-sage/25 overflow-hidden rounded-2xl border border-sage/30 border-l-[3px] border-l-moss bg-white shadow-soft">
              {upcomingDeadlines.map((item) => (
                <li
                  key={item.key}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-forest">
                      {item.title}
                    </p>
                    {item.company ? (
                      <p className="mt-0.5 text-sm text-sage-deep">
                        <CompanyLabel
                          name={item.company.name}
                          industry={item.company.industry}
                        />
                      </p>
                    ) : item.eligibilityTags &&
                      item.eligibilityTags.length > 0 ? (
                      <p className="mt-0.5 truncate text-sm text-sage-deep">
                        {item.eligibilityTags.join(" · ")}
                      </p>
                    ) : null}
                    {item.requirementsNote && (
                      <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-honey-mist px-2.5 py-0.5 text-xs font-medium text-honey">
                        {item.requirementsNote}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.kind === "application"
                          ? "bg-blush text-rose-deep"
                          : "bg-moss-mist text-moss"
                      }`}
                    >
                      {item.kind === "application" ? "Application" : "Funding"}
                    </span>
                    <span className="text-sm tabular-nums text-sage-deep">
                      {formatDate(item.deadline)}
                    </span>
                    <DaysRemaining days={item.daysRemaining} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Needs follow-up */}
        <section aria-label="Needs follow-up">
          <h2 className="mb-4 text-lg font-semibold text-forest">
            Needs Follow-Up
          </h2>
          {needsFollowup.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-dashed border-sage/50 bg-white p-8 text-center">
              <RandomMascot
                seed={followupSeed}
                className="mx-auto mb-3 size-24"
              />
              <p className="text-sm font-medium text-forest">
                All caught up
              </p>
              <p className="mt-1 text-sm text-sage-deep">
                {mascotName(followupSeed)} checked twice — no follow-ups due
                today. Nicely done.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-sage/30 border-l-[3px] border-l-moss bg-white shadow-soft">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-sage/30 text-xs uppercase tracking-wide text-sage-deep">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Last Contact</th>
                    <th className="px-4 py-3 font-medium">Follow-Up Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage/25">
                  {needsFollowup.map((contact) => {
                    const daysOverdue = -daysFromToday(contact.nextFollowupDate);
                    const company = contact.companyId
                      ? (companyById.get(contact.companyId) ?? null)
                      : null;
                    return (
                      <tr key={contact.id}>
                        <td className="px-4 py-3 font-medium text-forest">
                          {contact.name}
                        </td>
                        <td className="px-4 py-3 text-sage-deep">
                          {company ? (
                            <CompanyLabel
                              name={company.name}
                              industry={company.industry}
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-sage-deep">
                          {contact.lastContactDate
                            ? formatDate(contact.lastContactDate)
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2">
                            <span className="tabular-nums text-rose">
                              {formatDate(contact.nextFollowupDate)}
                            </span>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${urgencyStyle(-daysOverdue)}`}
                            >
                              {daysOverdue === 0
                                ? "Due today"
                                : `${daysOverdue}d overdue`}
                            </span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

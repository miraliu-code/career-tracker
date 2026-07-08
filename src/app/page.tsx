import { db } from "@/db";
import type { Application, Contact, FundingProgram } from "@/db/schema";

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

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  awarded: "Awarded",
  rejected: "Rejected",
};

const STATUS_STYLES: Record<string, string> = {
  not_started:
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  applied: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  interviewing:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  offer:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  awarded:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

/** Parse a Postgres `date` string (YYYY-MM-DD) as UTC midnight. */
function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

/** Today's date at UTC midnight, from the server's local calendar date. */
function todayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
}

function daysFromToday(dateStr: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((parseDate(dateStr).getTime() - todayUtc().getTime()) / msPerDay);
}

function formatDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

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
  company: string | null;
  kind: "application" | "funding";
  deadline: string;
  daysRemaining: number;
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
  const style =
    days <= 3
      ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
      : days <= 7
        ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}

export default async function DashboardPage() {
  const [allApplications, allFunding, allContacts, allCompanies] =
    await Promise.all([
      db.query.applications.findMany(),
      db.query.fundingPrograms.findMany(),
      db.query.contacts.findMany(),
      db.query.companies.findMany(),
    ]);

  const companyName = new Map(allCompanies.map((c) => [c.id, c.name]));

  const applicationCounts = countByStatus(allApplications, APPLICATION_STATUSES);
  const fundingCounts = countByStatus(allFunding, FUNDING_STATUSES);

  const followupSoonCount = allContacts.filter(
    (c) => c.nextFollowupDate && daysFromToday(c.nextFollowupDate) <= 7,
  ).length;

  const upcomingDeadlines: DeadlineItem[] = [
    ...allApplications
      .filter((a): a is Application & { deadline: string } => a.deadline !== null)
      .map((a) => ({
        key: `app-${a.id}`,
        title: a.roleTitle,
        company: a.companyId ? (companyName.get(a.companyId) ?? null) : null,
        kind: "application" as const,
        deadline: a.deadline,
        daysRemaining: daysFromToday(a.deadline),
      })),
    ...allFunding
      .filter(
        (f): f is FundingProgram & { deadline: string } => f.deadline !== null,
      )
      .map((f) => ({
        key: `fund-${f.id}`,
        title: f.name,
        company: null,
        kind: "funding" as const,
        deadline: f.deadline,
        daysRemaining: daysFromToday(f.deadline),
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

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Career Tracker
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Applications, funding programs, and follow-ups at a glance.
          </p>
        </header>

        {/* Summary metrics */}
        <section aria-label="Summary metrics" className="mb-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Applications
              </p>
              <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                {allApplications.length}
              </p>
              <StatusBreakdown
                counts={applicationCounts}
                statuses={APPLICATION_STATUSES}
              />
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Funding Programs
              </p>
              <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                {allFunding.length}
              </p>
              <StatusBreakdown
                counts={fundingCounts}
                statuses={FUNDING_STATUSES}
              />
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:col-span-2 lg:col-span-1">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Follow-Ups Due
              </p>
              <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                {followupSoonCount}
              </p>
              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                Contacts overdue or due within the next 7 days
              </p>
            </div>
          </div>
        </section>

        {/* Upcoming deadlines */}
        <section aria-label="Upcoming deadlines" className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Upcoming Deadlines{" "}
            <span className="font-normal text-zinc-400 dark:text-zinc-500">
              (Next 30 Days)
            </span>
          </h2>
          {upcomingDeadlines.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                Nothing due in the next 30 days
              </p>
              <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
                Enjoy the breathing room — or go find the next opportunity.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
              {upcomingDeadlines.map((item) => (
                <li
                  key={item.key}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                      {item.company ?? "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.kind === "application"
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                          : "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                      }`}
                    >
                      {item.kind === "application" ? "Application" : "Funding"}
                    </span>
                    <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
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
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Needs Follow-Up
          </h2>
          {needsFollowup.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                All caught up
              </p>
              <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
                No contacts are due for a follow-up today.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Last Contact</th>
                    <th className="px-4 py-3 font-medium">Follow-Up Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {needsFollowup.map((contact) => {
                    const daysOverdue = -daysFromToday(contact.nextFollowupDate);
                    return (
                      <tr key={contact.id}>
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                          {contact.name}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                          {contact.companyId
                            ? (companyName.get(contact.companyId) ?? "—")
                            : "—"}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-zinc-600 dark:text-zinc-300">
                          {contact.lastContactDate
                            ? formatDate(contact.lastContactDate)
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2">
                            <span className="tabular-nums text-red-600 dark:text-red-400">
                              {formatDate(contact.nextFollowupDate)}
                            </span>
                            <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
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

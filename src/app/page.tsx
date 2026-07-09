import { db } from "@/db";
import type { Application, Contact, FundingProgram } from "@/db/schema";
import {
  CompanyLabel,
  STATUS_LABELS,
  STATUS_STYLES,
  urgencyStyle,
} from "@/components/badges";
import {
  SkunkMascot,
  StripesMascot,
} from "@/components/mascots";
import {
  BriefcaseIcon,
  GradCapIcon,
  HeartIcon,
  SproutIcon,
} from "@/components/icons";
import { daysFromToday, formatDate } from "@/lib/dates";

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
  const [allApplications, allFunding, allContacts, allCompanies] =
    await Promise.all([
      db.query.applications.findMany(),
      db.query.fundingPrograms.findMany(),
      db.query.contacts.findMany(),
      db.query.companies.findMany(),
    ]);

  const companyById = new Map(allCompanies.map((c) => [c.id, c]));

  const applicationCounts = countByStatus(allApplications, APPLICATION_STATUSES);
  const fundingCounts = countByStatus(allFunding, FUNDING_STATUSES);

  const followupSoonCount = allContacts.filter(
    (c) => c.nextFollowupDate && daysFromToday(c.nextFollowupDate) <= 7,
  ).length;

  const upcomingDeadlines: DeadlineItem[] = [
    ...allApplications
      .filter((a): a is Application & { deadline: string } => a.deadline !== null)
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
        </header>

        {/* Summary metrics */}
        <section aria-label="Summary metrics" className="mb-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-sage/30 border-l-[3px] border-l-rose bg-blush/40 p-6 shadow-soft">
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
            </div>

            <div className="rounded-2xl border border-sage/30 border-l-[3px] border-l-sage-deep bg-sage/15 p-6 shadow-soft">
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
            </div>

            <div className="rounded-2xl border border-sage/30 border-l-[3px] border-l-rose-deep bg-rose/10 p-6 shadow-soft sm:col-span-2 lg:col-span-1">
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
            </div>
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
          <SkunkMascot napping className="mx-auto mb-3 size-24" />
              <p className="text-sm font-medium text-forest">
                Nothing due in the next 30 days
              </p>
              <p className="mt-1 text-sm text-sage-deep">
                Skunk is napping on your deadlines — enjoy the quiet, or go find the next one.
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
          <StripesMascot className="mx-auto mb-3 size-24" />
              <p className="text-sm font-medium text-forest">
                All caught up
              </p>
              <p className="mt-1 text-sm text-sage-deep">
                Stripes checked twice — no follow-ups due today. Nicely done.
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

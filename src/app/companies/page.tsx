import { asc, count, eq } from "drizzle-orm";
import Link from "next/link";

import { IndustryDot, TierBadge } from "@/components/badges";
import { db } from "@/db";
import { applications, companies } from "@/db/schema";

import { AddCompany } from "./add-company";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const rows = await db
    .select({
      company: companies,
      applicationCount: count(applications.id),
    })
    .from(companies)
    .leftJoin(applications, eq(applications.companyId, companies.id))
    .groupBy(companies.id)
    .orderBy(asc(companies.name));

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Companies
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {rows.length} {rows.length === 1 ? "company" : "companies"} on
              your radar.
            </p>
          </div>
        </header>

        <div className="mb-8">
          <AddCompany />
        </div>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              No companies yet
            </p>
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
              Add your first company to start tracking applications.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {rows.map(({ company, applicationCount }) => (
              <li key={company.id}>
                <Link
                  href={`/companies/${company.id}`}
                  className="flex flex-col gap-2 p-4 transition-colors hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-zinc-800/60"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate font-medium text-zinc-900 dark:text-zinc-50">
                      <IndustryDot industry={company.industry} />
                      {company.name}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
                      {[company.industry, company.hqLocation]
                        .filter(Boolean)
                        .join(" · ") || "No details yet"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <TierBadge tier={company.dreamTier} />
                    <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {applicationCount}{" "}
                      {applicationCount === 1 ? "application" : "applications"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

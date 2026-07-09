import { asc, count, eq } from "drizzle-orm";
import Link from "next/link";

import { IndustryDot, TierBadge } from "@/components/badges";
import { BuildingIcon } from "@/components/icons";
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
    <div className="flex-1">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-forest">
              <BuildingIcon className="size-7 text-rose" />
              Companies
            </h1>
            <p className="mt-1 text-sm text-sage-deep">
              {rows.length} {rows.length === 1 ? "company" : "companies"} on
              your radar.
            </p>
          </div>
        </header>

        <div className="mb-8">
          <AddCompany />
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sage/50 bg-white p-8 text-center">
            <p className="text-sm font-medium text-forest">
              No companies yet
            </p>
            <p className="mt-1 text-sm text-sage-deep">
              Add your first company and start building your radar.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-sage/25 overflow-hidden rounded-2xl border border-sage/30 bg-white shadow-soft">
            {rows.map(({ company, applicationCount }) => (
              <li key={company.id}>
                <Link
                  href={`/companies/${company.id}`}
                  className="flex flex-col gap-2 p-4 transition-colors hover:bg-blush/20 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate font-medium text-forest">
                      <IndustryDot industry={company.industry} />
                      {company.name}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-sage-deep">
                      {[company.industry, company.hqLocation]
                        .filter(Boolean)
                        .join(" · ") || "No details yet"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <TierBadge tier={company.dreamTier} />
                    <span className="inline-flex rounded-full bg-mist px-2.5 py-0.5 text-xs font-medium text-sage-deep">
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

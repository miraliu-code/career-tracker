import { asc, eq } from "drizzle-orm";

import { BriefcaseIcon } from "@/components/icons";
import { randomMascotSeed } from "@/components/mascots";
import { db } from "@/db";
import { applications, companies } from "@/db/schema";

import { AddApplication } from "./add-application";
import { ApplicationsList, type ApplicationRow } from "./applications-list";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const [rows, companyOptions] = await Promise.all([
    db
      .select({
        application: applications,
        companyId: companies.id,
        companyName: companies.name,
        companyIndustry: companies.industry,
      })
      .from(applications)
      .leftJoin(companies, eq(applications.companyId, companies.id)),
    db
      .select({ id: companies.id, name: companies.name })
      .from(companies)
      .orderBy(asc(companies.name)),
  ]);

  const applicationRows: ApplicationRow[] = rows.map((row) => ({
    id: row.application.id,
    companyId: row.application.companyId,
    roleTitle: row.application.roleTitle,
    type: row.application.type,
    location: row.application.location,
    deadline: row.application.deadline,
    status: row.application.status ?? "not_started",
    resumeVersion: row.application.resumeVersion,
    notes: row.application.notes,
    company:
      row.companyId !== null && row.companyName !== null
        ? {
            id: row.companyId,
            name: row.companyName,
            industry: row.companyIndustry,
          }
        : null,
  }));

  return (
    <div className="flex-1">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-forest">
            <span className="flex size-10 items-center justify-center rounded-full bg-honey text-cream"><BriefcaseIcon className="size-5" /></span>
            Applications
          </h1>
          <p className="mt-1 text-sm text-sage-deep">
            {applicationRows.length}{" "}
            {applicationRows.length === 1 ? "application" : "applications"}{" "}
            tracked.
          </p>
        </header>

        <div className="mb-8">
          <AddApplication companies={companyOptions} />
        </div>

        <ApplicationsList
          applications={applicationRows}
          companies={companyOptions}
          mascotSeed={randomMascotSeed()}
        />
      </main>
    </div>
  );
}

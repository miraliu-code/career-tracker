import { db } from "@/db";

import { AddFunding } from "./add-funding";
import { FundingList, type FundingRow } from "./funding-list";

export const dynamic = "force-dynamic";

export default async function FundingPage() {
  const programs = await db.query.fundingPrograms.findMany();

  const rows: FundingRow[] = programs.map((program) => ({
    id: program.id,
    name: program.name,
    type: program.type,
    amount: program.amount,
    deadline: program.deadline,
    status: program.status ?? "not_started",
    eligibilityTags: program.eligibilityTags,
    notes: program.notes,
  }));

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Funding Programs
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {rows.length} {rows.length === 1 ? "program" : "programs"} tracked.
          </p>
        </header>

        <div className="mb-8">
          <AddFunding />
        </div>

        <FundingList programs={rows} />
      </main>
    </div>
  );
}

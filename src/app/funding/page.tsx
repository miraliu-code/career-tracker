import { GradCapIcon } from "@/components/icons";
import { randomMascotSeed } from "@/components/mascots";
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
    <div className="flex-1">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-forest">
            <span className="flex size-10 items-center justify-center rounded-full bg-forest-soft text-cream"><GradCapIcon className="size-5" /></span>
            Funding Programs
          </h1>
          <p className="mt-1 text-sm text-sage-deep">
            {rows.length} {rows.length === 1 ? "program" : "programs"} tracked.
          </p>
        </header>

        <div className="mb-8">
          <AddFunding />
        </div>

        <FundingList programs={rows} mascotSeed={randomMascotSeed()} />
      </main>
    </div>
  );
}

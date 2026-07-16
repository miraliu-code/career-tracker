import { asc, desc } from "drizzle-orm";

import { BookIcon } from "@/components/icons";
import { randomMascotSeed } from "@/components/mascots";
import { db } from "@/db";
import { skillHoursLog, skills } from "@/db/schema";
import { daysFromToday } from "@/lib/dates";
import type { SkillRow, SkillSection, SkillType } from "@/lib/learning";

import { AddSkill } from "./add-skill";
import { LearningSections } from "./learning-list";

export const dynamic = "force-dynamic";

export default async function LearningPage() {
  const [allSkills, allLogs] = await Promise.all([
    db.select().from(skills).orderBy(asc(skills.sortOrder), asc(skills.id)),
    db.select().from(skillHoursLog).orderBy(desc(skillHoursLog.loggedOn)),
  ]);

  // Most recent log date per skill (logs are already newest-first).
  const lastLoggedBySkill = new Map<number, string>();
  for (const log of allLogs) {
    if (log.loggedOn && !lastLoggedBySkill.has(log.skillId)) {
      lastLoggedBySkill.set(log.skillId, log.loggedOn);
    }
  }

  const rows: SkillRow[] = allSkills.map((s) => ({
    id: s.id,
    name: s.name,
    section: s.section as SkillSection,
    skillType: s.skillType as SkillType,
    learningNotes: s.learningNotes,
    proof: s.proof,
    proofUrl: s.proofUrl,
    status: s.status ?? "not_started",
    hoursLogged: s.hoursLogged,
    targetHours: s.targetHours,
    completedAt: s.completedAt,
    resources: s.resources,
    sortOrder: s.sortOrder,
    lastLoggedOn: lastLoggedBySkill.get(s.id) ?? null,
  }));

  // Monthly pace check: if there's at least one unfinished build and the most
  // recent activity on ANY build (a logged date, or the build's creation date
  // when it has no logs) is 30+ days ago, nudge a review. A freshly created
  // build counts as recent activity, so this never fires on day one.
  const activeBuilds = allSkills.filter(
    (s) => s.skillType === "build" && s.status !== "complete",
  );
  let showPaceCheck = false;
  if (activeBuilds.length > 0) {
    const daysSinceActivity = activeBuilds.map((s) => {
      const last =
        lastLoggedBySkill.get(s.id) ??
        (s.createdAt ? s.createdAt.toISOString().slice(0, 10) : null);
      return last ? -daysFromToday(last) : Number.POSITIVE_INFINITY;
    });
    showPaceCheck = Math.min(...daysSinceActivity) >= 30;
  }

  return (
    <div className="flex-1">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-forest">
            <span className="flex size-10 items-center justify-center rounded-full bg-rose text-cream">
              <BookIcon className="size-5" />
            </span>
            Learning
          </h1>
          <p className="mt-1 text-sm text-sage-deep">
            {rows.length} {rows.length === 1 ? "skill" : "skills"} in
            development.
          </p>
        </header>

        <div className="mb-8">
          <AddSkill />
        </div>

        <LearningSections
          skills={rows}
          mascotSeed={randomMascotSeed()}
          showPaceCheck={showPaceCheck}
        />
      </main>
    </div>
  );
}

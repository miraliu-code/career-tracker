import { TrophyIcon } from "@/components/icons";
import { getEarnedBadges } from "@/lib/badges";
import { BADGE_COUNT } from "@/lib/badges-config";

import { BadgeGrid } from "./badge-grid";

export const dynamic = "force-dynamic";

export default async function BadgesPage() {
  const earned = await getEarnedBadges();
  const earnedMap = new Map(earned.map((e) => [e.badgeKey, e.earnedAt]));
  const pct = Math.round((earned.length / BADGE_COUNT) * 100);

  return (
    <div className="flex-1">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-forest">
            <span className="flex size-10 items-center justify-center rounded-full bg-rose text-cream">
              <TrophyIcon className="size-5" />
            </span>
            Badges
          </h1>
          <p className="mt-1 text-sm text-sage-deep">
            {earned.length} of {BADGE_COUNT} earned — keep going!
          </p>
          <div className="mt-3 h-2 max-w-md overflow-hidden rounded-full bg-sage/20">
            <div
              className="h-full rounded-full bg-rose transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </header>

        <BadgeGrid earnedMap={earnedMap} />
      </main>
    </div>
  );
}

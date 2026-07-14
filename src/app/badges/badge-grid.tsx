import {
  BADGE_CATEGORIES,
  BADGES,
  TIER_STYLES,
  type Badge,
} from "@/lib/badges-config";
import { formatDate } from "@/lib/dates";

function BadgeCard({
  badge,
  earnedAt,
}: {
  badge: Badge;
  earnedAt: Date | null | undefined;
}) {
  const earned = earnedAt !== undefined;
  const tier = TIER_STYLES[badge.tier];
  const Icon = badge.icon;

  return (
    <div
      className={`flex gap-3 rounded-2xl border p-4 transition-colors ${
        earned
          ? `${tier.ring} shadow-soft`
          : "border-sage/25 bg-white opacity-70"
      }`}
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
          earned ? tier.icon : "bg-sage/20 text-sage"
        }`}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 font-medium text-forest">
          <span className="truncate">{badge.name}</span>
          {!earned && (
            <span className="text-xs font-normal text-sage">Locked</span>
          )}
        </p>
        <p className="mt-0.5 text-sm text-sage-deep">{badge.description}</p>
        {earned && earnedAt && (
          <p className="mt-1 text-xs text-sage">
            Earned {formatDate(earnedAt.toISOString().slice(0, 10))}
          </p>
        )}
      </div>
    </div>
  );
}

export function BadgeGrid({
  earnedMap,
}: {
  earnedMap: Map<string, Date | null>;
}) {
  return (
    <div className="space-y-8">
      {BADGE_CATEGORIES.map((category) => {
        const inCategory = BADGES.filter((b) => b.category === category);
        const earnedCount = inCategory.filter((b) =>
          earnedMap.has(b.key),
        ).length;
        return (
          <section key={category}>
            <h2 className="mb-3 flex items-baseline gap-2 text-lg font-semibold text-forest">
              {category}
              <span className="text-sm font-normal text-sage">
                {earnedCount}/{inCategory.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inCategory.map((badge) => (
                <BadgeCard
                  key={badge.key}
                  badge={badge}
                  earnedAt={
                    earnedMap.has(badge.key)
                      ? earnedMap.get(badge.key)
                      : undefined
                  }
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

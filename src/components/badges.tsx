export const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  awarded: "Awarded",
  rejected: "Rejected",
};

export const STATUS_STYLES: Record<string, string> = {
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

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.not_started}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

const INDUSTRY_DOTS = {
  consulting: "bg-blue-500",
  tech: "bg-green-500",
  communications: "bg-purple-500",
  international: "bg-yellow-500",
  consumer: "bg-orange-500",
  other: "bg-zinc-400 dark:bg-zinc-500",
} as const;

type IndustryCategory = keyof typeof INDUSTRY_DOTS;

const INDUSTRY_KEYWORDS: [IndustryCategory, RegExp][] = [
  ["consulting", /consult/],
  ["tech", /tech|software|ai|engineering|observability|design|fintech|saas|cloud|data/],
  ["communications", /communic|media|marketing|journal|public relations/],
  ["international", /international|global|diplomacy|foreign/],
  ["consumer", /consumer|retail|commerce|cpg|hospitality/],
];

export function industryCategory(industry: string | null): IndustryCategory {
  const normalized = (industry ?? "").toLowerCase();
  for (const [category, pattern] of INDUSTRY_KEYWORDS) {
    if (pattern.test(normalized)) return category;
  }
  return "other";
}

export function IndustryDot({ industry }: { industry: string | null }) {
  return (
    <span
      aria-hidden
      className={`size-2 shrink-0 rounded-full ${INDUSTRY_DOTS[industryCategory(industry)]}`}
    />
  );
}

export function CompanyLabel({
  name,
  industry,
}: {
  name: string;
  industry: string | null;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <IndustryDot industry={industry} />
      {name}
    </span>
  );
}

/**
 * Urgency colors for deadline/follow-up badges: red for overdue or within
 * 3 days, amber for 4-7 days, neutral beyond that.
 */
export function urgencyStyle(daysRemaining: number): string {
  if (daysRemaining <= 3) return "bg-red-600 text-white";
  if (daysRemaining <= 7) return "bg-amber-400 text-amber-950";
  return "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300";
}

const TIER_STYLES: Record<string, string> = {
  A: "bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-400/40 dark:bg-yellow-950 dark:text-yellow-300",
  B: "bg-zinc-200 text-zinc-700 ring-1 ring-inset ring-zinc-400/40 dark:bg-zinc-700 dark:text-zinc-200",
  C: "bg-orange-100 text-orange-800 ring-1 ring-inset ring-orange-400/40 dark:bg-orange-950 dark:text-orange-300",
};

export function TierBadge({ tier }: { tier: string | null }) {
  if (!tier || !(tier in TIER_STYLES)) return null;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${TIER_STYLES[tier]}`}
    >
      Tier {tier}
    </span>
  );
}

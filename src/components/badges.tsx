export const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  awarded: "Awarded",
  rejected: "Rejected",
  accepted: "Accepted",
  attending: "Attending",
  completed: "Completed",
};

export const STATUS_STYLES: Record<string, string> = {
  not_started: "bg-sage-mist text-sage-deep",
  applied: "bg-forest-mist text-forest",
  interviewing: "bg-honey-mist text-honey",
  offer: "bg-moss-mist text-moss",
  awarded: "bg-moss-mist text-moss",
  rejected: "bg-rose-mist text-rose-deep",
  accepted: "bg-moss-mist text-moss",
  attending: "bg-blush text-forest",
  completed: "bg-mist text-sage-deep",
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
  other: "bg-sage",
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

export const CONNECTION_LABELS: Record<string, string> = {
  alum: "Alum",
  recruiter: "Recruiter",
  mentor: "Mentor",
  colleague: "Colleague",
  peer: "Peer",
  other: "Other",
};

const CONNECTION_STYLES: Record<string, string> = {
  alum: "bg-blush text-rose-deep",
  recruiter: "bg-forest-mist text-forest",
  mentor: "bg-moss-mist text-moss",
  colleague: "bg-honey-mist text-honey",
  peer: "bg-rose-mist text-rose-deep",
  other: "bg-sage-mist text-sage-deep",
};

export function ConnectionBadge({ type }: { type: string | null }) {
  if (!type || !(type in CONNECTION_STYLES)) return null;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${CONNECTION_STYLES[type]}`}
    >
      {CONNECTION_LABELS[type]}
    </span>
  );
}

/**
 * Urgency colors for deadline/follow-up badges: rose for overdue or within
 * 3 days, honey for 4-7 days, neutral beyond that.
 */
export function urgencyStyle(daysRemaining: number): string {
  if (daysRemaining <= 3) return "bg-rose text-white";
  if (daysRemaining <= 7) return "bg-honey text-white";
  return "bg-mist text-sage-deep";
}

const TIER_STYLES: Record<string, string> = {
  A: "bg-honey-mist text-honey ring-1 ring-inset ring-honey/30",
  B: "bg-sage-mist text-sage-deep ring-1 ring-inset ring-sage/40",
  C: "bg-blush text-rose-deep ring-1 ring-inset ring-rose/25",
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

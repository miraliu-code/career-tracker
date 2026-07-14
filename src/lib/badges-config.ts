import {
  BoltIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  ChatIcon,
  ClockIcon,
  FlameIcon,
  GradCapIcon,
  HandshakeIcon,
  HeartIcon,
  MedalIcon,
  PdfIcon,
  SearchIcon,
  ShieldIcon,
  SparkleIcon,
  StarIcon,
  TargetIcon,
  TrophyIcon,
} from "@/components/icons";

export type BadgeTier = "bronze" | "silver" | "gold";

export type BadgeCategory =
  | "Applications"
  | "Interviews"
  | "Outcomes"
  | "Contacts"
  | "Follow-Ups"
  | "Funding"
  | "Events"
  | "Companies"
  | "Prep"
  | "Consistency";

/**
 * Snapshot of everything the badge checks need, computed once per evaluation
 * from the database so each `check` stays a cheap pure function.
 */
export type BadgeStats = {
  applications: number;
  interviews: number;
  interviewsPassed: number;
  offers: number;
  rejections: number;
  contacts: number;
  followupsLogged: number;
  markContactedCount: number;
  overdueFollowups: number;
  funding: number;
  fundingSubmitted: number;
  fundingAwarded: number;
  events: number;
  eventsAttended: number;
  companies: number;
  prepFilled: number;
  overdueDeadlines: number;
  earlyBird: number;
};

export type Badge = {
  key: string;
  name: string;
  description: string;
  icon: (props: { className?: string }) => React.ReactNode;
  tier: BadgeTier;
  category: BadgeCategory;
  check: (s: BadgeStats) => boolean;
};

export const BADGES: Badge[] = [
  // ---- Applications ----
  { key: "app_1", name: "First Steps", description: "Log your first application.", icon: BriefcaseIcon, tier: "bronze", category: "Applications", check: (s) => s.applications >= 1 },
  { key: "app_5", name: "Getting Started", description: "Track 5 applications.", icon: BriefcaseIcon, tier: "bronze", category: "Applications", check: (s) => s.applications >= 5 },
  { key: "app_15", name: "Committed", description: "Track 15 applications.", icon: BriefcaseIcon, tier: "silver", category: "Applications", check: (s) => s.applications >= 15 },
  { key: "app_30", name: "Prolific", description: "Track 30 applications.", icon: BriefcaseIcon, tier: "silver", category: "Applications", check: (s) => s.applications >= 30 },
  { key: "app_50", name: "Machine", description: "Track 50 applications.", icon: FlameIcon, tier: "gold", category: "Applications", check: (s) => s.applications >= 50 },

  // ---- Interviews ----
  { key: "int_1", name: "In the Room", description: "Log your first interview.", icon: ChatIcon, tier: "bronze", category: "Interviews", check: (s) => s.interviews >= 1 },
  { key: "int_5", name: "Seasoned", description: "Log 5 interviews.", icon: ChatIcon, tier: "silver", category: "Interviews", check: (s) => s.interviews >= 5 },
  { key: "int_15", name: "Veteran", description: "Log 15 interviews.", icon: MedalIcon, tier: "gold", category: "Interviews", check: (s) => s.interviews >= 15 },
  { key: "int_pass", name: "Nailed It", description: "Record your first passed interview.", icon: StarIcon, tier: "silver", category: "Interviews", check: (s) => s.interviewsPassed >= 1 },

  // ---- Outcomes ----
  { key: "out_offer", name: "Offer!", description: "Receive your first offer.", icon: TrophyIcon, tier: "gold", category: "Outcomes", check: (s) => s.offers >= 1 },
  { key: "out_multi", name: "In Demand", description: "Hold two or more offers at once.", icon: TrophyIcon, tier: "gold", category: "Outcomes", check: (s) => s.offers >= 2 },
  { key: "out_reject", name: "Battle Scar", description: "Log a rejection — every no is proof you're in the arena.", icon: ShieldIcon, tier: "bronze", category: "Outcomes", check: (s) => s.rejections >= 1 },

  // ---- Contacts ----
  { key: "con_1", name: "Hello There", description: "Add your first contact.", icon: HeartIcon, tier: "bronze", category: "Contacts", check: (s) => s.contacts >= 1 },
  { key: "con_10", name: "Networker", description: "Build a network of 10 contacts.", icon: HeartIcon, tier: "silver", category: "Contacts", check: (s) => s.contacts >= 10 },
  { key: "con_25", name: "Connector", description: "Build a network of 25 contacts.", icon: HandshakeIcon, tier: "silver", category: "Contacts", check: (s) => s.contacts >= 25 },
  { key: "con_50", name: "Well-Connected", description: "Build a network of 50 contacts.", icon: HandshakeIcon, tier: "gold", category: "Contacts", check: (s) => s.contacts >= 50 },

  // ---- Follow-Ups ----
  { key: "fu_1", name: "Staying in Touch", description: "Schedule your first follow-up.", icon: ClockIcon, tier: "bronze", category: "Follow-Ups", check: (s) => s.followupsLogged >= 1 },
  { key: "fu_diligent", name: "Diligent", description: "Mark a contact as reached 10 times.", icon: ClockIcon, tier: "silver", category: "Follow-Ups", check: (s) => s.markContactedCount >= 10 },
  { key: "fu_inbox0", name: "Inbox Zero", description: "No overdue follow-ups with 5+ contacts.", icon: SparkleIcon, tier: "silver", category: "Follow-Ups", check: (s) => s.contacts >= 5 && s.overdueFollowups === 0 },

  // ---- Funding ----
  { key: "fund_1", name: "Money Hunt", description: "Track your first funding program.", icon: GradCapIcon, tier: "bronze", category: "Funding", check: (s) => s.funding >= 1 },
  { key: "fund_10", name: "Scholar", description: "Track 10 funding programs.", icon: GradCapIcon, tier: "silver", category: "Funding", check: (s) => s.funding >= 10 },
  { key: "fund_submit", name: "In the Running", description: "Submit your first funding application.", icon: BoltIcon, tier: "silver", category: "Funding", check: (s) => s.fundingSubmitted >= 1 },
  { key: "fund_award", name: "Funded!", description: "Win your first award.", icon: TrophyIcon, tier: "gold", category: "Funding", check: (s) => s.fundingAwarded >= 1 },

  // ---- Events ----
  { key: "evt_1", name: "Save the Date", description: "Track your first event.", icon: CalendarIcon, tier: "bronze", category: "Events", check: (s) => s.events >= 1 },
  { key: "evt_3", name: "Attendee", description: "Attend 3 events.", icon: CalendarIcon, tier: "silver", category: "Events", check: (s) => s.eventsAttended >= 3 },

  // ---- Companies ----
  { key: "co_1", name: "First Target", description: "Add your first company.", icon: BuildingIcon, tier: "bronze", category: "Companies", check: (s) => s.companies >= 1 },
  { key: "co_25", name: "Researcher", description: "Add 25 companies.", icon: SearchIcon, tier: "silver", category: "Companies", check: (s) => s.companies >= 25 },
  { key: "co_100", name: "Encyclopedic", description: "Add 100 companies.", icon: SearchIcon, tier: "gold", category: "Companies", check: (s) => s.companies >= 100 },

  // ---- Prep ----
  { key: "prep_1", name: "Do Your Homework", description: "Fill in prep notes on an application.", icon: PdfIcon, tier: "bronze", category: "Prep", check: (s) => s.prepFilled >= 1 },
  { key: "prep_5", name: "Prepared", description: "Fill in prep notes on 5 applications.", icon: PdfIcon, tier: "silver", category: "Prep", check: (s) => s.prepFilled >= 5 },

  // ---- Consistency ----
  { key: "con_hawk", name: "Deadline Hawk", description: "No overdue deadlines with 10+ applications.", icon: TargetIcon, tier: "gold", category: "Consistency", check: (s) => s.applications >= 10 && s.overdueDeadlines === 0 },
  { key: "con_early", name: "Early Bird", description: "Log an application more than 7 days before its deadline.", icon: BoltIcon, tier: "silver", category: "Consistency", check: (s) => s.earlyBird >= 1 },
];

export const BADGE_COUNT = BADGES.length;

export const BADGE_BY_KEY: Record<string, Badge> = Object.fromEntries(
  BADGES.map((b) => [b.key, b]),
);

/** Category display order for the badges page. */
export const BADGE_CATEGORIES: BadgeCategory[] = [
  "Applications",
  "Interviews",
  "Outcomes",
  "Contacts",
  "Follow-Ups",
  "Funding",
  "Events",
  "Companies",
  "Prep",
  "Consistency",
];

export const TIER_STYLES: Record<BadgeTier, { ring: string; icon: string; label: string }> = {
  bronze: { ring: "border-honey/40 bg-honey-mist/30", icon: "bg-honey text-cream", label: "Bronze" },
  silver: { ring: "border-sage/40 bg-sage/15", icon: "bg-sage-deep text-cream", label: "Silver" },
  gold: { ring: "border-rose/40 bg-blush/40", icon: "bg-rose text-cream", label: "Gold" },
};

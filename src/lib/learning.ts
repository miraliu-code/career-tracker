// Shared config + helpers for the Learning tab. Pure and server/client safe
// (no React, no DB).

export type SkillSection =
  | "financial_modeling"
  | "consulting_cases"
  | "ai_fluency"
  | "marketing_analytics"
  | "data_viz_bi"
  | "pr_comms"
  | "project_management"
  | "mandarin"
  | "additional";

export type SkillType = "build" | "certification" | "habit";

export const SKILL_SECTIONS: SkillSection[] = [
  "financial_modeling",
  "consulting_cases",
  "ai_fluency",
  "marketing_analytics",
  "data_viz_bi",
  "pr_comms",
  "project_management",
  "mandarin",
  "additional",
];

export const SECTION_LABELS: Record<SkillSection, string> = {
  financial_modeling: "Financial Modeling",
  consulting_cases: "Consulting Cases",
  ai_fluency: "AI Fluency",
  marketing_analytics: "Marketing Analytics",
  data_viz_bi: "Data Viz & BI",
  pr_comms: "PR & Comms",
  project_management: "Project Management",
  mandarin: "Mandarin",
  additional: "Additional",
};

export const SKILL_TYPES: SkillType[] = ["build", "certification", "habit"];

export const SKILL_TYPE_LABELS: Record<SkillType, string> = {
  build: "Build",
  certification: "Certification",
  habit: "Habit",
};

/** One-line tracking philosophy shown under each section header. */
export const SECTION_PHILOSOPHY: Record<SkillType, string> = {
  build: "Multi-month projects — track hours toward a deliverable.",
  certification: "Quick wins — done or not done.",
  habit: "Ongoing practice — consistency over completion.",
};

export const SECTION_HEADING: Record<SkillType, string> = {
  build: "Builds",
  certification: "Certifications",
  habit: "Habits",
};

type StatusOption = { value: string; label: string };

/** Status options per skill type. The first option is the default. */
export const STATUS_OPTIONS: Record<SkillType, StatusOption[]> = {
  build: [
    { value: "not_started", label: "Not started" },
    { value: "in_progress", label: "In progress" },
    { value: "interview_ready", label: "Interview ready" },
    { value: "complete", label: "Complete" },
  ],
  certification: [
    { value: "not_started", label: "Not started" },
    { value: "in_progress", label: "In progress" },
    { value: "earned", label: "Earned" },
  ],
  habit: [
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
  ],
};

export const DEFAULT_STATUS: Record<SkillType, string> = {
  build: "not_started",
  certification: "not_started",
  habit: "active",
};

export function statusLabel(type: SkillType, value: string | null): string {
  const opt = STATUS_OPTIONS[type].find((o) => o.value === value);
  return opt?.label ?? STATUS_OPTIONS[type][0].label;
}

export const STATUS_STYLES: Record<string, string> = {
  not_started: "bg-sage-mist text-sage-deep",
  in_progress: "bg-honey-mist text-honey",
  interview_ready: "bg-blush text-rose-deep",
  complete: "bg-moss-mist text-moss",
  earned: "bg-moss-mist text-moss",
  active: "bg-forest-mist text-forest",
  paused: "bg-sage-mist text-sage-deep",
};

/** A build's progress toward its target, clamped to 0–100. */
export function buildProgressPercent(
  hoursLogged: number,
  targetHours: number | null,
): number {
  if (!targetHours || targetHours <= 0) return 0;
  return Math.min(100, Math.round((hoursLogged / targetHours) * 100));
}

export type SkillRow = {
  id: number;
  name: string;
  section: SkillSection;
  skillType: SkillType;
  learningNotes: string | null;
  proof: string | null;
  proofUrl: string | null;
  status: string;
  hoursLogged: number;
  targetHours: number | null;
  completedAt: string | null;
  resources: string | null;
  sortOrder: number;
  lastLoggedOn: string | null;
};

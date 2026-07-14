// Shared config + helpers for per-application requirements. Pure and
// server/client safe (no React, no DB).

export type RequirementType =
  | "recommendation"
  | "pymetrics_exam"
  | "screening_test"
  | "case_interview"
  | "essay"
  | "relocation"
  | "visa";

export const REQUIREMENT_LABELS: Record<RequirementType, string> = {
  recommendation: "Recommendation",
  pymetrics_exam: "Pymetrics exam",
  screening_test: "Screening test",
  case_interview: "Case interview",
  essay: "Essay(s)",
  relocation: "Relocation",
  visa: "Visa",
};

/** Non-recommendation types, in the order they appear in the "Requires" row. */
export const SIMPLE_REQUIREMENT_TYPES: RequirementType[] = [
  "pymetrics_exam",
  "screening_test",
  "case_interview",
  "essay",
  "relocation",
  "visa",
];

type StatusOption = { value: string; label: string };

/** Status field config per type. `value` is stored; "none" means not started. */
export const REQUIREMENT_STATUS: Record<
  RequirementType,
  { label: string; options: StatusOption[] }
> = {
  recommendation: {
    label: "Status",
    options: [
      { value: "none", label: "None" },
      { value: "requested", label: "Requested" },
      { value: "approved", label: "Approved" },
    ],
  },
  essay: {
    label: "Status",
    options: [
      { value: "none", label: "None" },
      { value: "started", label: "Started" },
      { value: "completed", label: "Completed" },
    ],
  },
  pymetrics_exam: {
    label: "Status",
    options: [
      { value: "none", label: "None" },
      { value: "started", label: "Started" },
      { value: "completed", label: "Completed" },
    ],
  },
  screening_test: {
    label: "Status",
    options: [
      { value: "none", label: "None" },
      { value: "started", label: "Started" },
      { value: "completed", label: "Completed" },
    ],
  },
  case_interview: {
    label: "Status",
    options: [
      { value: "none", label: "None" },
      { value: "started", label: "Started" },
      { value: "completed", label: "Completed" },
    ],
  },
  visa: {
    label: "Status",
    options: [
      { value: "none", label: "None" },
      { value: "started", label: "Started" },
      { value: "completed", label: "Completed" },
    ],
  },
  relocation: {
    label: "Housing",
    options: [
      { value: "none", label: "None" },
      { value: "found", label: "Found" },
      { value: "confirmed", label: "Confirmed" },
    ],
  },
};

/** Only recommendations carry contact name/info fields. */
export function hasContactFields(type: RequirementType): boolean {
  return type === "recommendation";
}

/** A requirement counts as "done" once its status is anything but None. */
export function isRequirementDone(status: string | null): boolean {
  return status !== null && status !== "" && status !== "none";
}

export function statusLabel(type: RequirementType, value: string | null): string {
  const opt = REQUIREMENT_STATUS[type].options.find((o) => o.value === value);
  return opt?.label ?? "None";
}

export type RequirementRow = {
  id: number;
  requirementType: RequirementType;
  slotIndex: number;
  active: boolean;
  status: string | null;
  contactName: string | null;
  contactInfo: string | null;
  notes: string | null;
};

/** {done, total} across the active requirements of an application. */
export function requirementProgress(rows: RequirementRow[]): {
  done: number;
  total: number;
} {
  const active = rows.filter((r) => r.active);
  return {
    done: active.filter((r) => isRequirementDone(r.status)).length,
    total: active.length,
  };
}

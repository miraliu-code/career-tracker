"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { applicationRequirements, applications } from "@/db/schema";
import { checkBadges } from "@/lib/badges";
import { deleteResume } from "@/lib/resume-storage";
import {
  REQUIREMENT_STATUS,
  SIMPLE_REQUIREMENT_TYPES,
  type RequirementType,
} from "@/lib/requirements";

export type ApplicationFormState = {
  error: string | null;
  success?: boolean;
  newBadges?: string[];
};

const APPLICATION_TYPES = ["internship", "new_grad"] as const;
type ApplicationType = (typeof APPLICATION_TYPES)[number];

const APPLICATION_STATUSES = [
  "not_started",
  "applied",
  "interviewing",
  "offer",
  "rejected",
] as const;
type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

function isStatus(value: string): value is ApplicationStatus {
  return (APPLICATION_STATUSES as readonly string[]).includes(value);
}

function readApplicationFields(formData: FormData) {
  const optional = (field: string) => {
    const value = (formData.get(field) as string | null)?.trim();
    return value ? value : null;
  };

  const companyIdRaw = optional("companyId");
  const companyId =
    companyIdRaw && Number.isInteger(Number(companyIdRaw))
      ? Number(companyIdRaw)
      : null;

  const type = optional("type");
  const status = optional("status");
  const deadline = optional("deadline");

  return {
    roleTitle: optional("roleTitle") ?? "",
    companyId,
    type:
      type && APPLICATION_TYPES.includes(type as ApplicationType)
        ? (type as ApplicationType)
        : null,
    location: optional("location"),
    deadline: deadline && /^\d{4}-\d{2}-\d{2}$/.test(deadline) ? deadline : null,
    status: status && isStatus(status) ? status : ("not_started" as const),
    resumeUrl: optional("resumeUrl"),
    resumeFilename: optional("resumeFilename"),
    notes: optional("notes"),
    whyInterested: optional("whyInterested"),
    myPitch: optional("myPitch"),
    questionsToAsk: optional("questionsToAsk"),
  };
}

const ALL_REQUIREMENT_TYPES: RequirementType[] = [
  "recommendation",
  ...SIMPLE_REQUIREMENT_TYPES,
];

type ParsedRequirement = {
  requirementType: RequirementType;
  slotIndex: number;
  status: string | null;
  contactName: string | null;
  contactInfo: string | null;
  notes: string | null;
};

/**
 * Parse and validate the hidden "requirements" JSON the form submits. Anything
 * malformed is dropped rather than throwing, so a bad payload can't break a
 * save. Contact fields are only kept for recommendations.
 */
function readRequirements(formData: FormData): ParsedRequirement[] {
  const raw = formData.get("requirements");
  if (typeof raw !== "string" || !raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const out: ParsedRequirement[] = [];
  const seen = new Set<string>();
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const type = r.requirementType;
    if (
      typeof type !== "string" ||
      !ALL_REQUIREMENT_TYPES.includes(type as RequirementType)
    ) {
      continue;
    }
    const requirementType = type as RequirementType;
    const slotIndex =
      Number.isInteger(r.slotIndex) && (r.slotIndex as number) >= 1
        ? (r.slotIndex as number)
        : 1;

    const dedupeKey = `${requirementType}:${slotIndex}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const statusRaw = typeof r.status === "string" ? r.status : "none";
    const validStatus = REQUIREMENT_STATUS[requirementType].options.some(
      (o) => o.value === statusRaw,
    );
    const status = validStatus && statusRaw !== "none" ? statusRaw : null;

    const str = (v: unknown) =>
      typeof v === "string" && v.trim() ? v.trim() : null;
    const hasContact = requirementType === "recommendation";

    out.push({
      requirementType,
      slotIndex,
      status,
      contactName: hasContact ? str(r.contactName) : null,
      contactInfo: hasContact ? str(r.contactInfo) : null,
      notes: str(r.notes),
    });
  }
  return out;
}

/**
 * Reconcile an application's requirement rows against the submitted set.
 * Submitted requirements are upserted and marked active; any existing row not
 * in the submitted set is marked inactive (its data is preserved so
 * re-checking the requirement restores it).
 */
async function reconcileRequirements(
  applicationId: number,
  submitted: ParsedRequirement[],
) {
  const existing = await db
    .select()
    .from(applicationRequirements)
    .where(eq(applicationRequirements.applicationId, applicationId));

  const existingByKey = new Map(
    existing.map((row) => [`${row.requirementType}:${row.slotIndex}`, row]),
  );
  const submittedKeys = new Set(
    submitted.map((r) => `${r.requirementType}:${r.slotIndex}`),
  );

  for (const req of submitted) {
    const key = `${req.requirementType}:${req.slotIndex}`;
    const match = existingByKey.get(key);
    if (match) {
      await db
        .update(applicationRequirements)
        .set({
          active: true,
          status: req.status,
          contactName: req.contactName,
          contactInfo: req.contactInfo,
          notes: req.notes,
        })
        .where(eq(applicationRequirements.id, match.id));
    } else {
      await db.insert(applicationRequirements).values({
        applicationId,
        requirementType: req.requirementType,
        slotIndex: req.slotIndex,
        active: true,
        status: req.status,
        contactName: req.contactName,
        contactInfo: req.contactInfo,
        notes: req.notes,
      });
    }
  }

  // Deactivate rows that are no longer selected, keeping their data.
  for (const row of existing) {
    const key = `${row.requirementType}:${row.slotIndex}`;
    if (!submittedKeys.has(key) && row.active) {
      await db
        .update(applicationRequirements)
        .set({ active: false })
        .where(eq(applicationRequirements.id, row.id));
    }
  }
}

function revalidateApplicationPages(companyId: number | null) {
  revalidatePath("/applications");
  revalidatePath("/");
  revalidatePath("/companies");
  if (companyId) revalidatePath(`/companies/${companyId}`);
}

export async function createApplication(
  _prevState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const fields = readApplicationFields(formData);
  if (!fields.roleTitle) {
    return { error: "Role title is required." };
  }

  const [created] = await db
    .insert(applications)
    .values(fields)
    .returning({ id: applications.id });

  if (created) {
    await reconcileRequirements(created.id, readRequirements(formData));
  }

  const newBadges = await checkBadges();
  revalidateApplicationPages(fields.companyId);
  return { error: null, success: true, newBadges };
}

export async function updateApplication(
  id: number,
  _prevState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const fields = readApplicationFields(formData);
  if (!fields.roleTitle) {
    return { error: "Role title is required." };
  }

  // If the resume changed (replaced or removed), clean up the old blob.
  const [existing] = await db
    .select({ resumeUrl: applications.resumeUrl })
    .from(applications)
    .where(eq(applications.id, id));

  await db.update(applications).set(fields).where(eq(applications.id, id));

  await reconcileRequirements(id, readRequirements(formData));

  if (existing?.resumeUrl && existing.resumeUrl !== fields.resumeUrl) {
    await deleteResume(existing.resumeUrl);
  }

  const newBadges = await checkBadges();
  revalidateApplicationPages(fields.companyId);
  return { error: null, success: true, newBadges };
}

export async function deleteApplication(id: number): Promise<void> {
  const [deleted] = await db
    .delete(applications)
    .where(eq(applications.id, id))
    .returning({
      companyId: applications.companyId,
      resumeUrl: applications.resumeUrl,
    });

  // Remove the associated resume file so orphans don't accumulate.
  if (deleted?.resumeUrl) await deleteResume(deleted.resumeUrl);

  revalidateApplicationPages(deleted?.companyId ?? null);
}

export async function updateApplicationStatus(
  id: number,
  status: string,
): Promise<string[]> {
  if (!isStatus(status)) return [];

  const [updated] = await db
    .update(applications)
    .set({ status })
    .where(eq(applications.id, id))
    .returning({ companyId: applications.companyId });

  const newBadges = await checkBadges();
  revalidateApplicationPages(updated?.companyId ?? null);
  return newBadges;
}

const SNOOZE_PRESETS = {
  "1w": { days: 7 },
  "2w": { days: 14 },
  "1mo": { months: 1 },
  "3mo": { months: 3 },
} as const;

export type SnoozePreset = keyof typeof SNOOZE_PRESETS;

/** Push an application's reminder out by a preset amount from today. */
export async function snoozeApplication(
  id: number,
  preset: SnoozePreset,
): Promise<void> {
  const spec = SNOOZE_PRESETS[preset];
  if (!spec) return;

  const d = new Date();
  if ("days" in spec) d.setUTCDate(d.getUTCDate() + spec.days);
  else d.setUTCMonth(d.getUTCMonth() + spec.months);
  const snoozedUntil = d.toISOString().slice(0, 10);

  const [updated] = await db
    .update(applications)
    .set({ snoozedUntil })
    .where(eq(applications.id, id))
    .returning({ companyId: applications.companyId });

  revalidateApplicationPages(updated?.companyId ?? null);
}

/** Clear a snooze so the reminder returns to the dashboard. */
export async function unsnoozeApplication(id: number): Promise<void> {
  const [updated] = await db
    .update(applications)
    .set({ snoozedUntil: null })
    .where(eq(applications.id, id))
    .returning({ companyId: applications.companyId });

  revalidateApplicationPages(updated?.companyId ?? null);
}

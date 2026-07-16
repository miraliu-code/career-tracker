"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { skillHoursLog, skills } from "@/db/schema";
import {
  DEFAULT_STATUS,
  SKILL_SECTIONS,
  SKILL_TYPES,
  STATUS_OPTIONS,
  type SkillSection,
  type SkillType,
} from "@/lib/learning";

export type SkillFormState = {
  error: string | null;
  success?: boolean;
};

function isSection(value: string): value is SkillSection {
  return (SKILL_SECTIONS as readonly string[]).includes(value);
}

function isSkillType(value: string): value is SkillType {
  return (SKILL_TYPES as readonly string[]).includes(value);
}

function isValidStatus(type: SkillType, value: string): boolean {
  return STATUS_OPTIONS[type].some((o) => o.value === value);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function readSkillFields(formData: FormData) {
  const optional = (field: string) => {
    const value = (formData.get(field) as string | null)?.trim();
    return value ? value : null;
  };

  const sectionRaw = optional("section");
  const typeRaw = optional("skillType");
  const skillType: SkillType =
    typeRaw && isSkillType(typeRaw) ? typeRaw : "build";
  const section: SkillSection =
    sectionRaw && isSection(sectionRaw) ? sectionRaw : "additional";

  const statusRaw = optional("status");
  const status =
    statusRaw && isValidStatus(skillType, statusRaw)
      ? statusRaw
      : DEFAULT_STATUS[skillType];

  const intOrNull = (field: string) => {
    const raw = optional(field);
    const n = raw === null ? NaN : Number(raw);
    return Number.isInteger(n) && n >= 0 ? n : null;
  };

  const completedAtRaw = optional("completedAt");
  const completedAt =
    completedAtRaw && /^\d{4}-\d{2}-\d{2}$/.test(completedAtRaw)
      ? completedAtRaw
      : null;

  return {
    name: optional("name") ?? "",
    section,
    skillType,
    learningNotes: optional("learningNotes"),
    proof: optional("proof"),
    proofUrl: optional("proofUrl"),
    status,
    // Certs record completion by date; a cert marked earned but missing a date
    // defaults to today so the earned badge always shows when it happened.
    targetHours: skillType === "build" ? intOrNull("targetHours") : null,
    completedAt:
      skillType === "certification"
        ? status === "earned"
          ? (completedAt ?? todayStr())
          : completedAt
        : null,
    resources: optional("resources"),
  };
}

function revalidateLearningPages() {
  revalidatePath("/learning");
  revalidatePath("/");
}

export async function createSkill(
  _prevState: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  const fields = readSkillFields(formData);
  if (!fields.name) {
    return { error: "Name is required." };
  }

  // New skills sort to the end of their section/type grouping.
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${skills.sortOrder}), 0)` })
    .from(skills);

  await db.insert(skills).values({ ...fields, sortOrder: max + 1 });

  revalidateLearningPages();
  return { error: null, success: true };
}

export async function updateSkill(
  id: number,
  _prevState: SkillFormState,
  formData: FormData,
): Promise<SkillFormState> {
  const fields = readSkillFields(formData);
  if (!fields.name) {
    return { error: "Name is required." };
  }

  await db.update(skills).set(fields).where(eq(skills.id, id));

  revalidateLearningPages();
  return { error: null, success: true };
}

export async function deleteSkill(id: number): Promise<void> {
  await db.delete(skills).where(eq(skills.id, id));
  revalidateLearningPages();
}

/** Quick status change from a card (validated against the skill's type). */
export async function updateSkillStatus(
  id: number,
  status: string,
): Promise<void> {
  const [skill] = await db
    .select({ skillType: skills.skillType })
    .from(skills)
    .where(eq(skills.id, id));
  if (!skill) return;
  const type = skill.skillType as SkillType;
  if (!isValidStatus(type, status)) return;

  // Keep completedAt in sync when a certification is (un)earned.
  const patch: { status: string; completedAt?: string | null } = { status };
  if (type === "certification") {
    patch.completedAt = status === "earned" ? todayStr() : null;
  }

  await db.update(skills).set(patch).where(eq(skills.id, id));
  revalidateLearningPages();
}

/** Log an increment of hours against a skill and bump its running total. */
export async function logHours(
  id: number,
  hours: number,
  note?: string,
): Promise<void> {
  const amount = Math.trunc(Number(hours));
  if (!Number.isFinite(amount) || amount <= 0) return;

  const trimmedNote = note?.trim() ? note.trim() : null;

  await db.insert(skillHoursLog).values({
    skillId: id,
    hours: amount,
    loggedOn: todayStr(),
    note: trimmedNote,
  });
  await db
    .update(skills)
    .set({ hoursLogged: sql`${skills.hoursLogged} + ${amount}` })
    .where(eq(skills.id, id));

  revalidateLearningPages();
}

/** Inline edit of the fields that change most often. */
export async function updateLearningProof(
  id: number,
  values: { learningNotes: string; proof: string; proofUrl: string },
): Promise<void> {
  const clean = (v: string) => (v.trim() ? v.trim() : null);
  await db
    .update(skills)
    .set({
      learningNotes: clean(values.learningNotes),
      proof: clean(values.proof),
      proofUrl: clean(values.proofUrl),
    })
    .where(eq(skills.id, id));
  revalidateLearningPages();
}

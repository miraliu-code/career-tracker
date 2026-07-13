"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { interviews } from "@/db/schema";

export type InterviewFormState = {
  error: string | null;
  success?: boolean;
};

const FORMATS = [
  "behavioral",
  "case",
  "technical",
  "presentation",
  "other",
] as const;
type Format = (typeof FORMATS)[number];

const OUTCOMES = ["pending", "passed", "rejected"] as const;
type Outcome = (typeof OUTCOMES)[number];

function readInterviewFields(formData: FormData) {
  const optional = (field: string) => {
    const value = (formData.get(field) as string | null)?.trim();
    return value ? value : null;
  };
  const format = optional("format");
  const outcome = optional("outcome");
  const date = optional("interviewDate");

  return {
    round: optional("round"),
    interviewDate: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
    interviewerName: optional("interviewerName"),
    interviewerRole: optional("interviewerRole"),
    format:
      format && FORMATS.includes(format as Format) ? (format as Format) : null,
    outcome:
      outcome && OUTCOMES.includes(outcome as Outcome)
        ? (outcome as Outcome)
        : ("pending" as const),
    questionsAsked: optional("questionsAsked"),
    howItWent: optional("howItWent"),
    lessonsLearned: optional("lessonsLearned"),
  };
}

export async function createInterview(
  applicationId: number,
  _prevState: InterviewFormState,
  formData: FormData,
): Promise<InterviewFormState> {
  const fields = readInterviewFields(formData);
  await db.insert(interviews).values({ applicationId, ...fields });
  revalidatePath("/applications");
  revalidatePath("/");
  return { error: null, success: true };
}

export async function updateInterview(
  id: number,
  _prevState: InterviewFormState,
  formData: FormData,
): Promise<InterviewFormState> {
  const fields = readInterviewFields(formData);
  await db.update(interviews).set(fields).where(eq(interviews.id, id));
  revalidatePath("/applications");
  revalidatePath("/");
  return { error: null, success: true };
}

export async function deleteInterview(id: number): Promise<void> {
  await db.delete(interviews).where(eq(interviews.id, id));
  revalidatePath("/applications");
  revalidatePath("/");
}

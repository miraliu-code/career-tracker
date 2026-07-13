"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { applications } from "@/db/schema";
import { deleteResume } from "@/lib/resume-storage";

export type ApplicationFormState = {
  error: string | null;
  success?: boolean;
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

  await db.insert(applications).values(fields);

  revalidateApplicationPages(fields.companyId);
  return { error: null, success: true };
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

  if (existing?.resumeUrl && existing.resumeUrl !== fields.resumeUrl) {
    await deleteResume(existing.resumeUrl);
  }

  revalidateApplicationPages(fields.companyId);
  return { error: null, success: true };
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
): Promise<void> {
  if (!isStatus(status)) return;

  const [updated] = await db
    .update(applications)
    .set({ status })
    .where(eq(applications.id, id))
    .returning({ companyId: applications.companyId });

  revalidateApplicationPages(updated?.companyId ?? null);
}

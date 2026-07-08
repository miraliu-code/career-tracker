"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { fundingPrograms } from "@/db/schema";

export type FundingFormState = {
  error: string | null;
  success?: boolean;
};

const FUNDING_TYPES = ["scholarship", "fellowship"] as const;
type FundingType = (typeof FUNDING_TYPES)[number];

const FUNDING_STATUSES = [
  "not_started",
  "applied",
  "interviewing",
  "awarded",
  "rejected",
] as const;
type FundingStatus = (typeof FUNDING_STATUSES)[number];

function isStatus(value: string): value is FundingStatus {
  return (FUNDING_STATUSES as readonly string[]).includes(value);
}

function readFundingFields(formData: FormData) {
  const optional = (field: string) => {
    const value = (formData.get(field) as string | null)?.trim();
    return value ? value : null;
  };

  const type = optional("type");
  const status = optional("status");
  const deadline = optional("deadline");

  const amountRaw = optional("amount");
  const amountParsed = amountRaw === null ? NaN : Number(amountRaw);
  const amount =
    Number.isInteger(amountParsed) && amountParsed >= 0 ? amountParsed : null;

  const tags = (optional("eligibilityTags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    name: optional("name") ?? "",
    type:
      type && FUNDING_TYPES.includes(type as FundingType)
        ? (type as FundingType)
        : null,
    amount,
    deadline: deadline && /^\d{4}-\d{2}-\d{2}$/.test(deadline) ? deadline : null,
    status: status && isStatus(status) ? status : ("not_started" as const),
    eligibilityTags: tags.length > 0 ? tags : null,
    notes: optional("notes"),
  };
}

function revalidateFundingPages() {
  revalidatePath("/funding");
  revalidatePath("/");
}

export async function createFundingProgram(
  _prevState: FundingFormState,
  formData: FormData,
): Promise<FundingFormState> {
  const fields = readFundingFields(formData);
  if (!fields.name) {
    return { error: "Name is required." };
  }

  await db.insert(fundingPrograms).values(fields);

  revalidateFundingPages();
  return { error: null, success: true };
}

export async function updateFundingProgram(
  id: number,
  _prevState: FundingFormState,
  formData: FormData,
): Promise<FundingFormState> {
  const fields = readFundingFields(formData);
  if (!fields.name) {
    return { error: "Name is required." };
  }

  await db
    .update(fundingPrograms)
    .set(fields)
    .where(eq(fundingPrograms.id, id));

  revalidateFundingPages();
  return { error: null, success: true };
}

export async function deleteFundingProgram(id: number): Promise<void> {
  await db.delete(fundingPrograms).where(eq(fundingPrograms.id, id));
  revalidateFundingPages();
}

export async function updateFundingStatus(
  id: number,
  status: string,
): Promise<void> {
  if (!isStatus(status)) return;

  await db
    .update(fundingPrograms)
    .set({ status })
    .where(eq(fundingPrograms.id, id));

  revalidateFundingPages();
}

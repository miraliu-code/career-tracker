"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { applications, companies, contacts } from "@/db/schema";

export type CompanyFormState = {
  error: string | null;
};

const DREAM_TIERS = ["A", "B", "C"] as const;
type DreamTier = (typeof DREAM_TIERS)[number];

function readCompanyFields(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const optional = (field: string) => {
    const value = (formData.get(field) as string | null)?.trim();
    return value ? value : null;
  };
  const tier = optional("dreamTier");
  return {
    name,
    industry: optional("industry"),
    hqLocation: optional("hqLocation"),
    dreamTier:
      tier && DREAM_TIERS.includes(tier as DreamTier)
        ? (tier as DreamTier)
        : null,
    notes: optional("notes"),
  };
}

export async function createCompany(
  _prevState: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const fields = readCompanyFields(formData);
  if (!fields.name) {
    return { error: "Name is required." };
  }

  await db.insert(companies).values(fields);

  revalidatePath("/companies");
  redirect("/companies");
}

export async function updateCompany(
  id: number,
  _prevState: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const fields = readCompanyFields(formData);
  if (!fields.name) {
    return { error: "Name is required." };
  }

  await db.update(companies).set(fields).where(eq(companies.id, id));

  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  redirect(`/companies/${id}`);
}

export async function deleteCompany(id: number): Promise<void> {
  // Detach linked rows instead of blocking: they keep existing but their
  // company_id becomes null (the FK has no ON DELETE rule, so deleting
  // without this would fail).
  await db
    .update(applications)
    .set({ companyId: null })
    .where(eq(applications.companyId, id));
  await db
    .update(contacts)
    .set({ companyId: null })
    .where(eq(contacts.companyId, id));
  await db.delete(companies).where(eq(companies.id, id));

  revalidatePath("/companies");
  revalidatePath("/");
  redirect("/companies");
}

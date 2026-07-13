"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { contacts } from "@/db/schema";

export type ContactFormState = {
  error: string | null;
  success?: boolean;
};

const CONNECTION_TYPES = [
  "alum",
  "recruiter",
  "mentor",
  "colleague",
  "peer",
  "other",
] as const;
type ConnectionType = (typeof CONNECTION_TYPES)[number];

function readContactFields(formData: FormData) {
  const optional = (field: string) => {
    const value = (formData.get(field) as string | null)?.trim();
    return value ? value : null;
  };
  const optionalDate = (field: string) => {
    const value = optional(field);
    return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
  };

  const companyIdRaw = optional("companyId");
  const connectionType = optional("connectionType");

  return {
    name: optional("name") ?? "",
    companyId:
      companyIdRaw && Number.isInteger(Number(companyIdRaw))
        ? Number(companyIdRaw)
        : null,
    role: optional("role"),
    connectionType:
      connectionType &&
      CONNECTION_TYPES.includes(connectionType as ConnectionType)
        ? (connectionType as ConnectionType)
        : null,
    lastContactDate: optionalDate("lastContactDate"),
    nextFollowupDate: optionalDate("nextFollowupDate"),
    primaryContact: optional("primaryContact"),
    secondaryContact: optional("secondaryContact"),
    linkedinUrl: optional("linkedinUrl"),
    notes: optional("notes"),
  };
}

function revalidateContactPages(companyId: number | null) {
  revalidatePath("/contacts");
  revalidatePath("/");
  if (companyId) revalidatePath(`/companies/${companyId}`);
}

export async function createContact(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const fields = readContactFields(formData);
  if (!fields.name) {
    return { error: "Name is required." };
  }

  await db.insert(contacts).values(fields);

  revalidateContactPages(fields.companyId);
  return { error: null, success: true };
}

export async function updateContact(
  id: number,
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const fields = readContactFields(formData);
  if (!fields.name) {
    return { error: "Name is required." };
  }

  await db.update(contacts).set(fields).where(eq(contacts.id, id));

  revalidateContactPages(fields.companyId);
  return { error: null, success: true };
}

export async function deleteContact(id: number): Promise<void> {
  const [deleted] = await db
    .delete(contacts)
    .where(eq(contacts.id, id))
    .returning({ companyId: contacts.companyId });

  revalidateContactPages(deleted?.companyId ?? null);
}

export async function markContactedToday(id: number): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);

  const [updated] = await db
    .update(contacts)
    .set({ lastContactDate: today })
    .where(eq(contacts.id, id))
    .returning({ companyId: contacts.companyId });

  revalidateContactPages(updated?.companyId ?? null);
}

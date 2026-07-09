"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { events } from "@/db/schema";

export type EventFormState = {
  error: string | null;
  success?: boolean;
};

const EVENT_CATEGORIES = [
  "case_competition",
  "conference",
  "pipeline_program",
] as const;
type EventCategory = (typeof EVENT_CATEGORIES)[number];

const EVENT_STATUSES = [
  "not_started",
  "applied",
  "accepted",
  "attending",
  "completed",
] as const;
type EventStatus = (typeof EVENT_STATUSES)[number];

function isStatus(value: string): value is EventStatus {
  return (EVENT_STATUSES as readonly string[]).includes(value);
}

function readEventFields(formData: FormData) {
  const optional = (field: string) => {
    const value = (formData.get(field) as string | null)?.trim();
    return value ? value : null;
  };

  const category = optional("category");
  const status = optional("status");
  const deadline = optional("deadline");

  return {
    name: optional("name") ?? "",
    category:
      category && EVENT_CATEGORIES.includes(category as EventCategory)
        ? (category as EventCategory)
        : null,
    organization: optional("organization"),
    deadline: deadline && /^\d{4}-\d{2}-\d{2}$/.test(deadline) ? deadline : null,
    location: optional("location"),
    status: status && isStatus(status) ? status : ("not_started" as const),
    notes: optional("notes"),
  };
}

function revalidateEventPages() {
  revalidatePath("/events");
}

export async function createEvent(
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const fields = readEventFields(formData);
  if (!fields.name) {
    return { error: "Name is required." };
  }

  await db.insert(events).values(fields);

  revalidateEventPages();
  return { error: null, success: true };
}

export async function updateEvent(
  id: number,
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const fields = readEventFields(formData);
  if (!fields.name) {
    return { error: "Name is required." };
  }

  await db.update(events).set(fields).where(eq(events.id, id));

  revalidateEventPages();
  return { error: null, success: true };
}

export async function deleteEvent(id: number): Promise<void> {
  await db.delete(events).where(eq(events.id, id));
  revalidateEventPages();
}

export async function updateEventStatus(
  id: number,
  status: string,
): Promise<void> {
  if (!isStatus(status)) return;

  await db.update(events).set({ status }).where(eq(events.id, id));

  revalidateEventPages();
}

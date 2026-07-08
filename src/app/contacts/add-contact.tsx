"use client";

import { useState } from "react";

import { PRIMARY_BUTTON_CLASSES } from "@/components/form";

import { createContact } from "./actions";
import { ContactForm, type CompanyOption } from "./contact-form";

export function AddContact({ companies }: { companies: CompanyOption[] }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={PRIMARY_BUTTON_CLASSES}
      >
        Add Contact
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Add Contact
      </h2>
      <ContactForm
        action={createContact}
        companies={companies}
        submitLabel="Create Contact"
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

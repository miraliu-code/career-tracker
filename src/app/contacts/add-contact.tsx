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
    <div className="w-full rounded-2xl border border-sage/30 border-l-[3px] border-l-rose bg-white p-6 shadow-soft">
      <h2 className="mb-4 text-base font-semibold text-forest">
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

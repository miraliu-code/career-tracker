"use client";

import { useState } from "react";

import { PRIMARY_BUTTON_CLASSES } from "@/components/form";

import { createApplication } from "./actions";
import { ApplicationForm, type CompanyOption } from "./application-form";

export function AddApplication({ companies }: { companies: CompanyOption[] }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={PRIMARY_BUTTON_CLASSES}
      >
        Add Application
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Add Application
      </h2>
      <ApplicationForm
        action={createApplication}
        companies={companies}
        submitLabel="Create Application"
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

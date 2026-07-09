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
    <div className="w-full rounded-2xl border border-sage/30 border-l-[3px] border-l-honey bg-white p-6 shadow-soft">
      <h2 className="mb-4 text-base font-semibold text-forest">
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

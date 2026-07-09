"use client";

import { useState } from "react";

import { PRIMARY_BUTTON_CLASSES } from "@/components/form";

import { createFundingProgram } from "./actions";
import { FundingForm } from "./funding-form";

export function AddFunding() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={PRIMARY_BUTTON_CLASSES}
      >
        Add Funding Program
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-sage/30 bg-white p-6 shadow-soft">
      <h2 className="mb-4 text-base font-semibold text-forest">
        Add Funding Program
      </h2>
      <FundingForm
        action={createFundingProgram}
        submitLabel="Create Funding Program"
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

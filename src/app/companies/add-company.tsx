"use client";

import { useState } from "react";

import { createCompany } from "./actions";
import { CompanyForm } from "./company-form";

export function AddCompany() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-rose px-4 py-2 text-sm font-medium text-cream hover:bg-rose-deep"
      >
        Add Company
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-sage/30 border-l-[3px] border-l-sage-deep bg-white p-6 shadow-soft">
      <h2 className="mb-4 text-base font-semibold text-forest">
        Add Company
      </h2>
      <CompanyForm
        action={createCompany}
        submitLabel="Create Company"
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}

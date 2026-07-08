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
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Add Company
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
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

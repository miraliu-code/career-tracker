"use client";

import { useState } from "react";

import { updateCompany } from "./actions";
import { CompanyForm, type CompanyFormValues } from "./company-form";

export function EditCompany({
  companyId,
  initial,
}: {
  companyId: number;
  initial: CompanyFormValues;
}) {
  const [open, setOpen] = useState(false);
  const action = updateCompany.bind(null, companyId);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Edit
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Edit Company
      </h2>
      <CompanyForm
        action={action}
        initial={initial}
        submitLabel="Save Changes"
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}

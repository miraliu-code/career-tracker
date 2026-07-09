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
        className="rounded-full border border-sage/50 bg-white px-4 py-2 text-sm font-medium text-forest hover:bg-blush/30"
      >
        Edit
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-sage/30 border-l-[3px] border-l-sage-deep bg-white p-6 shadow-soft">
      <h2 className="mb-4 text-base font-semibold text-forest">
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

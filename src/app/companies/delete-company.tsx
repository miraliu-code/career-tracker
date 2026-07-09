"use client";

import { useTransition } from "react";

import { deleteCompany } from "./actions";

export function DeleteCompany({
  companyId,
  companyName,
  linkedApplications,
  linkedContacts,
}: {
  companyId: number;
  companyName: string;
  linkedApplications: number;
  linkedContacts: number;
}) {
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    const linked = linkedApplications + linkedContacts;
    const warning =
      linked > 0
        ? `\n\nWarning: ${linkedApplications} application(s) and ${linkedContacts} contact(s) are linked to this company. They will be kept, but unlinked (their company will be cleared).`
        : "";
    if (
      window.confirm(`Delete "${companyName}"? This cannot be undone.${warning}`)
    ) {
      startTransition(() => deleteCompany(companyId));
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="rounded-xl border border-rose/30 bg-white px-4 py-2 text-sm font-medium text-rose hover:bg-blush/40 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

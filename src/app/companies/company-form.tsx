"use client";

import { useActionState, useEffect } from "react";

import { INPUT_CLASSES } from "@/components/form";

import type { CompanyFormState } from "./actions";

export type CompanyFormValues = {
  name: string;
  industry: string | null;
  hqLocation: string | null;
  dreamTier: string | null;
  notes: string | null;
};

export function CompanyForm({
  action,
  initial,
  submitLabel,
  onCancel,
}: {
  action: (
    prevState: CompanyFormState,
    formData: FormData,
  ) => Promise<CompanyFormState>;
  initial?: CompanyFormValues;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, {
    error: null,
  });

  useEffect(() => {
    if (state.success) onCancel?.();
  }, [state, onCancel]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="company-name"
            className="mb-1 block text-sm font-medium text-forest"
          >
            Name <span className="text-rose">*</span>
          </label>
          <input
            id="company-name"
            name="name"
            required
            defaultValue={initial?.name ?? ""}
            placeholder="e.g. Acme Corp"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label
            htmlFor="company-industry"
            className="mb-1 block text-sm font-medium text-forest"
          >
            Industry
          </label>
          <input
            id="company-industry"
            name="industry"
            defaultValue={initial?.industry ?? ""}
            placeholder="e.g. Consulting"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label
            htmlFor="company-hq"
            className="mb-1 block text-sm font-medium text-forest"
          >
            HQ Location
          </label>
          <input
            id="company-hq"
            name="hqLocation"
            defaultValue={initial?.hqLocation ?? ""}
            placeholder="e.g. Washington, DC"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label
            htmlFor="company-tier"
            className="mb-1 block text-sm font-medium text-forest"
          >
            Dream Tier
          </label>
          <select
            id="company-tier"
            name="dreamTier"
            defaultValue={initial?.dreamTier ?? ""}
            className={INPUT_CLASSES}
          >
            <option value="">No tier</option>
            <option value="A">A — dream company</option>
            <option value="B">B — strong interest</option>
            <option value="C">C — backup</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="company-notes"
            className="mb-1 block text-sm font-medium text-forest"
          >
            Notes
          </label>
          <textarea
            id="company-notes"
            name="notes"
            rows={3}
            defaultValue={initial?.notes ?? ""}
            placeholder="Referrals, deadlines, culture notes…"
            className={INPUT_CLASSES}
          />
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-rose">{state.error}</p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest-soft disabled:opacity-50"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-medium text-sage-deep hover:bg-blush/40"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

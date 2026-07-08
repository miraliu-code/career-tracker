"use client";

import { useActionState } from "react";

import type { CompanyFormState } from "./actions";

const INPUT_CLASSES =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500";

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

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="company-name"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Name <span className="text-red-500">*</span>
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
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

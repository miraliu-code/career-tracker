"use client";

import { useActionState, useEffect } from "react";

import {
  INPUT_CLASSES,
  LABEL_CLASSES,
  PRIMARY_BUTTON_CLASSES,
  SECONDARY_BUTTON_CLASSES,
} from "@/components/form";

import type { FundingFormState } from "./actions";

export type FundingFormValues = {
  name: string;
  type: string | null;
  amount: number | null;
  deadline: string | null;
  status: string;
  eligibilityTags: string[] | null;
  notes: string | null;
};

export function FundingForm({
  action,
  initial,
  submitLabel,
  onClose,
}: {
  action: (
    prevState: FundingFormState,
    formData: FormData,
  ) => Promise<FundingFormState>;
  initial?: FundingFormValues;
  submitLabel: string;
  onClose?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, {
    error: null,
  });

  useEffect(() => {
    if (state.success) onClose?.();
  }, [state, onClose]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="funding-name" className={LABEL_CLASSES}>
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="funding-name"
            name="name"
            required
            defaultValue={initial?.name ?? ""}
            placeholder="e.g. NSF Graduate Research Fellowship"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="funding-type" className={LABEL_CLASSES}>
            Type
          </label>
          <select
            id="funding-type"
            name="type"
            defaultValue={initial?.type ?? ""}
            className={INPUT_CLASSES}
          >
            <option value="">Not specified</option>
            <option value="scholarship">Scholarship</option>
            <option value="fellowship">Fellowship</option>
          </select>
        </div>

        <div>
          <label htmlFor="funding-amount" className={LABEL_CLASSES}>
            Amount (USD)
          </label>
          <input
            id="funding-amount"
            name="amount"
            type="number"
            min={0}
            step={1}
            defaultValue={initial?.amount ?? ""}
            placeholder="e.g. 10000"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="funding-deadline" className={LABEL_CLASSES}>
            Deadline
          </label>
          <input
            id="funding-deadline"
            name="deadline"
            type="date"
            defaultValue={initial?.deadline ?? ""}
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="funding-status" className={LABEL_CLASSES}>
            Status
          </label>
          <select
            id="funding-status"
            name="status"
            defaultValue={initial?.status ?? "not_started"}
            className={INPUT_CLASSES}
          >
            <option value="not_started">Not started</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="awarded">Awarded</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="funding-tags" className={LABEL_CLASSES}>
            Eligibility Tags{" "}
            <span className="font-normal text-zinc-400 dark:text-zinc-500">
              (comma-separated)
            </span>
          </label>
          <input
            id="funding-tags"
            name="eligibilityTags"
            defaultValue={initial?.eligibilityTags?.join(", ") ?? ""}
            placeholder="e.g. stem, undergraduate, dc-area"
            className={INPUT_CLASSES}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="funding-notes" className={LABEL_CLASSES}>
            Notes
          </label>
          <textarea
            id="funding-notes"
            name="notes"
            rows={3}
            defaultValue={initial?.notes ?? ""}
            placeholder="Essay requirements, references, disbursement details…"
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
          className={PRIMARY_BUTTON_CLASSES}
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={SECONDARY_BUTTON_CLASSES}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

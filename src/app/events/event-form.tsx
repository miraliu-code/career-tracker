"use client";

import { useActionState, useEffect } from "react";

import { announceBadges } from "@/lib/badge-events";

import {
  INPUT_CLASSES,
  LABEL_CLASSES,
  PRIMARY_BUTTON_CLASSES,
  SECONDARY_BUTTON_CLASSES,
} from "@/components/form";

import type { EventFormState } from "./actions";

export type EventFormValues = {
  name: string;
  category: string | null;
  organization: string | null;
  deadline: string | null;
  location: string | null;
  status: string;
  notes: string | null;
};

export function EventForm({
  action,
  initial,
  submitLabel,
  onClose,
}: {
  action: (
    prevState: EventFormState,
    formData: FormData,
  ) => Promise<EventFormState>;
  initial?: EventFormValues;
  submitLabel: string;
  onClose?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, {
    error: null,
  });

  useEffect(() => {
    if (state.success) {
      announceBadges(state.newBadges);
      onClose?.();
    }
  }, [state, onClose]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="event-name" className={LABEL_CLASSES}>
            Name <span className="text-rose">*</span>
          </label>
          <input
            id="event-name"
            name="name"
            required
            defaultValue={initial?.name ?? ""}
            placeholder="e.g. National Case Competition"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="event-category" className={LABEL_CLASSES}>
            Category
          </label>
          <select
            id="event-category"
            name="category"
            defaultValue={initial?.category ?? ""}
            className={INPUT_CLASSES}
          >
            <option value="">Not specified</option>
            <option value="case_competition">Case competition</option>
            <option value="conference">Conference</option>
            <option value="pipeline_program">Pipeline program</option>
          </select>
        </div>

        <div>
          <label htmlFor="event-organization" className={LABEL_CLASSES}>
            Organization
          </label>
          <input
            id="event-organization"
            name="organization"
            defaultValue={initial?.organization ?? ""}
            placeholder="e.g. McKinsey & Company"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="event-deadline" className={LABEL_CLASSES}>
            Deadline
          </label>
          <input
            id="event-deadline"
            name="deadline"
            type="date"
            defaultValue={initial?.deadline ?? ""}
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="event-location" className={LABEL_CLASSES}>
            Location
          </label>
          <input
            id="event-location"
            name="location"
            defaultValue={initial?.location ?? ""}
            placeholder="e.g. Washington, DC or Virtual"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="event-status" className={LABEL_CLASSES}>
            Status
          </label>
          <select
            id="event-status"
            name="status"
            defaultValue={initial?.status ?? "not_started"}
            className={INPUT_CLASSES}
          >
            <option value="not_started">Not started</option>
            <option value="applied">Applied</option>
            <option value="accepted">Accepted</option>
            <option value="attending">Attending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="event-notes" className={LABEL_CLASSES}>
            Notes
          </label>
          <textarea
            id="event-notes"
            name="notes"
            rows={3}
            defaultValue={initial?.notes ?? ""}
            placeholder="Application requirements, travel plans, team members…"
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

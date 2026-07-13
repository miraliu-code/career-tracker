"use client";

import { useActionState, useEffect } from "react";

import {
  INPUT_CLASSES,
  LABEL_CLASSES,
  PRIMARY_BUTTON_CLASSES,
  SECONDARY_BUTTON_CLASSES,
} from "@/components/form";

import type { ContactFormState } from "./actions";

export type CompanyOption = {
  id: number;
  name: string;
};

export type ContactFormValues = {
  companyId: number | null;
  name: string;
  role: string | null;
  connectionType: string | null;
  lastContactDate: string | null;
  nextFollowupDate: string | null;
  primaryContact: string | null;
  secondaryContact: string | null;
  linkedinUrl: string | null;
  notes: string | null;
};

export function ContactForm({
  action,
  initial,
  companies,
  submitLabel,
  onClose,
}: {
  action: (
    prevState: ContactFormState,
    formData: FormData,
  ) => Promise<ContactFormState>;
  initial?: ContactFormValues;
  companies: CompanyOption[];
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
          <label htmlFor="contact-name" className={LABEL_CLASSES}>
            Name <span className="text-rose">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            required
            defaultValue={initial?.name ?? ""}
            placeholder="e.g. Jordan Lee"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="contact-company" className={LABEL_CLASSES}>
            Company
          </label>
          <select
            id="contact-company"
            name="companyId"
            defaultValue={initial?.companyId ?? ""}
            className={INPUT_CLASSES}
          >
            <option value="">No company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="contact-role" className={LABEL_CLASSES}>
            Role
          </label>
          <input
            id="contact-role"
            name="role"
            defaultValue={initial?.role ?? ""}
            placeholder="e.g. University Recruiter"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="contact-connection" className={LABEL_CLASSES}>
            Connection Type
          </label>
          <select
            id="contact-connection"
            name="connectionType"
            defaultValue={initial?.connectionType ?? ""}
            className={INPUT_CLASSES}
          >
            <option value="">Not specified</option>
            <option value="alum">Alum</option>
            <option value="recruiter">Recruiter</option>
            <option value="mentor">Mentor</option>
            <option value="colleague">Colleague</option>
            <option value="peer">Peer</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="contact-linkedin" className={LABEL_CLASSES}>
            LinkedIn URL
          </label>
          <input
            id="contact-linkedin"
            name="linkedinUrl"
            type="url"
            defaultValue={initial?.linkedinUrl ?? ""}
            placeholder="https://linkedin.com/in/…"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="contact-last" className={LABEL_CLASSES}>
            Last Contact Date
          </label>
          <input
            id="contact-last"
            name="lastContactDate"
            type="date"
            defaultValue={initial?.lastContactDate ?? ""}
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="contact-next" className={LABEL_CLASSES}>
            Next Follow-Up Date
          </label>
          <input
            id="contact-next"
            name="nextFollowupDate"
            type="date"
            defaultValue={initial?.nextFollowupDate ?? ""}
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="contact-primary" className={LABEL_CLASSES}>
            Primary Contact
          </label>
          <input
            id="contact-primary"
            name="primaryContact"
            defaultValue={initial?.primaryContact ?? ""}
            placeholder="email or phone number"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="contact-secondary" className={LABEL_CLASSES}>
            Secondary Contact
          </label>
          <input
            id="contact-secondary"
            name="secondaryContact"
            defaultValue={initial?.secondaryContact ?? ""}
            placeholder="email or phone number"
            className={INPUT_CLASSES}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="contact-notes" className={LABEL_CLASSES}>
            Notes
          </label>
          <textarea
            id="contact-notes"
            name="notes"
            rows={3}
            defaultValue={initial?.notes ?? ""}
            placeholder="How you met, what to follow up about…"
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

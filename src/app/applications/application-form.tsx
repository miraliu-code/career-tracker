"use client";

import { useActionState, useEffect, useState } from "react";

import { announceBadges } from "@/lib/badge-events";
import { companionReact } from "@/lib/companion-events";

import { MascotSpinner } from "@/components/mascot-spinner";
import {
  INPUT_CLASSES,
  LABEL_CLASSES,
  PRIMARY_BUTTON_CLASSES,
  SECONDARY_BUTTON_CLASSES,
} from "@/components/form";

import type { ApplicationFormState } from "./actions";
import { ResumeUpload } from "./resume-upload";
import {
  ApplicationNotesSection,
  RequirementsProvider,
  RequiresControl,
} from "./application-requirements";
import type { RequirementRow } from "@/lib/requirements";

export type CompanyOption = {
  id: number;
  name: string;
};

export type ApplicationFormValues = {
  companyId: number | null;
  roleTitle: string;
  type: string | null;
  location: string | null;
  deadline: string | null;
  status: string;
  resumeUrl: string | null;
  resumeFilename: string | null;
  notes: string | null;
  whyInterested: string | null;
  myPitch: string | null;
  questionsToAsk: string | null;
};

export function ApplicationForm({
  action,
  initial,
  companies,
  submitLabel,
  onClose,
  confirmEntity,
  requirements,
}: {
  action: (
    prevState: ApplicationFormState,
    formData: FormData,
  ) => Promise<ApplicationFormState>;
  initial?: ApplicationFormValues;
  companies: CompanyOption[];
  submitLabel: string;
  onClose?: () => void;
  confirmEntity?: "application";
  requirements?: RequirementRow[];
}) {
  const [state, formAction, pending] = useActionState(action, {
    error: null,
  });
  const hasPrep = Boolean(
    initial?.whyInterested || initial?.myPitch || initial?.questionsToAsk,
  );
  const [prepOpen, setPrepOpen] = useState(hasPrep);

  useEffect(() => {
    if (state.success) {
      announceBadges(state.newBadges);
      if (confirmEntity) companionReact({ kind: "confirm", entity: confirmEntity });
      onClose?.();
    }
  }, [state, onClose, confirmEntity]);

  return (
    <form action={formAction} className="space-y-4">
      <RequirementsProvider initial={requirements ?? []}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="app-role" className={LABEL_CLASSES}>
            Role Title <span className="text-rose">*</span>
          </label>
          <input
            id="app-role"
            name="roleTitle"
            required
            defaultValue={initial?.roleTitle ?? ""}
            placeholder="e.g. Software Engineer Intern"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="app-company" className={LABEL_CLASSES}>
            Company
          </label>
          <select
            id="app-company"
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
          <label htmlFor="app-type" className={LABEL_CLASSES}>
            Type
          </label>
          <select
            id="app-type"
            name="type"
            defaultValue={initial?.type ?? ""}
            className={INPUT_CLASSES}
          >
            <option value="">Not specified</option>
            <option value="internship">Internship</option>
            <option value="new_grad">New grad</option>
          </select>
        </div>

        <div>
          <label htmlFor="app-location" className={LABEL_CLASSES}>
            Location
          </label>
          <input
            id="app-location"
            name="location"
            defaultValue={initial?.location ?? ""}
            placeholder="e.g. New York, NY"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="app-deadline" className={LABEL_CLASSES}>
            Deadline
          </label>
          <input
            id="app-deadline"
            name="deadline"
            type="date"
            defaultValue={initial?.deadline ?? ""}
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="app-status" className={LABEL_CLASSES}>
            Status
          </label>
          <select
            id="app-status"
            name="status"
            defaultValue={initial?.status ?? "not_started"}
            className={INPUT_CLASSES}
          >
            <option value="not_started">Not started</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <RequiresControl />

        <div className="sm:col-span-2">
          <ResumeUpload
            initialUrl={initial?.resumeUrl}
            initialFilename={initial?.resumeFilename}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="app-notes" className={LABEL_CLASSES}>
            Notes
          </label>
          <textarea
            id="app-notes"
            name="notes"
            rows={3}
            defaultValue={initial?.notes ?? ""}
            placeholder="Referral status, interview prep, next steps…"
            className={INPUT_CLASSES}
          />
        </div>
      </div>

      <ApplicationNotesSection />

      {/* Collapsible prep section. Fields stay mounted (just hidden) so
          collapsing never drops their values on submit. */}
      <div className="rounded-xl border border-sage/30 bg-mist/40 p-3">
        <button
          type="button"
          onClick={() => setPrepOpen((v) => !v)}
          aria-expanded={prepOpen}
          className="flex w-full items-center justify-between text-sm font-medium text-forest"
        >
          <span>Prep notes</span>
          <span className="text-xs text-sage-deep">
            {prepOpen ? "Hide" : "Show"}
          </span>
        </button>
        <div className={prepOpen ? "mt-3 space-y-3" : "hidden"}>
          <div>
            <label htmlFor="app-why" className={LABEL_CLASSES}>
              Why I&rsquo;m interested
            </label>
            <textarea
              id="app-why"
              name="whyInterested"
              rows={2}
              defaultValue={initial?.whyInterested ?? ""}
              placeholder="Why this role and company appeal to you…"
              className={INPUT_CLASSES}
            />
          </div>
          <div>
            <label htmlFor="app-pitch" className={LABEL_CLASSES}>
              My pitch
            </label>
            <textarea
              id="app-pitch"
              name="myPitch"
              rows={2}
              defaultValue={initial?.myPitch ?? ""}
              placeholder="Your elevator pitch / positioning for this role…"
              className={INPUT_CLASSES}
            />
          </div>
          <div>
            <label htmlFor="app-questions" className={LABEL_CLASSES}>
              Questions to ask
            </label>
            <textarea
              id="app-questions"
              name="questionsToAsk"
              rows={2}
              defaultValue={initial?.questionsToAsk ?? ""}
              placeholder="Questions you want to ask them…"
              className={INPUT_CLASSES}
            />
          </div>
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
          {pending ? (
            <span className="inline-flex items-center gap-1.5">
              <MascotSpinner /> Saving…
            </span>
          ) : (
            submitLabel
          )}
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
      </RequirementsProvider>
    </form>
  );
}

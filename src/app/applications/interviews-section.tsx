"use client";

import { useActionState, useEffect, useState, useTransition } from "react";

import { announceBadges } from "@/lib/badge-events";

import { INPUT_CLASSES, LABEL_CLASSES } from "@/components/form";
import { MascotSpinner } from "@/components/mascot-spinner";
import { formatDate } from "@/lib/dates";

import {
  createInterview,
  deleteInterview,
  updateInterview,
  type InterviewFormState,
} from "./interview-actions";

export type InterviewRow = {
  id: number;
  applicationId: number;
  round: string | null;
  interviewDate: string | null;
  interviewerName: string | null;
  interviewerRole: string | null;
  format: string | null;
  outcome: string;
  questionsAsked: string | null;
  howItWent: string | null;
  lessonsLearned: string | null;
};

const OUTCOME_LABELS: Record<string, string> = {
  pending: "Pending",
  passed: "Passed",
  rejected: "Rejected",
};

const OUTCOME_STYLES: Record<string, string> = {
  pending: "bg-honey-mist text-honey",
  passed: "bg-moss-mist text-moss",
  rejected: "bg-rose-mist text-rose-deep",
};

const FORMAT_LABELS: Record<string, string> = {
  behavioral: "Behavioral",
  case: "Case",
  technical: "Technical",
  presentation: "Presentation",
  other: "Other",
};

function InterviewForm({
  action,
  initial,
  submitLabel,
  onClose,
}: {
  action: (
    prevState: InterviewFormState,
    formData: FormData,
  ) => Promise<InterviewFormState>;
  initial?: InterviewRow;
  submitLabel: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  useEffect(() => {
    if (state.success) {
      announceBadges(state.newBadges);
      onClose();
    }
  }, [state, onClose]);

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl border border-sage/30 bg-white p-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASSES}>Round</label>
          <input
            name="round"
            defaultValue={initial?.round ?? ""}
            placeholder="e.g. Phone screen, First round, Case, Final"
            className={INPUT_CLASSES}
          />
        </div>
        <div>
          <label className={LABEL_CLASSES}>Date</label>
          <input
            name="interviewDate"
            type="date"
            defaultValue={initial?.interviewDate ?? ""}
            className={INPUT_CLASSES}
          />
        </div>
        <div>
          <label className={LABEL_CLASSES}>Interviewer</label>
          <input
            name="interviewerName"
            defaultValue={initial?.interviewerName ?? ""}
            placeholder="Name"
            className={INPUT_CLASSES}
          />
        </div>
        <div>
          <label className={LABEL_CLASSES}>Interviewer role</label>
          <input
            name="interviewerRole"
            defaultValue={initial?.interviewerRole ?? ""}
            placeholder="e.g. Engineering Manager"
            className={INPUT_CLASSES}
          />
        </div>
        <div>
          <label className={LABEL_CLASSES}>Format</label>
          <select
            name="format"
            defaultValue={initial?.format ?? ""}
            className={INPUT_CLASSES}
          >
            <option value="">Not specified</option>
            <option value="behavioral">Behavioral</option>
            <option value="case">Case</option>
            <option value="technical">Technical</option>
            <option value="presentation">Presentation</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className={LABEL_CLASSES}>Outcome</label>
          <select
            name="outcome"
            defaultValue={initial?.outcome ?? "pending"}
            className={INPUT_CLASSES}
          >
            <option value="pending">Pending</option>
            <option value="passed">Passed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      <div>
        <label className={LABEL_CLASSES}>Questions asked</label>
        <textarea
          name="questionsAsked"
          rows={2}
          defaultValue={initial?.questionsAsked ?? ""}
          placeholder="What they asked you…"
          className={INPUT_CLASSES}
        />
      </div>
      <div>
        <label className={LABEL_CLASSES}>How it went</label>
        <textarea
          name="howItWent"
          rows={2}
          defaultValue={initial?.howItWent ?? ""}
          placeholder="Your read on the conversation…"
          className={INPUT_CLASSES}
        />
      </div>
      <div>
        <label className={LABEL_CLASSES}>Lessons learned</label>
        <textarea
          name="lessonsLearned"
          rows={2}
          defaultValue={initial?.lessonsLearned ?? ""}
          placeholder="What to do differently next time…"
          className={INPUT_CLASSES}
        />
      </div>
      {state.error && <p className="text-sm text-rose">{state.error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-rose px-4 py-1.5 text-sm font-medium text-cream hover:bg-rose-deep disabled:opacity-50"
        >
          {pending ? (
            <span className="inline-flex items-center gap-1.5">
              <MascotSpinner /> Saving…
            </span>
          ) : (
            submitLabel
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-sage/50 bg-white px-4 py-1.5 text-sm font-medium text-sage-deep hover:bg-blush/30"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function InterviewItem({ interview }: { interview: InterviewRow }) {
  const [editing, setEditing] = useState(false);
  const [deletePending, startDelete] = useTransition();

  if (editing) {
    return (
      <li>
        <InterviewForm
          action={updateInterview.bind(null, interview.id)}
          initial={interview}
          submitLabel="Save Interview"
          onClose={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-3 rounded-xl border border-sage/25 bg-white px-3 py-2.5">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-forest">
          <span>{interview.round || "Interview"}</span>
          {interview.format && (
            <span className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-medium text-sage-deep">
              {FORMAT_LABELS[interview.format] ?? interview.format}
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              OUTCOME_STYLES[interview.outcome] ?? OUTCOME_STYLES.pending
            }`}
          >
            {OUTCOME_LABELS[interview.outcome] ?? interview.outcome}
          </span>
        </p>
        <p className="mt-0.5 text-xs text-sage-deep">
          {[
            interview.interviewDate
              ? formatDate(interview.interviewDate)
              : null,
            interview.interviewerName
              ? [interview.interviewerName, interview.interviewerRole]
                  .filter(Boolean)
                  .join(", ")
              : null,
          ]
            .filter(Boolean)
            .join(" · ") || "No date set"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-full px-2.5 py-1 text-xs font-medium text-sage-deep hover:bg-blush/30 hover:text-forest"
        >
          Edit
        </button>
        <button
          type="button"
          disabled={deletePending}
          onClick={() => {
            if (window.confirm("Delete this interview?")) {
              startDelete(() => deleteInterview(interview.id));
            }
          }}
          className="rounded-full px-2.5 py-1 text-xs font-medium text-rose hover:bg-blush/40 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export function InterviewsSection({
  applicationId,
  interviews,
}: {
  applicationId: number;
  interviews: InterviewRow[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="mt-5 border-t border-sage/25 pt-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-forest">
          Interviews{" "}
          <span className="font-normal text-sage">({interviews.length})</span>
        </h4>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-full border border-sage/50 bg-white px-3 py-1 text-xs font-medium text-sage-deep hover:bg-blush/30 hover:text-forest"
          >
            Add interview
          </button>
        )}
      </div>

      {interviews.length > 0 && (
        <ul className="space-y-2">
          {interviews.map((iv) => (
            <InterviewItem key={iv.id} interview={iv} />
          ))}
        </ul>
      )}

      {interviews.length === 0 && !adding && (
        <p className="text-xs text-sage-deep">
          No interviews logged yet.
        </p>
      )}

      {adding && (
        <div className="mt-3">
          <InterviewForm
            action={createInterview.bind(null, applicationId)}
            submitLabel="Add Interview"
            onClose={() => setAdding(false)}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { useActionState, useEffect, useState } from "react";

import { companionReact } from "@/lib/companion-events";
import { MascotSpinner } from "@/components/mascot-spinner";
import {
  INPUT_CLASSES,
  LABEL_CLASSES,
  PRIMARY_BUTTON_CLASSES,
  SECONDARY_BUTTON_CLASSES,
} from "@/components/form";
import {
  DEFAULT_STATUS,
  SECTION_LABELS,
  SKILL_SECTIONS,
  SKILL_TYPES,
  SKILL_TYPE_LABELS,
  STATUS_OPTIONS,
  type SkillSection,
  type SkillType,
} from "@/lib/learning";

import type { SkillFormState } from "./actions";

export type SkillFormValues = {
  name: string;
  section: SkillSection;
  skillType: SkillType;
  learningNotes: string | null;
  proof: string | null;
  proofUrl: string | null;
  status: string;
  targetHours: number | null;
  completedAt: string | null;
  resources: string | null;
};

export function SkillForm({
  action,
  initial,
  submitLabel,
  onClose,
  lockType,
  confirmEntity,
}: {
  action: (
    prevState: SkillFormState,
    formData: FormData,
  ) => Promise<SkillFormState>;
  initial?: SkillFormValues;
  submitLabel: string;
  onClose?: () => void;
  // When editing, the type is fixed (changing it would move the card between
  // sections and orphan type-specific data), so it renders read-only.
  lockType?: boolean;
  confirmEntity?: "skill";
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  const [skillType, setSkillType] = useState<SkillType>(
    initial?.skillType ?? "build",
  );
  const [status, setStatus] = useState<string>(
    initial?.status ?? DEFAULT_STATUS[skillType],
  );

  useEffect(() => {
    if (state.success) {
      if (confirmEntity) companionReact({ kind: "confirm", entity: confirmEntity });
      onClose?.();
    }
  }, [state, onClose, confirmEntity]);

  // When the type changes on a new skill, reset status to that type's default.
  function handleTypeChange(next: SkillType) {
    setSkillType(next);
    setStatus(DEFAULT_STATUS[next]);
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="skillType" value={skillType} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="skill-name" className={LABEL_CLASSES}>
            Name <span className="text-rose">*</span>
          </label>
          <input
            id="skill-name"
            name="name"
            required
            defaultValue={initial?.name ?? ""}
            placeholder="e.g. LBO model from scratch"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="skill-type" className={LABEL_CLASSES}>
            Type
          </label>
          {lockType ? (
            <input
              id="skill-type"
              value={SKILL_TYPE_LABELS[skillType]}
              disabled
              className={`${INPUT_CLASSES} cursor-not-allowed opacity-70`}
            />
          ) : (
            <select
              id="skill-type"
              value={skillType}
              onChange={(e) => handleTypeChange(e.target.value as SkillType)}
              className={INPUT_CLASSES}
            >
              {SKILL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SKILL_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="skill-section" className={LABEL_CLASSES}>
            Section
          </label>
          <select
            id="skill-section"
            name="section"
            defaultValue={initial?.section ?? "financial_modeling"}
            className={INPUT_CLASSES}
          >
            {SKILL_SECTIONS.map((s) => (
              <option key={s} value={s}>
                {SECTION_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="skill-status" className={LABEL_CLASSES}>
            Status
          </label>
          <select
            id="skill-status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={INPUT_CLASSES}
          >
            {STATUS_OPTIONS[skillType].map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {skillType === "build" && (
          <div>
            <label htmlFor="skill-target" className={LABEL_CLASSES}>
              Target hours
            </label>
            <input
              id="skill-target"
              name="targetHours"
              type="number"
              min={0}
              step={1}
              defaultValue={initial?.targetHours ?? ""}
              placeholder="e.g. 40"
              className={INPUT_CLASSES}
            />
          </div>
        )}

        {skillType === "certification" && (
          <div>
            <label htmlFor="skill-completed" className={LABEL_CLASSES}>
              Completed on
            </label>
            <input
              id="skill-completed"
              name="completedAt"
              type="date"
              defaultValue={initial?.completedAt ?? ""}
              className={INPUT_CLASSES}
            />
          </div>
        )}

        <div className="sm:col-span-2">
          <label htmlFor="skill-learning" className={LABEL_CLASSES}>
            Learning{" "}
            <span className="font-normal text-sage">
              (progress, where you are)
            </span>
          </label>
          <textarea
            id="skill-learning"
            name="learningNotes"
            rows={2}
            defaultValue={initial?.learningNotes ?? ""}
            placeholder="What you're working through, blockers, next step…"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="skill-proof" className={LABEL_CLASSES}>
            Proof{" "}
            <span className="font-normal text-sage">(resume artifact)</span>
          </label>
          <input
            id="skill-proof"
            name="proof"
            defaultValue={initial?.proof ?? ""}
            placeholder="e.g. Bloomberg BMC certificate"
            className={INPUT_CLASSES}
          />
        </div>

        <div>
          <label htmlFor="skill-proof-url" className={LABEL_CLASSES}>
            Proof link
          </label>
          <input
            id="skill-proof-url"
            name="proofUrl"
            type="url"
            defaultValue={initial?.proofUrl ?? ""}
            placeholder="https://…"
            className={INPUT_CLASSES}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="skill-resources" className={LABEL_CLASSES}>
            Resources
          </label>
          <textarea
            id="skill-resources"
            name="resources"
            rows={2}
            defaultValue={initial?.resources ?? ""}
            placeholder="Courses, books, links to work through…"
            className={INPUT_CLASSES}
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-rose">{state.error}</p>}

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
    </form>
  );
}

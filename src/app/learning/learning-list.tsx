"use client";

import { useMemo, useState, useTransition } from "react";

import { companionReact } from "@/lib/companion-events";
import { CelebrationBurst } from "@/components/celebration";
import { RandomMascot } from "@/components/mascots";
import { ClockIcon } from "@/components/icons";
import { INPUT_CLASSES, LABEL_CLASSES } from "@/components/form";
import { formatDate } from "@/lib/dates";
import {
  SECTION_HEADING,
  SECTION_LABELS,
  SECTION_PHILOSOPHY,
  STATUS_OPTIONS,
  STATUS_STYLES,
  buildProgressPercent,
  statusLabel,
  type SkillRow,
  type SkillType,
} from "@/lib/learning";

import {
  deleteSkill,
  logHours,
  updateLearningProof,
  updateSkill,
  updateSkillStatus,
} from "./actions";
import { SkillForm, type SkillFormValues } from "./skill-form";

function toFormValues(skill: SkillRow): SkillFormValues {
  return {
    name: skill.name,
    section: skill.section,
    skillType: skill.skillType,
    learningNotes: skill.learningNotes,
    proof: skill.proof,
    proofUrl: skill.proofUrl,
    status: skill.status,
    targetHours: skill.targetHours,
    completedAt: skill.completedAt,
    resources: skill.resources,
  };
}

function SectionTag({ section }: { section: SkillRow["section"] }) {
  return (
    <span className="inline-flex rounded-full bg-mist px-2 py-0.5 text-xs font-medium text-sage-deep">
      {SECTION_LABELS[section]}
    </span>
  );
}

function StatusPill({ type, status }: { type: SkillType; status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STATUS_STYLES[status] ?? STATUS_STYLES.not_started
      }`}
    >
      {statusLabel(type, status)}
    </span>
  );
}

/** Quick status dropdown for builds and habits. */
function QuickStatus({
  id,
  type,
  status,
  onCelebrate,
}: {
  id: number;
  type: SkillType;
  status: string;
  onCelebrate?: () => void;
}) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label="Update status"
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        setValue(next);
        if (next === "complete" || next === "interview_ready") {
          onCelebrate?.();
          companionReact({ kind: "celebrate" });
        }
        startTransition(() => updateSkillStatus(id, next));
      }}
      className={`cursor-pointer rounded-full border-0 py-0.5 pl-2.5 pr-7 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose/40 disabled:opacity-60 ${
        STATUS_STYLES[value] ?? STATUS_STYLES.not_started
      }`}
    >
      {STATUS_OPTIONS[type].map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** "Log hours" / "Log practice" quick-add with an inline amount + note. */
function LogHoursControl({ id, label }: { id: number; label: string }) {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState("1");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full border border-sage/50 bg-white px-2.5 py-1 text-xs font-medium text-sage-deep hover:bg-blush/30 hover:text-forest"
      >
        <ClockIcon className="size-3.5" />
        {label}
      </button>
    );
  }

  const submit = () => {
    const amount = Math.trunc(Number(hours));
    if (!Number.isFinite(amount) || amount <= 0) return;
    startTransition(async () => {
      await logHours(id, amount, note);
      companionReact({ kind: "nod" });
      setOpen(false);
      setHours("1");
      setNote("");
    });
  };

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 rounded-xl border border-sage/40 bg-white p-1.5">
      <input
        type="number"
        min={1}
        step={1}
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        aria-label="Hours"
        className="w-14 rounded-lg border border-sage/50 px-2 py-1 text-xs text-forest focus:border-rose/60 focus:outline-none"
      />
      <span className="text-xs text-sage-deep">hrs</span>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="note (optional)"
        aria-label="Note"
        className="w-32 rounded-lg border border-sage/50 px-2 py-1 text-xs text-forest placeholder:text-sage focus:border-rose/60 focus:outline-none"
      />
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="rounded-full bg-rose px-2.5 py-1 text-xs font-medium text-cream hover:bg-rose-deep disabled:opacity-50"
      >
        {pending ? "Logging…" : "Log"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="rounded-full px-2 py-1 text-xs font-medium text-sage-deep hover:bg-blush/40"
      >
        Cancel
      </button>
    </span>
  );
}

/** Inline-editable Learning + Proof fields (the ones that change most often). */
function InlineLearningProof({ skill }: { skill: SkillRow }) {
  const [learning, setLearning] = useState(skill.learningNotes ?? "");
  const [proof, setProof] = useState(skill.proof ?? "");
  const [proofUrl, setProofUrl] = useState(skill.proofUrl ?? "");
  const [pending, startTransition] = useTransition();

  const dirty =
    learning !== (skill.learningNotes ?? "") ||
    proof !== (skill.proof ?? "") ||
    proofUrl !== (skill.proofUrl ?? "");

  const save = () =>
    startTransition(async () => {
      await updateLearningProof(skill.id, { learningNotes: learning, proof, proofUrl });
      companionReact({ kind: "nod" });
    });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className={LABEL_CLASSES}>Learning</label>
        <textarea
          rows={2}
          value={learning}
          onChange={(e) => setLearning(e.target.value)}
          placeholder="Where you are, next step…"
          className={INPUT_CLASSES}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div>
          <label className={LABEL_CLASSES}>Proof</label>
          <input
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            placeholder="Resume artifact / badge / score"
            className={INPUT_CLASSES}
          />
        </div>
        <div>
          <label className={LABEL_CLASSES}>Proof link</label>
          <input
            type="url"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="https://…"
            className={INPUT_CLASSES}
          />
        </div>
      </div>
      {dirty && (
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="rounded-full bg-forest px-3 py-1 text-xs font-medium text-white hover:bg-forest-soft disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save Learning & Proof"}
          </button>
        </div>
      )}
    </div>
  );
}

function ProofLink({ skill }: { skill: SkillRow }) {
  if (!skill.proof && !skill.proofUrl) return null;
  const text = skill.proof ?? "View proof";
  if (skill.proofUrl) {
    return (
      <a
        href={skill.proofUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-full bg-rose-mist px-2.5 py-0.5 text-xs font-medium text-rose-deep hover:bg-blush"
      >
        {text}
      </a>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-mist px-2.5 py-0.5 text-xs text-sage-deep">
      {text}
    </span>
  );
}

function ResourcesCollapsible({ resources }: { resources: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-sage/25 bg-mist/40 p-2.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-xs font-medium text-forest"
      >
        <span>Resources</span>
        <span className="text-sage-deep">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-sage-deep">
          {resources}
        </p>
      )}
    </div>
  );
}

function CardShell({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <li
      className={`rounded-2xl border border-sage/30 border-l-[3px] bg-white p-4 shadow-soft ${accent}`}
    >
      {children}
    </li>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-sage/50 bg-white px-2.5 py-1 text-xs font-medium text-sage-deep hover:bg-blush/30 hover:text-forest"
    >
      Edit
    </button>
  );
}

function BuildCard({
  skill,
  onEdit,
  onCelebrate,
  celebrating,
  onCelebrateDone,
}: {
  skill: SkillRow;
  onEdit: () => void;
  onCelebrate: () => void;
  celebrating: boolean;
  onCelebrateDone: () => void;
}) {
  const pct = buildProgressPercent(skill.hoursLogged, skill.targetHours);
  return (
    <CardShell accent="border-l-rose">
      <div className="relative flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-medium text-forest">
            <span>{skill.name}</span>
            <SectionTag section={skill.section} />
          </p>
        </div>
        <div className="flex items-center gap-2">
          <QuickStatus
            key={`${skill.id}-${skill.status}`}
            id={skill.id}
            type="build"
            status={skill.status}
            onCelebrate={onCelebrate}
          />
          <EditButton onClick={onEdit} />
        </div>
        {celebrating && <CelebrationBurst onDone={onCelebrateDone} />}
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs text-sage-deep">
          <span className="tabular-nums">
            {skill.hoursLogged}
            {skill.targetHours ? ` / ${skill.targetHours}` : ""} hrs
          </span>
          {skill.targetHours ? <span>{pct}%</span> : null}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-sage/20">
          <div
            className="h-full rounded-full bg-rose transition-[width]"
            style={{ width: `${skill.targetHours ? pct : 0}%` }}
          />
        </div>
        <div className="mt-2">
          <LogHoursControl id={skill.id} label="Log hours" />
        </div>
      </div>

      <div className="mt-4">
        <InlineLearningProof skill={skill} />
      </div>

      {skill.resources && (
        <div className="mt-3">
          <ResourcesCollapsible resources={skill.resources} />
        </div>
      )}
    </CardShell>
  );
}

function CertCard({ skill, onEdit }: { skill: SkillRow; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  const earned = skill.status === "earned";

  const toggle = () =>
    startTransition(async () => {
      const next = earned ? "not_started" : "earned";
      if (!earned) companionReact({ kind: "celebrate" });
      await updateSkillStatus(skill.id, next);
    });

  return (
    <CardShell accent="border-l-honey">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-medium text-forest">
            <span>{skill.name}</span>
            <SectionTag section={skill.section} />
            <StatusPill type="certification" status={skill.status} />
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-sage-deep">
            {earned && skill.completedAt && (
              <span className="tabular-nums">
                Earned {formatDate(skill.completedAt)}
              </span>
            )}
            <ProofLink skill={skill} />
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            disabled={pending}
            aria-pressed={earned}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
              earned
                ? "bg-moss-mist text-moss hover:bg-moss-mist/70"
                : "border border-sage/50 bg-white text-sage-deep hover:bg-blush/30"
            }`}
          >
            <span
              className={`flex size-4 items-center justify-center rounded-full border ${
                earned ? "border-moss bg-moss text-white" : "border-sage/60"
              }`}
            >
              {earned ? "✓" : ""}
            </span>
            {earned ? "Earned" : "Mark earned"}
          </button>
          <EditButton onClick={onEdit} />
        </div>
      </div>
    </CardShell>
  );
}

function HabitCard({ skill, onEdit }: { skill: SkillRow; onEdit: () => void }) {
  return (
    <CardShell accent="border-l-moss">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-medium text-forest">
            <span>{skill.name}</span>
            <SectionTag section={skill.section} />
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-sage-deep">
            <span className="font-semibold tabular-nums text-forest">
              {skill.hoursLogged} hrs
            </span>
            <span>cumulative</span>
            {skill.lastLoggedOn ? (
              <span>· last logged {formatDate(skill.lastLoggedOn)}</span>
            ) : (
              <span>· no practice logged yet</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <QuickStatus
            key={`${skill.id}-${skill.status}`}
            id={skill.id}
            type="habit"
            status={skill.status}
          />
          <EditButton onClick={onEdit} />
        </div>
      </div>

      <div className="mt-3">
        <LogHoursControl id={skill.id} label="Log practice" />
      </div>

      <div className="mt-4">
        <InlineLearningProof skill={skill} />
      </div>
    </CardShell>
  );
}

const TYPE_ACCENT: Record<SkillType, string> = {
  build: "border-l-rose",
  certification: "border-l-honey",
  habit: "border-l-moss",
};

function Section({
  type,
  skills,
  editingId,
  setEditingId,
  celebratingId,
  setCelebratingId,
  mascotSeed,
}: {
  type: SkillType;
  skills: SkillRow[];
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  celebratingId: number | null;
  setCelebratingId: (id: number | null) => void;
  mascotSeed: number;
}) {
  const [deletePending, startDeleteTransition] = useTransition();

  const handleDelete = (skill: SkillRow) => {
    if (window.confirm(`Delete "${skill.name}"? This cannot be undone.`)) {
      startDeleteTransition(async () => {
        await deleteSkill(skill.id);
        setEditingId(null);
      });
    }
  };

  return (
    <section aria-label={SECTION_HEADING[type]}>
      <h2 className="text-lg font-semibold text-forest">
        {SECTION_HEADING[type]}
      </h2>
      <p className="mb-4 text-sm text-sage-deep">{SECTION_PHILOSOPHY[type]}</p>

      {skills.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sage/50 bg-white p-6 text-center">
          <RandomMascot seed={mascotSeed} className="mx-auto mb-2 size-16" />
          <p className="text-sm text-sage-deep">
            No {SECTION_HEADING[type].toLowerCase()} yet.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {skills.map((skill) =>
            editingId === skill.id ? (
              <li
                key={skill.id}
                className={`rounded-2xl border border-sage/30 border-l-[3px] bg-mist/60 p-5 ${TYPE_ACCENT[type]}`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-forest">
                    Edit {SECTION_HEADING[type].replace(/s$/, "")}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleDelete(skill)}
                    disabled={deletePending}
                    className="rounded-full border border-rose/30 bg-white px-3 py-1.5 text-sm font-medium text-rose hover:bg-blush/40 disabled:opacity-50"
                  >
                    {deletePending ? "Deleting…" : "Delete"}
                  </button>
                </div>
                <SkillForm
                  action={updateSkill.bind(null, skill.id)}
                  initial={toFormValues(skill)}
                  submitLabel="Save Changes"
                  lockType
                  onClose={() => setEditingId(null)}
                />
              </li>
            ) : type === "build" ? (
              <BuildCard
                key={skill.id}
                skill={skill}
                onEdit={() => setEditingId(skill.id)}
                onCelebrate={() => setCelebratingId(skill.id)}
                celebrating={celebratingId === skill.id}
                onCelebrateDone={() => setCelebratingId(null)}
              />
            ) : type === "certification" ? (
              <CertCard
                key={skill.id}
                skill={skill}
                onEdit={() => setEditingId(skill.id)}
              />
            ) : (
              <HabitCard
                key={skill.id}
                skill={skill}
                onEdit={() => setEditingId(skill.id)}
              />
            ),
          )}
        </ul>
      )}
    </section>
  );
}

export function LearningSections({
  skills,
  mascotSeed,
  showPaceCheck,
}: {
  skills: SkillRow[];
  mascotSeed: number;
  showPaceCheck: boolean;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [celebratingId, setCelebratingId] = useState<number | null>(null);

  const byType = useMemo(() => {
    const groups: Record<SkillType, SkillRow[]> = {
      build: [],
      certification: [],
      habit: [],
    };
    for (const s of skills) groups[s.skillType].push(s);
    for (const key of Object.keys(groups) as SkillType[]) {
      groups[key].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    }
    return groups;
  }, [skills]);

  return (
    <div className="space-y-10">
      {showPaceCheck && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-honey/40 bg-honey-mist/40 px-4 py-3 text-sm text-honey">
          <ClockIcon className="size-4 shrink-0" />
          <span>
            Time for your monthly pace check — no build hours logged in the last
            30 days. A quick review keeps the momentum honest.
          </span>
        </div>
      )}

      <Section
        type="build"
        skills={byType.build}
        editingId={editingId}
        setEditingId={setEditingId}
        celebratingId={celebratingId}
        setCelebratingId={setCelebratingId}
        mascotSeed={mascotSeed}
      />
      <Section
        type="certification"
        skills={byType.certification}
        editingId={editingId}
        setEditingId={setEditingId}
        celebratingId={celebratingId}
        setCelebratingId={setCelebratingId}
        mascotSeed={mascotSeed}
      />
      <Section
        type="habit"
        skills={byType.habit}
        editingId={editingId}
        setEditingId={setEditingId}
        celebratingId={celebratingId}
        setCelebratingId={setCelebratingId}
        mascotSeed={mascotSeed}
      />
    </div>
  );
}

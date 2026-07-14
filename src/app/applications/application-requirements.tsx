"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { INPUT_CLASSES, LABEL_CLASSES } from "@/components/form";
import {
  REQUIREMENT_LABELS,
  REQUIREMENT_STATUS,
  SIMPLE_REQUIREMENT_TYPES,
  hasContactFields,
  type RequirementRow,
  type RequirementType,
} from "@/lib/requirements";

type ReqData = {
  status: string;
  contactName: string;
  contactInfo: string;
  notes: string;
};

const DEFAULT_DATA: ReqData = {
  status: "none",
  contactName: "",
  contactInfo: "",
  notes: "",
};

const keyOf = (type: RequirementType, slot: number) => `${type}:${slot}`;

type SerializedRequirement = {
  requirementType: RequirementType;
  slotIndex: number;
} & ReqData;

type RequirementsCtx = {
  entries: Record<string, ReqData>;
  recCount: number;
  simpleActive: Set<RequirementType>;
  getEntry: (key: string) => ReqData;
  setRecCount: (n: number) => void;
  toggleSimple: (t: RequirementType) => void;
  updateEntry: (key: string, patch: Partial<ReqData>) => void;
  activeCount: number;
};

const Ctx = createContext<RequirementsCtx | null>(null);
const useReq = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("Requirements components must be inside the provider");
  return c;
};

export function RequirementsProvider({
  initial,
  children,
}: {
  initial: RequirementRow[];
  children: React.ReactNode;
}) {
  const [entries, setEntries] = useState<Record<string, ReqData>>(() => {
    const map: Record<string, ReqData> = {};
    for (const r of initial) {
      map[keyOf(r.requirementType, r.slotIndex)] = {
        status: r.status ?? "none",
        contactName: r.contactName ?? "",
        contactInfo: r.contactInfo ?? "",
        notes: r.notes ?? "",
      };
    }
    return map;
  });
  const [recCount, setRecCount] = useState(
    () => initial.filter((r) => r.active && r.requirementType === "recommendation").length,
  );
  const [simpleActive, setSimpleActive] = useState<Set<RequirementType>>(
    () =>
      new Set(
        initial
          .filter((r) => r.active && r.requirementType !== "recommendation")
          .map((r) => r.requirementType),
      ),
  );

  const getEntry = (key: string) => entries[key] ?? DEFAULT_DATA;

  const updateEntry = (key: string, patch: Partial<ReqData>) =>
    setEntries((prev) => ({ ...prev, [key]: { ...(prev[key] ?? DEFAULT_DATA), ...patch } }));

  const toggleSimple = (t: RequirementType) =>
    setSimpleActive((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  // The active requirements, serialized for the parent form's submission.
  const active = useMemo<SerializedRequirement[]>(() => {
    const out: SerializedRequirement[] = [];
    for (let s = 1; s <= recCount; s++) {
      out.push({
        requirementType: "recommendation",
        slotIndex: s,
        ...(entries[keyOf("recommendation", s)] ?? DEFAULT_DATA),
      });
    }
    for (const t of SIMPLE_REQUIREMENT_TYPES) {
      if (simpleActive.has(t)) {
        out.push({
          requirementType: t,
          slotIndex: 1,
          ...(entries[keyOf(t, 1)] ?? DEFAULT_DATA),
        });
      }
    }
    return out;
  }, [entries, recCount, simpleActive]);

  const value: RequirementsCtx = {
    entries,
    recCount,
    simpleActive,
    getEntry,
    setRecCount,
    toggleSimple,
    updateEntry,
    activeCount: active.length,
  };

  return (
    <Ctx.Provider value={value}>
      <input type="hidden" name="requirements" value={JSON.stringify(active)} />
      {children}
    </Ctx.Provider>
  );
}

/** The "Requires" multi-select that sits next to the Status dropdown. */
export function RequiresControl() {
  const { recCount, simpleActive, setRecCount, toggleSimple, activeCount } =
    useReq();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className={LABEL_CLASSES}>Requires</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`${INPUT_CLASSES} flex items-center justify-between text-left`}
      >
        <span className={activeCount === 0 ? "text-sage" : "text-forest"}>
          {activeCount === 0 ? "Nothing selected" : `${activeCount} selected`}
        </span>
        <span aria-hidden className="text-sage">
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full min-w-[15rem] rounded-xl border border-sage/30 bg-white p-3 shadow-soft">
          <p className="mb-1.5 text-xs font-medium text-sage-deep">
            Recommendations
          </p>
          <div className="mb-3 flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRecCount(recCount === n ? 0 : n)}
                className={`flex-1 rounded-full px-2 py-1 text-xs font-medium transition-colors ${
                  recCount === n
                    ? "bg-forest text-white"
                    : "border border-sage/50 bg-white text-sage-deep hover:bg-blush/30"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="space-y-1">
            {SIMPLE_REQUIREMENT_TYPES.map((t) => (
              <label
                key={t}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-sm text-forest hover:bg-blush/20"
              >
                <input
                  type="checkbox"
                  checked={simpleActive.has(t)}
                  onChange={() => toggleSimple(t)}
                  className="size-4 accent-rose"
                />
                {REQUIREMENT_LABELS[t]}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusSelect({
  type,
  entryKey,
}: {
  type: RequirementType;
  entryKey: string;
}) {
  const { getEntry, updateEntry } = useReq();
  const cfg = REQUIREMENT_STATUS[type];
  return (
    <div>
      <label className={LABEL_CLASSES}>{cfg.label}</label>
      <select
        value={getEntry(entryKey).status}
        onChange={(e) => updateEntry(entryKey, { status: e.target.value })}
        className={INPUT_CLASSES}
      >
        {cfg.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function RequirementBlock({
  type,
  slot,
  heading,
}: {
  type: RequirementType;
  slot: number;
  heading: string;
}) {
  const { getEntry, updateEntry } = useReq();
  const entryKey = keyOf(type, slot);
  const data = getEntry(entryKey);

  return (
    <div className="rounded-xl border border-sage/25 bg-white p-3">
      <p className="mb-2 text-sm font-semibold text-forest">{heading}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatusSelect type={type} entryKey={entryKey} />
        {hasContactFields(type) && (
          <>
            <div>
              <label className={LABEL_CLASSES}>Name</label>
              <input
                value={data.contactName}
                onChange={(e) =>
                  updateEntry(entryKey, { contactName: e.target.value })
                }
                placeholder="Recommender's name"
                className={INPUT_CLASSES}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASSES}>Contact</label>
              <input
                value={data.contactInfo}
                onChange={(e) =>
                  updateEntry(entryKey, { contactInfo: e.target.value })
                }
                placeholder="email or phone"
                className={INPUT_CLASSES}
              />
            </div>
          </>
        )}
      </div>
      <div className="mt-3">
        <label className={LABEL_CLASSES}>Notes</label>
        <textarea
          rows={2}
          value={data.notes}
          onChange={(e) => updateEntry(entryKey, { notes: e.target.value })}
          placeholder="Details, dates, next steps…"
          className={INPUT_CLASSES}
        />
      </div>
    </div>
  );
}

/** Collapsible "Application notes" — one block per active requirement. */
export function ApplicationNotesSection() {
  const { recCount, simpleActive, activeCount } = useReq();
  const [open, setOpen] = useState(activeCount > 0);

  if (activeCount === 0) return null;

  return (
    <div className="rounded-xl border border-sage/30 bg-mist/40 p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-sm font-medium text-forest"
      >
        <span>Application notes</span>
        <span className="text-xs text-sage-deep">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {Array.from({ length: recCount }, (_, i) => (
            <RequirementBlock
              key={`recommendation:${i + 1}`}
              type="recommendation"
              slot={i + 1}
              heading={
                recCount === 1
                  ? "Recommendation"
                  : `Recommendation ${i + 1}`
              }
            />
          ))}
          {SIMPLE_REQUIREMENT_TYPES.filter((t) => simpleActive.has(t)).map(
            (t) => (
              <RequirementBlock
                key={t}
                type={t}
                slot={1}
                heading={REQUIREMENT_LABELS[t]}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

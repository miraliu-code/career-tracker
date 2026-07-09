"use client";

import { useMemo, useState, useTransition } from "react";

import {
  STATUS_LABELS,
  STATUS_STYLES,
  urgencyStyle,
} from "@/components/badges";
import { daysFromToday, formatDate } from "@/lib/dates";

import {
  deleteFundingProgram,
  updateFundingProgram,
  updateFundingStatus,
} from "./actions";
import { FundingForm, type FundingFormValues } from "./funding-form";

export type FundingRow = FundingFormValues & {
  id: number;
};

const TYPE_FILTERS = ["all", "scholarship", "fellowship"] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number];

const STATUS_FILTERS = [
  "all",
  "not_started",
  "applied",
  "interviewing",
  "awarded",
  "rejected",
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

type SortBy = "deadline" | "amount";

const TYPE_LABELS: Record<string, string> = {
  scholarship: "Scholarship",
  fellowship: "Fellowship",
};

const TYPE_STYLES: Record<string, string> = {
  scholarship: "bg-moss-mist text-moss",
  fellowship:
    "bg-blush text-rose-deep",
};

function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function TypeBadge({ type }: { type: string | null }) {
  if (!type || !(type in TYPE_STYLES)) return null;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[type]}`}
    >
      {TYPE_LABELS[type]}
    </span>
  );
}

function DeadlineCell({ deadline }: { deadline: string }) {
  const days = daysFromToday(deadline);
  const label =
    days < 0
      ? `${-days}d overdue`
      : days === 0
        ? "Due today"
        : `${days}d left`;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-sm tabular-nums text-sage-deep">
        {formatDate(deadline)}
      </span>
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${urgencyStyle(days)}`}
      >
        {label}
      </span>
    </span>
  );
}

function QuickStatus({ id, status }: { id: number; status: string }) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label="Update status"
      value={value}
      disabled={pending}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.stopPropagation();
        const next = e.target.value;
        setValue(next);
        startTransition(() => updateFundingStatus(id, next));
      }}
      className={`cursor-pointer rounded-full border-0 py-0.5 pl-2.5 pr-7 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose/40 disabled:opacity-60 ${STATUS_STYLES[value] ?? STATUS_STYLES.not_started}`}
    >
      {STATUS_FILTERS.filter((s) => s !== "all").map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}

function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-forest text-white"
          : "border border-sage/50 bg-white text-sage-deep hover:bg-blush/30"
      }`}
    >
      {label}
    </button>
  );
}

export function FundingList({ programs }: { programs: FundingRow[] }) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("deadline");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  const visible = useMemo(() => {
    let filtered = programs;
    if (typeFilter !== "all") {
      filtered = filtered.filter((p) => p.type === typeFilter);
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "deadline") {
        // Soonest first; rows without a deadline sink to the bottom.
        if (a.deadline === null && b.deadline === null) return 0;
        if (a.deadline === null) return 1;
        if (b.deadline === null) return -1;
        return a.deadline.localeCompare(b.deadline);
      }
      // Highest amount first; rows without an amount sink to the bottom.
      return (b.amount ?? -1) - (a.amount ?? -1);
    });
  }, [programs, typeFilter, statusFilter, sortBy]);

  const handleDelete = (program: FundingRow) => {
    if (
      window.confirm(`Delete "${program.name}"? This cannot be undone.`)
    ) {
      startDeleteTransition(async () => {
        await deleteFundingProgram(program.id);
        setEditingId(null);
      });
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <div
            role="group"
            aria-label="Filter by type"
            className="flex flex-wrap gap-1.5"
          >
            {TYPE_FILTERS.map((type) => (
              <FilterPill
                key={type}
                active={typeFilter === type}
                label={type === "all" ? "All" : TYPE_LABELS[type]}
                onClick={() => setTypeFilter(type)}
              />
            ))}
          </div>
          <span
            aria-hidden
            className="mx-1 hidden h-4 w-px bg-sage/50 sm:block"
          />
          <div
            role="group"
            aria-label="Filter by status"
            className="flex flex-wrap gap-1.5"
          >
            {STATUS_FILTERS.map((status) => (
              <FilterPill
                key={status}
                active={statusFilter === status}
                label={status === "all" ? "All" : STATUS_LABELS[status]}
                onClick={() => setStatusFilter(status)}
              />
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-sage-deep">
          Sort by
          <select
            aria-label="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-xl border border-sage/50 bg-white px-2 py-1 text-sm text-forest focus:border-rose/60 focus:outline-none"
          >
            <option value="deadline">Deadline (soonest first)</option>
            <option value="amount">Amount (highest first)</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sage/50 bg-white p-8 text-center">
          <p className="text-sm font-medium text-forest">
            {programs.length === 0
              ? "No funding programs yet"
              : "No programs match these filters"}
          </p>
          <p className="mt-1 text-sm text-sage-deep">
            {programs.length === 0
              ? "Add a scholarship or fellowship — future you says thanks."
              : "Try adjusting the filters."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-sage/25 overflow-hidden rounded-2xl border border-sage/30 bg-white shadow-soft">
          {visible.map((program) =>
            editingId === program.id ? (
              <li
                key={program.id}
                className="bg-mist/60 p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-forest">
                    Edit Funding Program
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleDelete(program)}
                    disabled={deletePending}
                    className="rounded-xl border border-rose/30 bg-white px-3 py-1.5 text-sm font-medium text-rose hover:bg-blush/40 disabled:opacity-50"
                  >
                    {deletePending ? "Deleting…" : "Delete"}
                  </button>
                </div>
                <FundingForm
                  action={updateFundingProgram.bind(null, program.id)}
                  initial={program}
                  submitLabel="Save Changes"
                  onClose={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li
                key={program.id}
                role="button"
                tabIndex={0}
                onClick={() => setEditingId(program.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setEditingId(program.id);
                  }
                }}
                className="flex cursor-pointer flex-col gap-2 p-4 transition-colors hover:bg-blush/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium text-forest">
                    <span className="truncate">{program.name}</span>
                    <TypeBadge type={program.type} />
                    {program.amount !== null && (
                      <span className="text-sm font-semibold tabular-nums text-moss">
                        {formatAmount(program.amount)}
                      </span>
                    )}
                  </p>
                  {program.eligibilityTags &&
                    program.eligibilityTags.length > 0 && (
                      <p className="mt-1 flex flex-wrap gap-1">
                        {program.eligibilityTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex rounded-full bg-mist px-2 py-0.5 text-xs text-sage-deep"
                          >
                            {tag}
                          </span>
                        ))}
                      </p>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {program.deadline && (
                    <DeadlineCell deadline={program.deadline} />
                  )}
                  <QuickStatus
                    key={`${program.id}-${program.status}`}
                    id={program.id}
                    status={program.status}
                  />
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

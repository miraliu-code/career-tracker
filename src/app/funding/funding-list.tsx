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
  scholarship: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  fellowship:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
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
      <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
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
      className={`cursor-pointer rounded-full border-0 py-0.5 pl-2.5 pr-7 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-60 ${STATUS_STYLES[value] ?? STATUS_STYLES.not_started}`}
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
          ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
          : "border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
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
            className="mx-1 hidden h-4 w-px bg-zinc-300 sm:block dark:bg-zinc-700"
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
        <label className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          Sort by
          <select
            aria-label="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          >
            <option value="deadline">Deadline (soonest first)</option>
            <option value="amount">Amount (highest first)</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {programs.length === 0
              ? "No funding programs yet"
              : "No programs match these filters"}
          </p>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
            {programs.length === 0
              ? "Add your first scholarship or fellowship to start tracking."
              : "Try different filters."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {visible.map((program) =>
            editingId === program.id ? (
              <li
                key={program.id}
                className="bg-zinc-50 p-5 dark:bg-zinc-800/40"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    Edit Funding Program
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleDelete(program)}
                    disabled={deletePending}
                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950"
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
                className="flex cursor-pointer flex-col gap-2 p-4 transition-colors hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-zinc-800/60"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium text-zinc-900 dark:text-zinc-50">
                    <span className="truncate">{program.name}</span>
                    <TypeBadge type={program.type} />
                    {program.amount !== null && (
                      <span className="text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
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
                            className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
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

"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import {
  IndustryDot,
  STATUS_LABELS,
  STATUS_STYLES,
  urgencyStyle,
} from "@/components/badges";
import { CelebrationBurst } from "@/components/celebration";
import { RandomMascot, mascotName } from "@/components/mascots";
import { daysFromToday, formatDate } from "@/lib/dates";

import {
  deleteApplication,
  updateApplication,
  updateApplicationStatus,
} from "./actions";
import {
  ApplicationForm,
  type ApplicationFormValues,
  type CompanyOption,
} from "./application-form";

export type ApplicationRow = ApplicationFormValues & {
  id: number;
  company: { id: number; name: string; industry: string | null } | null;
};

const STATUS_FILTERS = [
  "all",
  "not_started",
  "applied",
  "interviewing",
  "offer",
  "rejected",
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];
type SortBy = "deadline" | "company";

const TYPE_LABELS: Record<string, string> = {
  internship: "Internship",
  new_grad: "New grad",
};

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

function QuickStatus({
  id,
  status,
  onCelebrate,
}: {
  id: number;
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
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.stopPropagation();
        const next = e.target.value;
        setValue(next);
        if (next === "offer") onCelebrate?.();
        startTransition(() => updateApplicationStatus(id, next));
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

export function ApplicationsList({
  applications,
  companies,
  mascotSeed,
}: {
  applications: ApplicationRow[];
  companies: CompanyOption[];
  mascotSeed: number;
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("deadline");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [celebratingId, setCelebratingId] = useState<number | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  const visible = useMemo(() => {
    const filtered =
      statusFilter === "all"
        ? applications
        : applications.filter((app) => app.status === statusFilter);

    return [...filtered].sort((a, b) => {
      if (sortBy === "deadline") {
        // Soonest first; rows without a deadline sink to the bottom.
        if (a.deadline === null && b.deadline === null) return 0;
        if (a.deadline === null) return 1;
        if (b.deadline === null) return -1;
        return a.deadline.localeCompare(b.deadline);
      }
      const nameA = a.company?.name ?? "";
      const nameB = b.company?.name ?? "";
      if (nameA === "" && nameB !== "") return 1;
      if (nameB === "" && nameA !== "") return -1;
      return (
        nameA.localeCompare(nameB) || a.roleTitle.localeCompare(b.roleTitle)
      );
    });
  }, [applications, statusFilter, sortBy]);

  const handleDelete = (app: ApplicationRow) => {
    if (
      window.confirm(
        `Delete the "${app.roleTitle}" application? This cannot be undone.`,
      )
    ) {
      startDeleteTransition(async () => {
        await deleteApplication(app.id);
        setEditingId(null);
      });
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Filter by status"
          className="flex flex-wrap gap-1.5"
        >
          {STATUS_FILTERS.map((status) => {
            const active = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-forest text-white"
                    : "border border-sage/50 bg-white text-sage-deep hover:bg-blush/30"
                }`}
              >
                {status === "all" ? "All" : STATUS_LABELS[status]}
              </button>
            );
          })}
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
            <option value="company">Company name</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-sage/50 bg-white p-8 text-center">
          <RandomMascot seed={mascotSeed} className="mx-auto mb-3 size-24" />
          <p className="text-sm font-medium text-forest">
            {statusFilter === "all"
              ? "No applications yet"
              : `No ${STATUS_LABELS[statusFilter].toLowerCase()} applications`}
          </p>
          <p className="mt-1 text-sm text-sage-deep">
            {statusFilter === "all"
              ? `${mascotName(mascotSeed)} is waiting for your first application — add one and get rolling.`
              : "Try adjusting the filters."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-sage/25 overflow-hidden rounded-2xl border border-sage/30 border-l-[3px] border-l-honey bg-white shadow-soft">
          {visible.map((app) =>
            editingId === app.id ? (
              <li key={app.id} className="bg-mist/60 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-forest">
                    Edit Application
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleDelete(app)}
                    disabled={deletePending}
                    className="rounded-full border border-rose/30 bg-white px-3 py-1.5 text-sm font-medium text-rose hover:bg-blush/40 disabled:opacity-50"
                  >
                    {deletePending ? "Deleting…" : "Delete"}
                  </button>
                </div>
                <ApplicationForm
                  action={updateApplication.bind(null, app.id)}
                  initial={app}
                  companies={companies}
                  submitLabel="Save Changes"
                  onClose={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li
                key={app.id}
                role="button"
                tabIndex={0}
                onClick={() => setEditingId(app.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setEditingId(app.id);
                  }
                }}
                className="flex cursor-pointer flex-col gap-2 p-4 transition-colors hover:bg-blush/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-forest">
                    {app.roleTitle}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-sage-deep">
                    {app.company && (
                      <>
                        <Link
                          href={`/companies/${app.company.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 hover:text-rose hover:underline"
                        >
                          <IndustryDot industry={app.company.industry} />
                          {app.company.name}
                        </Link>
                        {(app.type || app.location) && <span>·</span>}
                      </>
                    )}
                    {app.type && (
                      <>
                        <span>{TYPE_LABELS[app.type] ?? app.type}</span>
                        {app.location && <span>·</span>}
                      </>
                    )}
                    {app.location && <span>{app.location}</span>}
                  </p>
                </div>
                <div className="relative flex flex-wrap items-center gap-2 sm:justify-end">
                  {app.deadline && <DeadlineCell deadline={app.deadline} />}
                  <QuickStatus
                    key={`${app.id}-${app.status}`}
                    id={app.id}
                    status={app.status}
                    onCelebrate={() => setCelebratingId(app.id)}
                  />
                  {celebratingId === app.id && (
                    <CelebrationBurst onDone={() => setCelebratingId(null)} />
                  )}
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

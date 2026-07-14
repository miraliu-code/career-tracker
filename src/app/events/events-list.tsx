"use client";

import { useMemo, useState, useTransition } from "react";

import { announceBadges } from "@/lib/badge-events";

import {
  STATUS_LABELS,
  STATUS_STYLES,
  urgencyStyle,
} from "@/components/badges";
import { RandomMascot, mascotName } from "@/components/mascots";
import { daysFromToday, formatDate } from "@/lib/dates";

import { deleteEvent, updateEvent, updateEventStatus } from "./actions";
import { EventForm, type EventFormValues } from "./event-form";

export type EventRow = EventFormValues & {
  id: number;
};

const CATEGORY_FILTERS = [
  "all",
  "case_competition",
  "conference",
  "pipeline_program",
] as const;
type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

const STATUS_FILTERS = [
  "all",
  "not_started",
  "applied",
  "accepted",
  "attending",
  "completed",
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

type SortBy = "deadline" | "name";

const CATEGORY_LABELS: Record<string, string> = {
  case_competition: "Case competition",
  conference: "Conference",
  pipeline_program: "Pipeline program",
};

const CATEGORY_STYLES: Record<string, string> = {
  case_competition:
    "bg-blush text-rose-deep",
  conference: "bg-forest-mist text-forest",
  pipeline_program:
    "bg-moss-mist text-moss",
};

function CategoryBadge({ category }: { category: string | null }) {
  if (!category || !(category in CATEGORY_STYLES)) return null;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[category]}`}
    >
      {CATEGORY_LABELS[category]}
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
        startTransition(async () =>
          announceBadges(await updateEventStatus(id, next)),
        );
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

export function EventsList({
  events,
  mascotSeed,
}: {
  events: EventRow[];
  mascotSeed: number;
}) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("deadline");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  const visible = useMemo(() => {
    let filtered = events;
    if (categoryFilter !== "all") {
      filtered = filtered.filter((e) => e.category === categoryFilter);
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "deadline") {
        // Soonest first; rows without a deadline sink to the bottom.
        if (a.deadline === null && b.deadline === null) {
          return a.name.localeCompare(b.name);
        }
        if (a.deadline === null) return 1;
        if (b.deadline === null) return -1;
        return a.deadline.localeCompare(b.deadline);
      }
      return a.name.localeCompare(b.name);
    });
  }, [events, categoryFilter, statusFilter, sortBy]);

  const handleDelete = (event: EventRow) => {
    if (window.confirm(`Delete "${event.name}"? This cannot be undone.`)) {
      startDeleteTransition(async () => {
        await deleteEvent(event.id);
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
            aria-label="Filter by category"
            className="flex flex-wrap gap-1.5"
          >
            {CATEGORY_FILTERS.map((category) => (
              <FilterPill
                key={category}
                active={categoryFilter === category}
                label={category === "all" ? "All" : CATEGORY_LABELS[category]}
                onClick={() => setCategoryFilter(category)}
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
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-sage/50 bg-white p-8 text-center">
          <RandomMascot seed={mascotSeed} className="mx-auto mb-3 size-24" />
          <p className="text-sm font-medium text-forest">
            {events.length === 0
              ? "No events yet"
              : "No events match these filters"}
          </p>
          <p className="mt-1 text-sm text-sage-deep">
            {events.length === 0
              ? `${mascotName(mascotSeed)} is sniffing out opportunities — add a case competition, conference, or pipeline program.`
              : "Try adjusting the filters."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-sage/25 overflow-hidden rounded-2xl border border-sage/30 border-l-[3px] border-l-rose-deep bg-white shadow-soft">
          {visible.map((event) =>
            editingId === event.id ? (
              <li key={event.id} className="bg-mist/60 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-forest">
                    Edit Event
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleDelete(event)}
                    disabled={deletePending}
                    className="rounded-full border border-rose/30 bg-white px-3 py-1.5 text-sm font-medium text-rose hover:bg-blush/40 disabled:opacity-50"
                  >
                    {deletePending ? "Deleting…" : "Delete"}
                  </button>
                </div>
                <EventForm
                  action={updateEvent.bind(null, event.id)}
                  initial={event}
                  submitLabel="Save Changes"
                  onClose={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li
                key={event.id}
                role="button"
                tabIndex={0}
                onClick={() => setEditingId(event.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setEditingId(event.id);
                  }
                }}
                className="flex cursor-pointer flex-col gap-2 p-4 transition-colors hover:bg-blush/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium text-forest">
                    <span className="truncate">{event.name}</span>
                    <CategoryBadge category={event.category} />
                  </p>
                  {(event.organization || event.location) && (
                    <p className="mt-0.5 truncate text-sm text-sage-deep">
                      {[event.organization, event.location]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {event.deadline && <DeadlineCell deadline={event.deadline} />}
                  <QuickStatus
                    key={`${event.id}-${event.status}`}
                    id={event.id}
                    status={event.status}
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

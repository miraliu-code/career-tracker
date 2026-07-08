"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import {
  CONNECTION_LABELS,
  ConnectionBadge,
  IndustryDot,
  urgencyStyle,
} from "@/components/badges";
import { daysFromToday, formatDate } from "@/lib/dates";

import { deleteContact, markContactedToday, updateContact } from "./actions";
import {
  ContactForm,
  type CompanyOption,
  type ContactFormValues,
} from "./contact-form";

export type ContactRow = ContactFormValues & {
  id: number;
  company: { id: number; name: string; industry: string | null } | null;
};

const CONNECTION_FILTERS = [
  "all",
  "alum",
  "recruiter",
  "mentor",
  "other",
] as const;

type ConnectionFilter = (typeof CONNECTION_FILTERS)[number];
type SortBy = "followup" | "name";

function needsFollowup(contact: ContactRow): boolean {
  return (
    contact.nextFollowupDate !== null &&
    daysFromToday(contact.nextFollowupDate) <= 0
  );
}

function FollowupCell({ date }: { date: string }) {
  const days = daysFromToday(date);
  const label =
    days < 0 ? `${-days}d overdue` : days === 0 ? "Due today" : `in ${days}d`;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
        {formatDate(date)}
      </span>
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${urgencyStyle(days)}`}
      >
        {label}
      </span>
    </span>
  );
}

function LinkedInLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="LinkedIn profile"
      onClick={(e) => e.stopPropagation()}
      className="text-zinc-400 transition-colors hover:text-blue-600 dark:text-zinc-500 dark:hover:text-blue-400"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className="size-4"
      >
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
      </svg>
    </a>
  );
}

function MarkContactedButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={(e) => {
        e.stopPropagation();
        startTransition(() => markContactedToday(id));
      }}
      className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
    >
      {pending ? "Logging…" : "Mark contacted today"}
    </button>
  );
}

export function ContactsList({
  contacts,
  companies,
}: {
  contacts: ContactRow[];
  companies: CompanyOption[];
}) {
  const [connectionFilter, setConnectionFilter] =
    useState<ConnectionFilter>("all");
  const [followupOnly, setFollowupOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("followup");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  const visible = useMemo(() => {
    let filtered =
      connectionFilter === "all"
        ? contacts
        : contacts.filter((c) => c.connectionType === connectionFilter);
    if (followupOnly) filtered = filtered.filter(needsFollowup);

    return [...filtered].sort((a, b) => {
      if (sortBy === "followup") {
        // Soonest/most overdue first; rows without a date sink to the bottom.
        if (a.nextFollowupDate === null && b.nextFollowupDate === null) {
          return a.name.localeCompare(b.name);
        }
        if (a.nextFollowupDate === null) return 1;
        if (b.nextFollowupDate === null) return -1;
        return a.nextFollowupDate.localeCompare(b.nextFollowupDate);
      }
      return a.name.localeCompare(b.name);
    });
  }, [contacts, connectionFilter, followupOnly, sortBy]);

  const handleDelete = (contact: ContactRow) => {
    if (
      window.confirm(`Delete contact "${contact.name}"? This cannot be undone.`)
    ) {
      startDeleteTransition(async () => {
        await deleteContact(contact.id);
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
            aria-label="Filter by connection type"
            className="flex flex-wrap gap-1.5"
          >
            {CONNECTION_FILTERS.map((type) => {
              const active = connectionFilter === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setConnectionFilter(type)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                      : "border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {type === "all" ? "All" : CONNECTION_LABELS[type]}
                </button>
              );
            })}
          </div>
          <span
            aria-hidden
            className="mx-1 hidden h-4 w-px bg-zinc-300 sm:block dark:bg-zinc-700"
          />
          <button
            type="button"
            aria-pressed={followupOnly}
            onClick={() => setFollowupOnly((v) => !v)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              followupOnly
                ? "bg-red-600 text-white"
                : "border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            Needs follow-up
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          Sort by
          <select
            aria-label="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          >
            <option value="followup">Follow-up (soonest first)</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {contacts.length === 0
              ? "No contacts yet"
              : "No contacts match these filters"}
          </p>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
            {contacts.length === 0
              ? "Add your first contact to start building your network."
              : "Try different filters."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {visible.map((contact) =>
            editingId === contact.id ? (
              <li
                key={contact.id}
                className="bg-zinc-50 p-5 dark:bg-zinc-800/40"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    Edit Contact
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleDelete(contact)}
                    disabled={deletePending}
                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    {deletePending ? "Deleting…" : "Delete"}
                  </button>
                </div>
                <ContactForm
                  action={updateContact.bind(null, contact.id)}
                  initial={contact}
                  companies={companies}
                  submitLabel="Save Changes"
                  onClose={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li
                key={contact.id}
                role="button"
                tabIndex={0}
                onClick={() => setEditingId(contact.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setEditingId(contact.id);
                  }
                }}
                className="flex cursor-pointer flex-col gap-2 p-4 transition-colors hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-zinc-800/60"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-50">
                    <span className="truncate">{contact.name}</span>
                    <ConnectionBadge type={contact.connectionType} />
                    {contact.linkedinUrl && (
                      <LinkedInLink url={contact.linkedinUrl} />
                    )}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {contact.company ? (
                      <Link
                        href={`/companies/${contact.company.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 hover:text-zinc-900 hover:underline dark:hover:text-zinc-50"
                      >
                        <IndustryDot industry={contact.company.industry} />
                        {contact.company.name}
                      </Link>
                    ) : (
                      <span>—</span>
                    )}
                    {contact.role && (
                      <>
                        <span>·</span>
                        <span>{contact.role}</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className="text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                    {contact.lastContactDate
                      ? `Last contact ${formatDate(contact.lastContactDate)}`
                      : "Never contacted"}
                  </span>
                  {contact.nextFollowupDate && (
                    <FollowupCell date={contact.nextFollowupDate} />
                  )}
                  <MarkContactedButton id={contact.id} />
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

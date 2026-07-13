"use client";

import { useState, useTransition } from "react";

import type { AlertFinding } from "@/db/schema";
import { formatDate } from "@/lib/dates";

import { dismissFinding, scanInboxNow } from "./alerts/actions";

const SIGNAL_STYLES: Record<string, string> = {
  deadline: "bg-rose-mist text-rose-deep",
  opening: "bg-moss-mist text-moss",
};

const SIGNAL_LABELS: Record<string, string> = {
  deadline: "Deadline",
  opening: "Opening",
};

function ScanButton() {
  const [pending, startTransition] = useTransition();
  const [summary, setSummary] = useState<string | null>(null);

  return (
    <span className="inline-flex items-center gap-2">
      {summary && <span className="text-xs text-sage-deep">{summary}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              const r = await scanInboxNow();
              setSummary(
                r.status === "auth_expired"
                  ? "Gmail needs reconnecting"
                  : r.status === "error"
                    ? "Scan failed — try again"
                    : r.newFindings > 0
                      ? `${r.newFindings} new signal${r.newFindings === 1 ? "" : "s"} found`
                      : `Checked ${r.scanned} new emails — nothing actionable`,
              );
            } catch {
              setSummary("Scan failed — check Gmail credentials");
            }
          })
        }
        className="rounded-full border border-sage/50 bg-white px-3 py-1 text-xs font-medium text-sage-deep hover:bg-blush/30 hover:text-forest disabled:opacity-50"
      >
        {pending ? "Scanning…" : "Scan inbox now"}
      </button>
    </span>
  );
}

export function InboxSignals({ findings }: { findings: AlertFinding[] }) {
  const [dismissPending, startDismiss] = useTransition();

  return (
    <section aria-label="Inbox signals" className="mb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-forest">
          Inbox Signals{" "}
          <span className="font-normal text-sage">
            ({findings.length} new)
          </span>
        </h2>
        <ScanButton />
      </div>

      {findings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sage/50 bg-white p-6 text-center">
          <p className="text-sm text-sage-deep">
            No new signals from your career-alerts inbox — Stripes is keeping
            watch.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-sage/25 overflow-hidden rounded-2xl border border-sage/30 border-l-[3px] border-l-honey bg-white shadow-soft">
          {findings.map((f) => (
            <li
              key={f.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-medium text-forest">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${SIGNAL_STYLES[f.signal ?? "opening"]}`}
                  >
                    {SIGNAL_LABELS[f.signal ?? "opening"]}
                  </span>
                  {f.matchedCompany && (
                    <span className="text-sm font-semibold text-rose">
                      {f.matchedCompany}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm font-medium text-forest">
                  {f.subject || "(no subject)"}
                </p>
                {f.excerpt && (
                  <p className="mt-0.5 line-clamp-2 text-sm text-sage-deep">
                    {f.excerpt}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                {f.receivedAt && (
                  <span className="text-xs tabular-nums text-sage-deep">
                    {formatDate(f.receivedAt.toISOString().slice(0, 10))}
                  </span>
                )}
                <a
                  href={`https://mail.google.com/mail/u/0/#all/${f.gmailMessageId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-sage/50 bg-white px-2.5 py-1 text-xs font-medium text-sage-deep hover:bg-blush/30 hover:text-forest"
                >
                  Open in Gmail
                </a>
                <button
                  type="button"
                  disabled={dismissPending}
                  onClick={() => startDismiss(() => dismissFinding(f.id))}
                  className="rounded-full px-2.5 py-1 text-xs font-medium text-sage-deep hover:bg-blush/40 hover:text-forest disabled:opacity-50"
                >
                  Dismiss
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

"use client";

import { useState, useTransition } from "react";

import { scanInboxNow } from "./alerts/actions";

export type GmailHealth = {
  status: "ok" | "auth_expired" | "error" | null;
  lastError: string | null;
  /** Whole days since the last successful scan, if that was > 10 days ago. */
  staleDays: number | null;
};

const RECONNECT_STEPS: { title: string; detail?: string }[] = [
  {
    title:
      "Go to developers.google.com/oauthplayground",
  },
  {
    title:
      "Gear icon → check “Use your own OAuth credentials” → paste your Client ID and Client Secret",
  },
  {
    title:
      "Select scope https://www.googleapis.com/auth/gmail.readonly → click “Authorize APIs”",
  },
  {
    title:
      "Exchange the authorization code for tokens → copy the new refresh_token",
  },
  {
    title:
      "Update GMAIL_REFRESH_TOKEN in Vercel (Settings → Environment Variables) and redeploy",
  },
];

function ReconnectInstructions() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="rounded-full border border-rose/40 bg-white px-3 py-1 text-xs font-medium text-rose-deep hover:bg-blush/40"
      >
        {open ? "Hide reconnect steps" : "How to reconnect"}
      </button>
      {open && (
        <ol className="mt-3 space-y-2 rounded-xl border border-rose/25 bg-white/70 p-4 text-sm text-rose-deep">
          {RECONNECT_STEPS.map((step, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-rose/15 text-xs font-semibold text-rose-deep">
                {i + 1}
              </span>
              <span className="break-words">{step.title}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function RetryButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => scanInboxNow().then(() => {}))}
      className="shrink-0 rounded-full border border-honey/50 bg-white px-3 py-1 text-xs font-medium text-honey hover:bg-honey-mist/50 disabled:opacity-50"
    >
      {pending ? "Scanning…" : "Scan inbox now"}
    </button>
  );
}

export function GmailHealthBanner({ status, lastError, staleDays }: GmailHealth) {
  if (status === "auth_expired") {
    return (
      <section
        role="alert"
        className="mb-6 rounded-2xl border border-rose/40 border-l-[3px] border-l-rose bg-rose-mist/50 p-5"
      >
        <p className="text-sm font-semibold text-rose-deep">
          Gmail needs reconnecting
        </p>
        <p className="mt-1 text-sm text-rose-deep/90">
          The weekly inbox scan is paused until you refresh the connection. It
          only takes a minute — your saved signals are safe in the meantime.
        </p>
        <ReconnectInstructions />
      </section>
    );
  }

  if (status === "error") {
    return (
      <section
        role="alert"
        className="mb-6 flex flex-col gap-3 rounded-2xl border border-honey/40 border-l-[3px] border-l-honey bg-honey-mist/40 p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-honey">
            The last inbox scan didn&rsquo;t finish
          </p>
          <p className="mt-1 break-words text-sm text-honey/90">
            {lastError
              ? `Gmail returned: ${lastError}`
              : "Something went wrong reaching Gmail."}{" "}
            Try again, or check back later.
          </p>
        </div>
        <RetryButton />
      </section>
    );
  }

  // status === "ok" (or unknown): only speak up if the last success is stale.
  if (staleDays !== null) {
    return (
      <p className="mb-6 text-xs text-sage-deep">
        Heads up — the inbox scan hasn&rsquo;t succeeded in {staleDays} days, so
        the signals below may be stale.
      </p>
    );
  }

  return null;
}

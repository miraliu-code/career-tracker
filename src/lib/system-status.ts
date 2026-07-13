import { eq } from "drizzle-orm";

import { db } from "@/db";
import { systemStatus } from "@/db/schema";

/** Upsert a key-value row in system_status, best-effort. */
export async function setSystemStatus(
  key: string,
  value: string,
): Promise<void> {
  await db
    .insert(systemStatus)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: systemStatus.key,
      set: { value, updatedAt: new Date() },
    });
}

export type StatusRow = { value: string | null; updatedAt: Date | null };

/** Read one key, or null if it has never been written. */
export async function getSystemStatus(key: string): Promise<StatusRow | null> {
  const [row] = await db
    .select({ value: systemStatus.value, updatedAt: systemStatus.updatedAt })
    .from(systemStatus)
    .where(eq(systemStatus.key, key))
    .limit(1);
  return row ?? null;
}

export type GmailHealth = {
  status: "ok" | "auth_expired" | "error" | null;
  lastError: string | null;
  /** Whole days since the last successful scan, if that was > 10 days ago. */
  staleDays: number | null;
};

const STALE_AFTER_DAYS = 10;

/** Resolve the Gmail connection health for the dashboard banner. */
export async function getGmailHealth(): Promise<GmailHealth> {
  const [statusRow, errorRow, successRow] = await Promise.all([
    getSystemStatus("gmail_status"),
    getSystemStatus("gmail_last_error"),
    getSystemStatus("gmail_last_success"),
  ]);

  const status = (statusRow?.value ?? null) as GmailHealth["status"];
  const lastSuccessMs = successRow?.value
    ? Date.parse(successRow.value)
    : NaN;
  const daysSinceSuccess = Number.isNaN(lastSuccessMs)
    ? null
    : Math.floor((Date.now() - lastSuccessMs) / 86_400_000);

  // Only flag staleness on a healthy (or not-yet-recorded) connection.
  const staleDays =
    (status === "ok" || status === null) &&
    daysSinceSuccess !== null &&
    daysSinceSuccess > STALE_AFTER_DAYS
      ? daysSinceSuccess
      : null;

  return { status, lastError: errorRow?.value ?? null, staleDays };
}

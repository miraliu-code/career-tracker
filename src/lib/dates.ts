/** Parse a Postgres `date` string (YYYY-MM-DD) as UTC midnight. */
export function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

/** Today's date at UTC midnight, from the server's local calendar date. */
export function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function daysFromToday(dateStr: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round(
    (parseDate(dateStr).getTime() - todayUtc().getTime()) / msPerDay,
  );
}

export function formatDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

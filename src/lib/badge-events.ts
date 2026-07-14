"use client";

// Tiny client-side event bus so any action's result can trigger the globally
// mounted badge celebration without prop-drilling through every call site.

export const BADGE_EVENT = "career-tracker:badges-earned";

export function announceBadges(keys: string[] | undefined | null): void {
  if (!keys || keys.length === 0) return;
  window.dispatchEvent(new CustomEvent(BADGE_EVENT, { detail: keys }));
}

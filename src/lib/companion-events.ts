"use client";

// Client-side event bus for the corner companion's reactions. Any component
// can nudge the companion (celebrate, approving nod, sympathetic blink) or
// have it speak a one-off line, without prop-drilling.

export const COMPANION_EVENT = "career-tracker:companion";

export type CompanionEntity =
  | "application"
  | "contact"
  | "funding program"
  | "event";

export type CompanionReaction =
  | { kind: "celebrate" }
  | { kind: "nod" }
  | { kind: "sympathy" }
  | { kind: "refresh" }
  | { kind: "say"; text: string }
  | { kind: "confirm"; entity: CompanionEntity };

export function companionReact(reaction: CompanionReaction): void {
  window.dispatchEvent(
    new CustomEvent(COMPANION_EVENT, { detail: reaction }),
  );
}

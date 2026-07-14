"use client";

import { BiscuitMascot } from "@/components/mascots";

/** A tiny bouncing mascot for user-initiated, visible pending states. */
export function MascotSpinner({ className = "size-4" }: { className?: string }) {
  return (
    <span aria-hidden className="inline-flex">
      <BiscuitMascot className={`mascot-spin ${className}`} />
    </span>
  );
}

"use client";

import { useState } from "react";

import { PRIMARY_BUTTON_CLASSES } from "@/components/form";

import { createEvent } from "./actions";
import { EventForm } from "./event-form";

export function AddEvent() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={PRIMARY_BUTTON_CLASSES}
      >
        Add Event
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-sage/30 bg-white p-6 shadow-soft">
      <h2 className="mb-4 text-base font-semibold text-forest">
        Add Event
      </h2>
      <EventForm
        action={createEvent}
        submitLabel="Create Event"
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

import { CalendarIcon } from "@/components/icons";
import { db } from "@/db";

import { AddEvent } from "./add-event";
import { EventsList, type EventRow } from "./events-list";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const allEvents = await db.query.events.findMany();

  const rows: EventRow[] = allEvents.map((event) => ({
    id: event.id,
    name: event.name,
    category: event.category,
    organization: event.organization,
    deadline: event.deadline,
    location: event.location,
    status: event.status ?? "not_started",
    notes: event.notes,
  }));

  return (
    <div className="flex-1">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8">
          <h1 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-forest">
            <CalendarIcon className="size-7 text-rose" />
            Events &amp; Programs
          </h1>
          <p className="mt-1 text-sm text-sage-deep">
            {rows.length} {rows.length === 1 ? "event" : "events"} tracked.
          </p>
        </header>

        <div className="mb-8">
          <AddEvent />
        </div>

        <EventsList events={rows} />
      </main>
    </div>
  );
}

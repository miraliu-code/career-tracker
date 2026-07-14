// Data-driven mascot voice lines. Pure + server-safe: given the current
// state, each mascot phrases it in its own voice. Skunk is calm/lazy,
// Stripes is precise/attentive, Biscuit is eager/encouraging.

export type MascotName = "Skunk" | "Stripes" | "Biscuit";

export type CompanionContext = {
  /** Nearest upcoming deadline name, or null if none within the horizon. */
  nearestName: string | null;
  /** Days until that deadline (>= 0), or null. */
  nearestDays: number | null;
  /** Contacts with an overdue follow-up. */
  overdueFollowups: number;
};

/** True when something needs attention soon (drives the "alert" pose). */
export function isUrgent(ctx: CompanionContext): boolean {
  return (
    ctx.overdueFollowups > 0 ||
    (ctx.nearestDays !== null && ctx.nearestDays <= 3)
  );
}

function days(n: number): string {
  return n === 0 ? "today" : n === 1 ? "1 day" : `${n} days`;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** A contextual status line in the given mascot's voice. */
export function companionLine(
  mascot: MascotName,
  ctx: CompanionContext,
): string {
  const { nearestName, nearestDays, overdueFollowups } = ctx;
  const hasDeadline = nearestName !== null && nearestDays !== null;

  if (mascot === "Skunk") {
    if (overdueFollowups > 0) {
      return `${plural(overdueFollowups, "follow-up")} sitting around. They'll keep. Maybe.`;
    }
    if (hasDeadline && nearestDays! <= 3) {
      return `${nearestName} is due in ${days(nearestDays!)}. Might wanna stir.`;
    }
    if (hasDeadline) {
      return `${nearestName}'s ${days(nearestDays!)} out. Plenty of time… probably.`;
    }
    return "Nothing's on fire. Go get a snack.";
  }

  if (mascot === "Stripes") {
    if (overdueFollowups > 0 && hasDeadline) {
      return `${plural(overdueFollowups, "follow-up")} overdue. Nearest deadline: ${nearestName}, ${days(nearestDays!)}.`;
    }
    if (overdueFollowups > 0) {
      return `${plural(overdueFollowups, "follow-up")} overdue. Let's clear those first.`;
    }
    if (hasDeadline) {
      return `Nearest deadline: ${nearestName}, ${days(nearestDays!)} out.`;
    }
    return "All clear — no deadlines this week, no overdue follow-ups.";
  }

  // Biscuit
  if (overdueFollowups > 0) {
    return `${plural(overdueFollowups, "follow-up")} waiting — let's knock 'em out!`;
  }
  if (hasDeadline && nearestDays! <= 3) {
    return `${nearestName} in ${days(nearestDays!)} — you've got this!`;
  }
  if (hasDeadline) {
    return `${nearestName} coming up in ${days(nearestDays!)}. Onward!`;
  }
  return "All caught up! Wanna add something new? Let's gooo!";
}

/** A brief mascot-voiced confirmation after creating something. */
export function confirmationLine(
  mascot: MascotName,
  entity: "application" | "contact" | "funding program" | "event",
): string {
  if (mascot === "Skunk") {
    return `${entity} logged. Nice and easy.`;
  }
  if (mascot === "Stripes") {
    return `Added the ${entity}. Tracked and tidy.`;
  }
  return `Ooh, a new ${entity}! Love the momentum — what's next?`;
}

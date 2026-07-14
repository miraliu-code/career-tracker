"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { MASCOTS } from "@/components/mascots";
import {
  getCompanionContext,
  setCompanionHidden,
} from "@/app/companion-actions";
import { BADGE_EVENT } from "@/lib/badge-events";
import {
  COMPANION_EVENT,
  type CompanionReaction,
} from "@/lib/companion-events";
import {
  companionLine,
  confirmationLine,
  isUrgent,
  type CompanionContext,
  type MascotName,
} from "@/lib/mascot-voice";

type Pose = "idle" | "alert" | "celebrate" | "nod" | "sympathy";

const CONFETTI_COLORS = [
  "var(--color-rose)",
  "var(--color-caramel)",
  "var(--color-honey-mist)",
  "var(--color-moss-mist)",
  "var(--color-blush)",
];

function ConfettiDots() {
  const [dots] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      dx: `${Math.round((Math.random() * 2 - 1) * 34)}px`,
      dy: `${-Math.round(14 + Math.random() * 26)}px`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: `${(Math.random() * 0.15).toFixed(2)}s`,
    })),
  );
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {dots.map((d, i) => (
        <i
          key={i}
          className="confetti-dot"
          style={
            {
              "--confetti-dx": d.dx,
              "--confetti-dy": d.dy,
              "--confetti-color": d.color,
              "--confetti-delay": d.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

export function Companion({
  seed,
  initialHidden,
  initialContext,
}: {
  seed: number;
  initialHidden: boolean;
  initialContext: CompanionContext;
}) {
  const pathname = usePathname();
  const { name, Component } = MASCOTS[seed % MASCOTS.length];

  const [hidden, setHidden] = useState(initialHidden);
  const [context, setContext] = useState(initialContext);
  const [transient, setTransient] = useState<Pose | null>(null);
  const [bubble, setBubble] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const poseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const refresh = useCallback(() => {
    getCompanionContext()
      .then(setContext)
      .catch(() => {});
  }, []);

  // Refresh state on first mount and on every navigation.
  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  const poseFor = useCallback((p: Pose, ms: number) => {
    setTransient(p);
    clearTimeout(poseTimer.current);
    poseTimer.current = setTimeout(() => setTransient(null), ms);
  }, []);

  const say = useCallback((text: string, ms = 4200) => {
    setBubble(text);
    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), ms);
  }, []);

  // Reactions from anywhere in the app.
  useEffect(() => {
    const onReact = (e: Event) => {
      const r = (e as CustomEvent<CompanionReaction>).detail;
      if (r.kind === "celebrate") {
        poseFor("celebrate", 2100);
        refresh();
      } else if (r.kind === "nod") {
        poseFor("nod", 1000);
      } else if (r.kind === "sympathy") {
        poseFor("sympathy", 1400);
      } else if (r.kind === "refresh") {
        refresh();
      } else if (r.kind === "say") {
        say(r.text);
        refresh();
      } else if (r.kind === "confirm") {
        say(confirmationLine(name as MascotName, r.entity));
        poseFor("nod", 1000);
        refresh();
      }
    };
    const onBadge = () => poseFor("celebrate", 2100);
    window.addEventListener(COMPANION_EVENT, onReact);
    window.addEventListener(BADGE_EVENT, onBadge);
    return () => {
      window.removeEventListener(COMPANION_EVENT, onReact);
      window.removeEventListener(BADGE_EVENT, onBadge);
    };
  }, [poseFor, refresh, say, name]);

  // Click outside dismisses the speech bubble.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setBubble(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  if (hidden) return null;

  const pose: Pose = transient ?? (isUrgent(context) ? "alert" : "idle");
  const poseClass =
    pose === "alert"
      ? "companion-alert"
      : pose === "celebrate"
        ? "companion-bounce"
        : pose === "nod"
          ? "companion-nod"
          : pose === "sympathy"
            ? "companion-sympathy"
            : "";

  const toggleBubble = () =>
    setBubble((cur) =>
      cur ? null : companionLine(name as MascotName, context),
    );

  const hide = () => {
    setHidden(true);
    setBubble(null);
    setCompanionHidden(true).catch(() => {});
  };

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2"
    >
      {bubble && (
        <div className="pointer-events-auto max-w-[15rem] rounded-2xl rounded-br-sm border border-sage/30 bg-white px-3 py-2 text-sm text-forest shadow-soft">
          <span className="font-semibold text-rose">{name}:</span> {bubble}
        </div>
      )}
      <div className="group pointer-events-auto relative">
        <button
          type="button"
          aria-label={`Chat with ${name}`}
          onClick={toggleBubble}
          className="block"
        >
          <span className={`inline-block ${poseClass}`}>
            <Component className="size-16 drop-shadow-sm" />
          </span>
          {pose === "celebrate" && <ConfettiDots />}
        </button>
        <button
          type="button"
          aria-label="Hide companion"
          onClick={hide}
          className="absolute -right-1 -top-1 hidden size-5 items-center justify-center rounded-full border border-sage/40 bg-white text-xs leading-none text-sage-deep opacity-0 shadow-sm transition-opacity hover:text-forest group-hover:flex group-hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
}

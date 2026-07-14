"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { MASCOTS } from "@/components/mascots";
import { BADGE_EVENT } from "@/lib/badge-events";
import { BADGE_BY_KEY, TIER_STYLES } from "@/lib/badges-config";

type Toast = {
  id: number;
  badgeKey: string;
  mascot: (typeof MASCOTS)[number];
};

const CONFETTI_COLORS = [
  "var(--color-rose)",
  "var(--color-caramel)",
  "var(--color-honey-mist)",
  "var(--color-moss-mist)",
  "var(--color-blush)",
];

/** A short celebratory line in a given mascot's voice. */
function mascotLine(mascot: string, badgeName: string): string {
  const lines = [
    `You did it! “${badgeName}” unlocked.`,
    `“${badgeName}” — nicely done!`,
    `Badge unlocked: “${badgeName}”. Keep it up!`,
    `That's a wrap on “${badgeName}”!`,
  ];
  const line = lines[Math.floor(Math.random() * lines.length)];
  return `${mascot} says: ${line}`;
}

function ConfettiDots() {
  const [dots] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      dx: `${Math.round((Math.random() * 2 - 1) * 40)}px`,
      dy: `${-Math.round(12 + Math.random() * 30)}px`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: `${(Math.random() * 0.15).toFixed(2)}s`,
    })),
  );
  return (
    <>
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
    </>
  );
}

function BadgeToast({
  toast,
  onDone,
}: {
  toast: Toast;
  onDone: (id: number) => void;
}) {
  const badge = BADGE_BY_KEY[toast.badgeKey];
  const Mascot = toast.mascot.Component;
  const tier = badge ? TIER_STYLES[badge.tier] : TIER_STYLES.bronze;

  useEffect(() => {
    const t = setTimeout(() => onDone(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onDone]);

  if (!badge) return null;

  return (
    <div
      role="status"
      className={`badge-toast pointer-events-auto flex items-center gap-3 rounded-2xl border ${tier.ring} bg-white/95 p-3 pr-4 shadow-soft backdrop-blur`}
    >
      <span className="relative flex size-12 shrink-0 items-center justify-center">
        <Mascot className="celebration-mascot size-12" />
        <ConfettiDots />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-sage-deep">
          {mascotLine(toast.mascot.name, badge.name)}
        </p>
        <p className="truncate text-sm font-semibold text-forest">
          🏆 {badge.name}
        </p>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDone(toast.id)}
        className="ml-1 shrink-0 rounded-full px-1.5 text-sage-deep hover:text-forest"
      >
        ✕
      </button>
    </div>
  );
}

export function BadgeToaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const onEarned = (e: Event) => {
      const keys = (e as CustomEvent<string[]>).detail ?? [];
      const fresh = keys
        .filter((k) => BADGE_BY_KEY[k])
        .map((badgeKey) => ({
          id: nextId.current++,
          badgeKey,
          mascot: MASCOTS[Math.floor(Math.random() * MASCOTS.length)],
        }));
      if (fresh.length > 0) setToasts((prev) => [...prev, ...fresh]);
    };
    window.addEventListener(BADGE_EVENT, onEarned);
    return () => window.removeEventListener(BADGE_EVENT, onEarned);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <BadgeToast key={t.id} toast={t} onDone={remove} />
      ))}
    </div>
  );
}

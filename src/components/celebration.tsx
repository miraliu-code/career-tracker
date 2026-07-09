"use client";

// Small celebratory flourish for happy status changes (offer / awarded):
// a random mascot bounces in next to the status pill while a handful of
// CSS confetti dots pop outward, all gone after ~1.5s. Pure CSS motion
// (transform/opacity), hidden entirely under prefers-reduced-motion.

import { useEffect, useState } from "react";

import { MASCOTS } from "@/components/mascots";

const CONFETTI_COLORS = [
  "var(--color-rose)",
  "var(--color-calico)",
  "var(--color-honey-mist)",
  "var(--color-moss-mist)",
  "var(--color-blush)",
];

type Dot = { dx: string; dy: string; color: string; delay: string };

/** Mount inside a `relative` container; calls `onDone` when finished. */
export function CelebrationBurst({ onDone }: { onDone: () => void }) {
  const [{ Mascot, dots }] = useState(() => ({
    Mascot: MASCOTS[Math.floor(Math.random() * MASCOTS.length)].Component,
    dots: Array.from({ length: 10 }, (_, i): Dot => ({
      dx: `${Math.round((Math.random() * 2 - 1) * 46)}px`,
      dy: `${-Math.round(14 + Math.random() * 38)}px`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: `${(Math.random() * 0.15).toFixed(2)}s`,
    })),
  }));

  useEffect(() => {
    const timer = setTimeout(onDone, 1600);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <span
      aria-hidden
      className="celebration-burst pointer-events-none absolute -top-6 right-0 z-10"
    >
      <Mascot className="celebration-mascot size-12" />
      {dots.map((dot, i) => (
        <i
          key={i}
          className="confetti-dot"
          style={
            {
              "--confetti-dx": dot.dx,
              "--confetti-dy": dot.dy,
              "--confetti-color": dot.color,
              "--confetti-delay": dot.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

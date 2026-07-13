// Hand-drawn pet mascots — cozy children's-book / sticker style, inline SVG
// only. Bodies are irregular bezier blobs (not perfect circles) with a soft,
// slightly-darker outline so they read as drawn rather than vector-perfect.
// Colors reference the theme variables so the palette stays single-source.
// Idle/hover motion comes from CSS classes defined in globals.css
// (mascot, mascot-breathe, mascot-blink, mascot-tail, mascot-ear) — all
// transform/opacity only and disabled under prefers-reduced-motion.

import type { CSSProperties } from "react";

const FOREST = "var(--color-forest)";
const CREAM = "var(--color-cream)";
const ROSE = "var(--color-rose)";
const BLUSH = "var(--color-blush)";
const CARAMEL = "var(--color-caramel)";
const HONEY = "var(--color-honey)";

// Soft, slightly-darker outlines — the hand-drawn edge.
const FOREST_LINE = "color-mix(in srgb, var(--color-forest) 72%, black)";
const CARAMEL_LINE = "color-mix(in srgb, var(--color-caramel) 60%, black)";
const CREAM_LINE = "color-mix(in srgb, var(--color-cream) 78%, #b9a68f)";

/** Transform origin in viewBox units for CSS animations on SVG children. */
function origin(x: number, y: number): CSSProperties {
  return { transformBox: "view-box", transformOrigin: `${x}px ${y}px` };
}

/** Staggers idle animations so mascots on the same screen don't sync. */
function stagger(seconds: number): CSSProperties {
  return { "--mascot-delay": `${seconds}s` } as CSSProperties;
}

/** Soft vertical gradient: gentle top sheen fading to a darker base. */
function BodyGradient({ id, color }: { id: string; color: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop
        offset="0%"
        style={{ stopColor: `color-mix(in srgb, ${color} 82%, white)` }}
      />
      <stop offset="55%" style={{ stopColor: color }} />
      <stop
        offset="100%"
        style={{ stopColor: `color-mix(in srgb, ${color} 88%, black)` }}
      />
    </linearGradient>
  );
}

/** Blurred ground-shadow ellipse (kept outside the breathing group). */
function GroundShadow({
  id,
  cx,
  rx,
  cy = 111,
}: {
  id: string;
  cx: number;
  rx: number;
  cy?: number;
}) {
  return (
    <>
      <filter id={id} x="-50%" y="-300%" width="200%" height="700%">
        <feGaussianBlur stdDeviation="2.4" />
      </filter>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry="4.5"
        fill={FOREST}
        opacity="0.12"
        filter={`url(#${id})`}
      />
    </>
  );
}

/**
 * Skunk — chunky tuxedo cat (boy). Round, cozy build with a fluffy cream
 * ruff, sleepy closed eyes, soft rose nose. His eyes stay shut, so he skips
 * the blink loop — the nap IS the personality.
 */
export function SkunkMascot({ className = "size-20" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      className={`mascot ${className}`}
      style={stagger(0)}
    >
      <defs>
        <BodyGradient id="mg-skunk" color={FOREST} />
        <GroundShadow id="mb-skunk" cx={60} rx={35} />
      </defs>
      <g className="mascot-breathe" style={origin(60, 107)}>
        {/* tail — thick, curling up on the right */}
        <g className="mascot-tail" style={origin(90, 94)}>
          <path
            d="M88 98 C 106 94 110 72 99 60 C 94 55 88 58 89 65"
            stroke={FOREST_LINE}
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M88 98 C 106 94 110 72 99 60 C 94 55 88 58 89 65"
            stroke={FOREST}
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />
          {/* tail fur wisps */}
          <g stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.3">
            <path d="M99 66 q4 2 5 6" />
            <path d="M102 76 q4 1 5 5" />
          </g>
        </g>
        {/* body */}
        <path
          d="M60 111 C 33 111 25 91 28 72 C 31 56 44 50 60 50 C 77 50 90 57 92 74 C 94 92 86 111 60 111 Z"
          fill="url(#mg-skunk)"
          stroke={FOREST_LINE}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* fluffy cream ruff / chest */}
        <path
          d="M60 108 C 45 108 39 93 42 80 C 44 71 51 66 60 66 C 69 66 76 71 78 80 C 81 93 74 108 60 108 Z"
          fill={CREAM}
          stroke={CREAM_LINE}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* chest ruff fur strokes */}
        <g stroke={CREAM_LINE} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.55">
          <path d="M50 72 q-3 5 -2 10" />
          <path d="M60 70 q0 6 0 11" />
          <path d="M70 72 q3 5 2 10" />
          <path d="M45 86 q-2 5 0 9" />
          <path d="M75 86 q2 5 0 9" />
        </g>
        {/* front paws */}
        <path d="M42 108 C 40 101 48 100 51 104 C 52 108 50 110 46 110 C 43 110 42 109 42 108 Z" fill={CREAM} stroke={CREAM_LINE} strokeWidth="1.1" />
        <path d="M78 108 C 80 101 72 100 69 104 C 68 108 70 110 74 110 C 77 110 78 109 78 108 Z" fill={CREAM} stroke={CREAM_LINE} strokeWidth="1.1" />
        {/* ears */}
        <g className="mascot-ear" style={origin(45, 24)}>
          <path d="M35 24 C 37 8 47 10 53 21 C 47 24 40 28 37 31 Z" fill={FOREST} stroke={FOREST_LINE} strokeWidth="2" strokeLinejoin="round" />
          <path d="M41 23 C 43 15 47 16 50 21 C 46 23 43 25 41 27 Z" fill={BLUSH} opacity="0.85" />
        </g>
        <g className="mascot-ear" style={origin(75, 24)}>
          <path d="M85 24 C 83 8 73 10 67 21 C 73 24 80 28 83 31 Z" fill={FOREST} stroke={FOREST_LINE} strokeWidth="2" strokeLinejoin="round" />
          <path d="M79 23 C 77 15 73 16 70 21 C 74 23 77 25 79 27 Z" fill={BLUSH} opacity="0.85" />
        </g>
        {/* head */}
        <path
          d="M60 13 C 41 13 31 26 31 42 C 31 59 44 68 60 68 C 76 68 89 59 89 42 C 89 26 79 13 60 13 Z"
          fill="url(#mg-skunk)"
          stroke={FOREST_LINE}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* cream muzzle patch */}
        <path
          d="M60 39 C 47 39 41 46 41 52 C 41 60 50 63 60 63 C 70 63 79 60 79 52 C 79 46 73 39 60 39 Z"
          fill={CREAM}
          stroke={CREAM_LINE}
          strokeWidth="1"
        />
        {/* cheek fur tufts */}
        <g stroke={CREAM} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.4">
          <path d="M33 44 q-4 2 -5 5" />
          <path d="M87 44 q4 2 5 5" />
        </g>
        {/* sleepy closed eyes with lashes */}
        <path d="M42 41 C 45 46 51 46 54 41" stroke={FOREST_LINE} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M66 41 C 69 46 75 46 78 41" stroke={FOREST_LINE} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        {/* blush cheeks */}
        <ellipse cx="43" cy="52" rx="4.5" ry="3" fill={BLUSH} opacity="0.55" />
        <ellipse cx="77" cy="52" rx="4.5" ry="3" fill={BLUSH} opacity="0.55" />
        {/* rose nose */}
        <path d="M56.5 48 C 56.5 51 63.5 51 63.5 48 C 63.5 46 56.5 46 56.5 48 Z" fill={ROSE} opacity="0.7" />
        {/* content little mouth */}
        <path d="M54.5 54 C 56.5 57 58.5 57 60 54.5 C 61.5 57 63.5 57 65.5 54" stroke={FOREST_LINE} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

/**
 * Stripes — leaner tuxedo cat (girl). Slim, poised build with big alert
 * eyes (highlight dots), a signature freckle beside her nose, and a soft
 * cream ruff.
 */
export function StripesMascot({
  className = "size-20",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      className={`mascot ${className}`}
      style={stagger(0.9)}
    >
      <defs>
        <BodyGradient id="mg-stripes" color={FOREST} />
        <GroundShadow id="mb-stripes" cx={60} rx={29} />
      </defs>
      <g className="mascot-breathe" style={origin(60, 107)}>
        {/* tail — slender, curling up */}
        <g className="mascot-tail" style={origin(84, 96)}>
          <path
            d="M83 99 C 101 96 106 74 97 62 C 93 57 88 59 89 65"
            stroke={FOREST_LINE}
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M83 99 C 101 96 106 74 97 62 C 93 57 88 59 89 65"
            stroke={FOREST}
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
        </g>
        {/* slim body */}
        <path
          d="M60 111 C 38 111 32 93 34 78 C 36 64 47 58 60 58 C 73 58 84 64 86 78 C 88 93 82 111 60 111 Z"
          fill="url(#mg-stripes)"
          stroke={FOREST_LINE}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* cream ruff / chest */}
        <path
          d="M60 108 C 49 108 44 95 46 84 C 48 76 54 72 60 72 C 66 72 72 76 74 84 C 76 95 71 108 60 108 Z"
          fill={CREAM}
          stroke={CREAM_LINE}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* chest ruff fur strokes */}
        <g stroke={CREAM_LINE} strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.55">
          <path d="M53 78 q-2 5 -1 9" />
          <path d="M60 76 q0 5 0 10" />
          <path d="M67 78 q2 5 1 9" />
        </g>
        {/* front paws */}
        <path d="M48 108 C 46 102 54 101 56 105 C 57 109 54 110 51 110 C 48 110 48 109 48 108 Z" fill={CREAM} stroke={CREAM_LINE} strokeWidth="1.1" />
        <path d="M72 108 C 74 102 66 101 64 105 C 63 109 66 110 69 110 C 72 110 72 109 72 108 Z" fill={CREAM} stroke={CREAM_LINE} strokeWidth="1.1" />
        {/* ears */}
        <g className="mascot-ear" style={origin(48, 26)}>
          <path d="M39 26 C 41 10 50 12 56 23 C 50 26 44 30 41 33 Z" fill={FOREST} stroke={FOREST_LINE} strokeWidth="2" strokeLinejoin="round" />
          <path d="M45 25 C 47 17 51 18 54 23 C 50 25 47 27 45 29 Z" fill={BLUSH} opacity="0.85" />
        </g>
        <g className="mascot-ear" style={origin(72, 26)}>
          <path d="M81 26 C 79 10 70 12 64 23 C 70 26 76 30 79 33 Z" fill={FOREST} stroke={FOREST_LINE} strokeWidth="2" strokeLinejoin="round" />
          <path d="M75 25 C 73 17 69 18 66 23 C 70 25 73 27 75 29 Z" fill={BLUSH} opacity="0.85" />
        </g>
        {/* head */}
        <path
          d="M60 17 C 43 17 34 29 34 44 C 34 60 46 68 60 68 C 74 68 86 60 86 44 C 86 29 77 17 60 17 Z"
          fill="url(#mg-stripes)"
          stroke={FOREST_LINE}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* cream muzzle patch */}
        <path
          d="M60 43 C 49 43 44 49 44 55 C 44 62 51 64 60 64 C 69 64 76 62 76 55 C 76 49 71 43 60 43 Z"
          fill={CREAM}
          stroke={CREAM_LINE}
          strokeWidth="1"
        />
        {/* cheek fur tufts */}
        <g stroke={CREAM} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4">
          <path d="M36 46 q-4 2 -5 5" />
          <path d="M84 46 q4 2 5 5" />
        </g>
        {/* big alert eyes with highlights */}
        <g className="mascot-blink" style={origin(60, 43)}>
          <ellipse cx="49" cy="43" rx="5.4" ry="6" fill={CREAM} stroke={CREAM_LINE} strokeWidth="0.8" />
          <ellipse cx="71" cy="43" rx="5.4" ry="6" fill={CREAM} stroke={CREAM_LINE} strokeWidth="0.8" />
          <circle cx="49.4" cy="43.6" r="3.1" fill={FOREST_LINE} />
          <circle cx="70.6" cy="43.6" r="3.1" fill={FOREST_LINE} />
          <circle cx="50.6" cy="42" r="1.2" fill={CREAM} />
          <circle cx="72.2" cy="42" r="1.2" fill={CREAM} />
        </g>
        {/* blush cheeks */}
        <ellipse cx="44" cy="54" rx="4.3" ry="3" fill={BLUSH} opacity="0.55" />
        <ellipse cx="76" cy="54" rx="4.3" ry="3" fill={BLUSH} opacity="0.55" />
        {/* rose nose */}
        <path d="M56.5 52 C 56.5 55 63.5 55 63.5 52 C 63.5 50 56.5 50 56.5 52 Z" fill={ROSE} opacity="0.8" />
        {/* signature freckle beside her nose */}
        <circle cx="66" cy="49" r="1.7" fill={FOREST_LINE} />
        {/* mouth */}
        <path d="M55.5 57 C 57.5 60 59.5 60 60 57.5 C 60.5 60 62.5 60 64.5 57" stroke={FOREST_LINE} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

/**
 * Biscuit — dachshund (girl). Long low caramel body, short legs, one long
 * floppy ear, cream belly and muzzle, big friendly eye with a highlight.
 */
export function BiscuitMascot({
  className = "size-20",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      className={`mascot ${className}`}
      style={stagger(1.7)}
    >
      <defs>
        <BodyGradient id="mg-biscuit" color={CARAMEL} />
        <GroundShadow id="mb-biscuit" cx={56} rx={45} />
      </defs>
      <g className="mascot-breathe" style={origin(56, 106)}>
        {/* tail — perky, curling up on the left */}
        <g className="mascot-tail" style={origin(15, 72)}>
          <path
            d="M16 74 C 4 70 3 57 10 50 C 13 47 17 49 16 54"
            stroke={CARAMEL_LINE}
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M16 74 C 4 70 3 57 10 50 C 13 47 17 49 16 54"
            stroke={CARAMEL}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </g>
        {/* short legs (behind body) */}
        <path d="M21 88 C 20 100 20 106 24 106 C 28 106 28 100 28 90 Z" fill={CARAMEL} stroke={CARAMEL_LINE} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M38 90 C 37 102 37 107 41 107 C 45 107 45 101 45 91 Z" fill={CARAMEL} stroke={CARAMEL_LINE} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M60 90 C 59 102 59 107 63 107 C 67 107 67 101 67 91 Z" fill={CARAMEL} stroke={CARAMEL_LINE} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M75 88 C 74 100 74 106 78 106 C 82 106 82 100 82 90 Z" fill={CARAMEL} stroke={CARAMEL_LINE} strokeWidth="1.6" strokeLinejoin="round" />
        {/* long low body */}
        <path
          d="M14 76 C 12 63 22 57 40 57 C 62 56 80 58 88 63 C 94 67 94 88 87 92 C 78 97 30 98 20 93 C 14 90 14 82 14 76 Z"
          fill="url(#mg-biscuit)"
          stroke={CARAMEL_LINE}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* cream belly */}
        <path
          d="M24 82 C 24 76 30 74 40 74 C 55 74 68 75 74 78 C 78 80 78 90 72 92 C 62 95 34 95 28 92 C 24 90 24 86 24 82 Z"
          fill={CREAM}
          stroke={CREAM_LINE}
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
        {/* body fur strokes along the back */}
        <g stroke={CARAMEL_LINE} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.4">
          <path d="M30 60 q-2 3 -1 6" />
          <path d="M46 58 q-1 3 0 6" />
          <path d="M62 59 q1 3 0 6" />
        </g>
        {/* head */}
        <path
          d="M92 32 C 79 32 71 42 71 53 C 71 65 81 71 93 71 C 105 71 112 63 112 51 C 112 40 104 32 92 32 Z"
          fill="url(#mg-biscuit)"
          stroke={CARAMEL_LINE}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* cream muzzle */}
        <path
          d="M100 54 C 92 54 88 58 88 62 C 88 66 94 68 101 68 C 108 68 112 65 112 60 C 112 56 107 54 100 54 Z"
          fill={CREAM}
          stroke={CREAM_LINE}
          strokeWidth="1"
        />
        {/* nose */}
        <path d="M108 57 C 105 57 105 62 109 62 C 113 62 113 57 108 57 Z" fill={FOREST_LINE} />
        {/* eye with highlight */}
        <g className="mascot-blink" style={origin(90, 48)}>
          <circle cx="90" cy="48" r="3.6" fill={FOREST_LINE} />
          <circle cx="91.2" cy="46.8" r="1.2" fill={CREAM} />
        </g>
        {/* blush cheek */}
        <ellipse cx="94" cy="62" rx="3.4" ry="2.4" fill={BLUSH} opacity="0.6" />
        {/* long floppy ear */}
        <g className="mascot-ear" style={origin(80, 42)}>
          <path
            d="M82 40 C 72 40 68 50 70 62 C 71 70 76 74 82 72 C 87 70 88 60 87 50 C 86 44 85 40 82 40 Z"
            fill={HONEY}
            stroke={CARAMEL_LINE}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* ear fur strokes */}
          <g stroke={CARAMEL_LINE} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4">
            <path d="M76 50 q-1 5 0 9" />
            <path d="M82 52 q1 5 0 9" />
          </g>
        </g>
        {/* happy mouth */}
        <path d="M100 63 C 102 66 105 66 107 63" stroke={FOREST_LINE} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

/** The whole crew, for random picks and celebration bursts. */
export const MASCOTS = [
  { name: "Skunk", Component: SkunkMascot },
  { name: "Stripes", Component: StripesMascot },
  { name: "Biscuit", Component: BiscuitMascot },
] as const;

/** Roll a fresh seed — call from server components only (per-request). */
export function randomMascotSeed(): number {
  return Math.floor(Math.random() * MASCOTS.length);
}

export function mascotName(seed: number): string {
  return MASCOTS[Math.abs(seed) % MASCOTS.length].name;
}

/**
 * Renders one of the mascots picked by `seed`. Pages compute the seed
 * server-side (all pages are force-dynamic, so it re-rolls per request) and
 * pass it down — client components must not call Math.random() in render.
 */
export function RandomMascot({
  seed,
  className,
}: {
  seed: number;
  className?: string;
}) {
  const { Component } = MASCOTS[Math.abs(seed) % MASCOTS.length];
  return <Component className={className} />;
}

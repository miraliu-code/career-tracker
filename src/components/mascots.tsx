// Flat-vector pet mascots — geometric kawaii-sticker style, inline SVG only.
// Colors reference the theme variables so the palette stays single-source.
// Each mascot carries lightweight polish: a soft vertical gradient on the
// main body shapes, a few low-opacity fur strokes, and a blurred ground
// shadow. Idle/hover motion comes from CSS classes defined in globals.css
// (mascot, mascot-breathe, mascot-blink, mascot-tail, mascot-ear) — all
// transform/opacity only and disabled under prefers-reduced-motion.

import type { CSSProperties } from "react";

const FOREST = "var(--color-forest)";
const FOREST_SOFT = "var(--color-forest-soft)";
const CREAM = "var(--color-cream)";
const ROSE = "var(--color-rose)";
const BLUSH = "var(--color-blush)";
const CARAMEL = "var(--color-caramel)";
const HONEY = "var(--color-honey)";
const HONEY_MIST = "var(--color-honey-mist)";
const CALICO = "var(--color-calico)";
const SAGE_DEEP = "var(--color-sage-deep)";

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
        style={{ stopColor: `color-mix(in srgb, ${color} 80%, white)` }}
      />
      <stop offset="55%" style={{ stopColor: color }} />
      <stop
        offset="100%"
        style={{ stopColor: `color-mix(in srgb, ${color} 90%, black)` }}
      />
    </linearGradient>
  );
}

/** Blurred ground-shadow ellipse (kept outside the breathing group). */
function GroundShadow({
  id,
  cx,
  rx,
  cy = 109,
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
 * Skunk — chunky tuxedo cat (boy). Wide round body, forest patches,
 * cream belly/paws, sleepy closed eyes, soft rose nose. His eyes stay
 * shut, so he skips the blink loop — the nap IS the personality.
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
        <GroundShadow id="mb-skunk" cx={60} rx={34} />
      </defs>
      <g className="mascot-breathe" style={origin(60, 105)}>
        {/* tail */}
        <g className="mascot-tail" style={origin(94, 88)}>
          <path
            d="M94 88 q16 -6 12 -26"
            stroke={FOREST}
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
        </g>
        {/* body */}
        <ellipse cx="60" cy="82" rx="36" ry="27" fill="url(#mg-skunk)" />
        <ellipse cx="60" cy="90" rx="23" ry="17" fill={CREAM} />
        {/* front paws */}
        <ellipse cx="47" cy="105" rx="8" ry="4.5" fill={CREAM} />
        <ellipse cx="73" cy="105" rx="8" ry="4.5" fill={CREAM} />
        {/* ears */}
        <g className="mascot-ear" style={origin(47, 26)}>
          <path d="M38 28 L45 7 L57 22 Z" fill={FOREST} />
          <path d="M42.5 23 L46 12.5 L52 19.5 Z" fill={BLUSH} />
        </g>
        <g className="mascot-ear" style={origin(73, 26)}>
          <path d="M82 28 L75 7 L63 22 Z" fill={FOREST} />
          <path d="M77.5 23 L74 12.5 L68 19.5 Z" fill={BLUSH} />
        </g>
        {/* head */}
        <circle cx="60" cy="40" r="25" fill="url(#mg-skunk)" />
        {/* cream muzzle patch */}
        <ellipse cx="60" cy="49" rx="17" ry="13" fill={CREAM} />
        {/* fur texture */}
        <g
          stroke={CREAM}
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.22"
        >
          <path d="M40 30 q-2 3 -1 6" />
          <path d="M29 74 q-2 4 0 7" />
          <path d="M91 74 q2 4 0 7" />
        </g>
        {/* sleepy closed eyes */}
        <path
          d="M42 37 q5 5 10 0"
          stroke={CREAM}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M68 37 q5 5 10 0"
          stroke={CREAM}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* rose nose, low opacity */}
        <ellipse cx="60" cy="48" rx="3.5" ry="2.5" fill={ROSE} opacity="0.55" />
        {/* content little mouth */}
        <path
          d="M55.5 54 q2.25 2.5 4.5 0 q2.25 2.5 4.5 0"
          stroke={FOREST}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

/**
 * Stripes — leaner tuxedo cat (girl). Slim build, alert round eyes,
 * signature freckle dot beside her nose.
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
        <GroundShadow id="mb-stripes" cx={60} rx={28} cy={110} />
      </defs>
      <g className="mascot-breathe" style={origin(60, 106)}>
        {/* tail */}
        <g className="mascot-tail" style={origin(86, 90)}>
          <path
            d="M86 90 q18 -4 14 -28"
            stroke={FOREST}
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
        </g>
        {/* slim body */}
        <ellipse cx="60" cy="86" rx="26" ry="24" fill="url(#mg-stripes)" />
        <ellipse cx="60" cy="93" rx="15" ry="14" fill={CREAM} />
        {/* front paws */}
        <ellipse cx="51" cy="107" rx="6" ry="3.5" fill={CREAM} />
        <ellipse cx="69" cy="107" rx="6" ry="3.5" fill={CREAM} />
        {/* ears */}
        <g className="mascot-ear" style={origin(50, 27)}>
          <path d="M42 30 L48 8 L59 24 Z" fill={FOREST} />
          <path d="M46 24.5 L49 13.5 L54.5 21 Z" fill={BLUSH} />
        </g>
        <g className="mascot-ear" style={origin(70, 27)}>
          <path d="M78 30 L72 8 L61 24 Z" fill={FOREST} />
          <path d="M74 24.5 L71 13.5 L65.5 21 Z" fill={BLUSH} />
        </g>
        {/* head */}
        <circle cx="60" cy="43" r="22" fill="url(#mg-stripes)" />
        {/* cream muzzle patch */}
        <ellipse cx="60" cy="51" rx="14.5" ry="11" fill={CREAM} />
        {/* fur texture */}
        <g
          stroke={CREAM}
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
          opacity="0.22"
        >
          <path d="M43 32 q-2 3 -1 6" />
          <path d="M38 80 q-2 4 0 7" />
          <path d="M83 80 q2 4 0 7" />
        </g>
        {/* alert open eyes */}
        <g className="mascot-blink" style={origin(60, 40)}>
          <circle cx="48.5" cy="40" r="4.4" fill={CREAM} />
          <circle cx="71.5" cy="40" r="4.4" fill={CREAM} />
          <circle cx="49.2" cy="40.5" r="2.1" fill={FOREST} />
          <circle cx="70.8" cy="40.5" r="2.1" fill={FOREST} />
        </g>
        {/* rose nose */}
        <ellipse cx="60" cy="50" rx="3" ry="2.2" fill={ROSE} opacity="0.7" />
        {/* signature dot marking on her nose bridge */}
        <circle cx="64.5" cy="46" r="1.8" fill={FOREST} />
        {/* mouth */}
        <path
          d="M56 55.5 q2 2.2 4 0 q2 2.2 4 0"
          stroke={FOREST}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

/**
 * Biscuit — dachshund (girl). Long low caramel body, short legs,
 * long floppy ear, cream belly and muzzle.
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
        <GroundShadow id="mb-biscuit" cx={55} rx={44} />
      </defs>
      <g className="mascot-breathe" style={origin(55, 105)}>
        {/* tail */}
        <g className="mascot-tail" style={origin(14, 72)}>
          <path
            d="M14 72 q-9 -7 -5 -18"
            stroke={CARAMEL}
            strokeWidth="6.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
        {/* long low body */}
        <rect x="10" y="60" width="80" height="36" rx="18" fill="url(#mg-biscuit)" />
        {/* cream belly */}
        <rect x="22" y="78" width="56" height="18" rx="9" fill={CREAM} />
        {/* short legs */}
        <rect x="20" y="88" width="9" height="17" rx="4.5" fill={CARAMEL} />
        <rect x="36" y="88" width="9" height="17" rx="4.5" fill={CARAMEL} />
        <rect x="58" y="88" width="9" height="17" rx="4.5" fill={CARAMEL} />
        <rect x="74" y="88" width="9" height="17" rx="4.5" fill={CARAMEL} />
        {/* head */}
        <circle cx="92" cy="50" r="19" fill="url(#mg-biscuit)" />
        {/* cream muzzle */}
        <ellipse cx="101" cy="57" rx="11" ry="8" fill={CREAM} />
        {/* fur texture */}
        <g
          stroke={CREAM}
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.25"
        >
          <path d="M28 68 q-2 3 0 6" />
          <path d="M48 66 q-2 3 0 6" />
          <path d="M88 38 q-2 3 -1 6" />
        </g>
        {/* nose */}
        <circle cx="109" cy="55" r="3" fill={FOREST} />
        {/* eye */}
        <g className="mascot-blink" style={origin(90, 45)}>
          <circle cx="90" cy="45" r="2.7" fill={FOREST} />
          <circle cx="91" cy="44.2" r="0.9" fill={CREAM} />
        </g>
        {/* blush cheek */}
        <circle cx="95" cy="61" r="2.6" fill={BLUSH} />
        {/* long floppy ear */}
        <g className="mascot-ear" style={origin(80, 43)}>
          <ellipse
            cx="79"
            cy="55"
            rx="7"
            ry="14"
            fill={HONEY}
            transform="rotate(16 79 55)"
          />
        </g>
        {/* happy mouth */}
        <path
          d="M101 62 q3 2.5 6 0"
          stroke={FOREST}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

/**
 * Baby Cat — calico kitten. Cream base coat with calico-orange and forest
 * patches, big curious eyes, sitting upright with her tail curled around
 * her front paws (so no tail sway — the curl is the pose).
 */
export function BabyCatMascot({
  className = "size-20",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      className={`mascot ${className}`}
      style={stagger(2.6)}
    >
      <defs>
        <BodyGradient id="mg-babycat" color={CREAM} />
        <GroundShadow id="mb-babycat" cx={60} rx={30} cy={110} />
      </defs>
      <g className="mascot-breathe" style={origin(60, 106)}>
        {/* upright body */}
        <ellipse cx="60" cy="80" rx="26" ry="27" fill="url(#mg-babycat)" />
        {/* calico + forest body patches */}
        <ellipse
          cx="45"
          cy="70"
          rx="11"
          ry="9"
          fill={CALICO}
          transform="rotate(-18 45 70)"
        />
        <ellipse
          cx="76"
          cy="87"
          rx="9"
          ry="7.5"
          fill={FOREST}
          transform="rotate(14 76 87)"
          opacity="0.95"
        />
        {/* front paws */}
        <ellipse
          cx="52"
          cy="104"
          rx="7"
          ry="4"
          fill={CREAM}
          stroke={SAGE_DEEP}
          strokeWidth="0.8"
          strokeOpacity="0.35"
        />
        <ellipse
          cx="68"
          cy="104"
          rx="7"
          ry="4"
          fill={CREAM}
          stroke={SAGE_DEEP}
          strokeWidth="0.8"
          strokeOpacity="0.35"
        />
        {/* tail curled around the paws, forest tip */}
        <path
          d="M84 94 q13 8 -2 12 q-16 4 -36 0"
          stroke={CALICO}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="46" cy="106" r="3.6" fill={FOREST} />
        {/* ears — calico left, forest right */}
        <g className="mascot-ear" style={origin(48, 26)}>
          <path d="M40 30 L46 9 L58 24 Z" fill={CALICO} />
          <path d="M44.5 24 L47.5 13.5 L53.5 21 Z" fill={BLUSH} />
        </g>
        <g className="mascot-ear" style={origin(72, 26)}>
          <path d="M80 30 L74 9 L62 24 Z" fill={FOREST} />
          <path d="M75.5 24 L72.5 13.5 L66.5 21 Z" fill={BLUSH} />
        </g>
        {/* head */}
        <circle cx="60" cy="42" r="23" fill="url(#mg-babycat)" />
        {/* head patches */}
        <ellipse
          cx="46"
          cy="31"
          rx="11"
          ry="8"
          fill={CALICO}
          transform="rotate(-16 46 31)"
        />
        <ellipse
          cx="74"
          cy="29"
          rx="8"
          ry="6"
          fill={FOREST}
          transform="rotate(14 74 29)"
        />
        {/* fur texture */}
        <g
          stroke={SAGE_DEEP}
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
          opacity="0.18"
        >
          <path d="M40 84 q-2 3 0 6" />
          <path d="M80 78 q2 3 0 6" />
          <path d="M52 58 q-2 2 -1 5" />
        </g>
        {/* big curious eyes */}
        <g className="mascot-blink" style={origin(60, 41)}>
          <circle cx="49" cy="41" r="4.6" fill={FOREST} />
          <circle cx="71" cy="41" r="4.6" fill={FOREST} />
          <circle cx="50.5" cy="39.5" r="1.4" fill={CREAM} />
          <circle cx="72.5" cy="39.5" r="1.4" fill={CREAM} />
        </g>
        {/* blush cheeks */}
        <circle cx="42" cy="49" r="2.6" fill={BLUSH} />
        <circle cx="78" cy="49" r="2.6" fill={BLUSH} />
        {/* rose nose + mouth */}
        <ellipse cx="60" cy="50" rx="3" ry="2.2" fill={ROSE} opacity="0.8" />
        <path
          d="M56 54.5 q2 2.2 4 0 q2 2.2 4 0"
          stroke={FOREST}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

/**
 * Panther — sleek black panther (honorary pet). Low prowling stance,
 * forest coat with a lighter sheen along the back and shoulders, amber
 * eye with a rose-gold glint. More intense than the house cats.
 */
export function PantherMascot({
  className = "size-20",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      className={`mascot ${className}`}
      style={stagger(3.4)}
    >
      <defs>
        <BodyGradient id="mg-panther" color={FOREST} />
        <GroundShadow id="mb-panther" cx={60} rx={44} />
      </defs>
      <g className="mascot-breathe" style={origin(58, 105)}>
        {/* long tail, held low then flicked up */}
        <g className="mascot-tail" style={origin(18, 78)}>
          <path
            d="M18 78 q-13 -5 -9 -24"
            stroke={FOREST}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </g>
        {/* low-slung body + front shoulder */}
        <ellipse
          cx="52"
          cy="80"
          rx="36"
          ry="16"
          fill="url(#mg-panther)"
          transform="rotate(2 52 80)"
        />
        <circle cx="80" cy="78" r="15" fill="url(#mg-panther)" />
        {/* sheen highlight along the back */}
        <path
          d="M22 70 q28 -14 58 -4"
          stroke={FOREST_SOFT}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />
        {/* prowling legs */}
        <rect x="22" y="86" width="8" height="19" rx="4" fill={FOREST} />
        <rect x="36" y="88" width="8" height="17" rx="4" fill={FOREST} />
        <rect x="70" y="88" width="8" height="17" rx="4" fill={FOREST} />
        <rect x="85" y="86" width="8" height="19" rx="4" fill={FOREST} />
        {/* ears — small and pinned */}
        <g className="mascot-ear" style={origin(91, 52)}>
          <path d="M86 54 L88 42 L96 50 Z" fill={FOREST} />
          <path d="M88.5 51 L89.5 45.5 L93.5 49.5 Z" fill={ROSE} opacity="0.35" />
        </g>
        <g className="mascot-ear" style={origin(107, 51)}>
          <path d="M102 51 L107 40 L112 52 Z" fill={FOREST} />
          <path d="M104.5 49.5 L107 44 L109.5 50 Z" fill={ROSE} opacity="0.35" />
        </g>
        {/* head, slightly forward and low */}
        <circle cx="98" cy="64" r="15" fill="url(#mg-panther)" />
        {/* muzzle */}
        <ellipse cx="105" cy="70" rx="7.5" ry="5.5" fill={FOREST_SOFT} />
        <circle cx="110.5" cy="68" r="2.2" fill={FOREST} />
        {/* fur texture */}
        <g
          stroke={CREAM}
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
          opacity="0.14"
        >
          <path d="M40 82 q2 3 0 6" />
          <path d="M58 84 q2 3 0 6" />
          <path d="M78 70 q2 3 0 6" />
        </g>
        {/* focused brow */}
        <path
          d="M90.5 56.5 q4 -2 7.5 -0.5"
          stroke={CREAM}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />
        {/* amber eye with rose-gold glint */}
        <g className="mascot-blink" style={origin(95, 62)}>
          <ellipse cx="94.5" cy="61.5" rx="3.5" ry="2.6" fill={HONEY_MIST} />
          <ellipse cx="95" cy="61.5" rx="1.1" ry="2" fill={FOREST} />
          <circle cx="93.4" cy="60.5" r="0.7" fill={ROSE} opacity="0.9" />
        </g>
        {/* quiet mouth */}
        <path
          d="M104 73.5 q3 2 6 0"
          stroke={CREAM}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
      </g>
    </svg>
  );
}

/** The whole crew, for random picks and celebration bursts. */
export const MASCOTS = [
  { name: "Skunk", Component: SkunkMascot },
  { name: "Stripes", Component: StripesMascot },
  { name: "Biscuit", Component: BiscuitMascot },
  { name: "Baby Cat", Component: BabyCatMascot },
  { name: "Panther", Component: PantherMascot },
] as const;

/** Roll a fresh seed — call from server components only (per-request). */
export function randomMascotSeed(): number {
  return Math.floor(Math.random() * MASCOTS.length);
}

export function mascotName(seed: number): string {
  return MASCOTS[Math.abs(seed) % MASCOTS.length].name;
}

/**
 * Renders one of the five mascots picked by `seed`. Pages compute the seed
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

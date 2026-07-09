// Flat-vector pet mascots — geometric kawaii-sticker style, inline SVG only.
// Colors reference the theme variables so the palette stays single-source.

const FOREST = "var(--color-forest)";
const CREAM = "var(--color-cream)";
const ROSE = "var(--color-rose)";
const BLUSH = "var(--color-blush)";
const CARAMEL = "var(--color-caramel)";
const HONEY = "var(--color-honey)";

/**
 * Skunk — chunky tuxedo cat (boy). Wide round body, forest patches,
 * cream belly/paws, sleepy closed eyes, soft rose nose.
 * `napping` adds floating Zs for the resting pose.
 */
export function SkunkMascot({
  className = "size-20",
  napping = false,
}: {
  className?: string;
  napping?: boolean;
}) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      {/* tail */}
      <path
        d="M94 88 q16 -6 12 -26"
        stroke={FOREST}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      {/* body */}
      <ellipse cx="60" cy="82" rx="36" ry="27" fill={FOREST} />
      <ellipse cx="60" cy="90" rx="23" ry="17" fill={CREAM} />
      {/* front paws */}
      <ellipse cx="47" cy="105" rx="8" ry="4.5" fill={CREAM} />
      <ellipse cx="73" cy="105" rx="8" ry="4.5" fill={CREAM} />
      {/* ears */}
      <path d="M38 28 L45 7 L57 22 Z" fill={FOREST} />
      <path d="M82 28 L75 7 L63 22 Z" fill={FOREST} />
      <path d="M42.5 23 L46 12.5 L52 19.5 Z" fill={BLUSH} />
      <path d="M77.5 23 L74 12.5 L68 19.5 Z" fill={BLUSH} />
      {/* head */}
      <circle cx="60" cy="40" r="25" fill={FOREST} />
      {/* cream muzzle patch */}
      <ellipse cx="60" cy="49" rx="17" ry="13" fill={CREAM} />
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
      {napping && (
        <g
          stroke={ROSE}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.7"
        >
          <path d="M96 26 h9 l-9 9 h9" />
          <path d="M108 10 h6 l-6 6 h6" />
        </g>
      )}
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
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      {/* tail */}
      <path
        d="M86 90 q18 -4 14 -28"
        stroke={FOREST}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      {/* slim body */}
      <ellipse cx="60" cy="86" rx="26" ry="24" fill={FOREST} />
      <ellipse cx="60" cy="93" rx="15" ry="14" fill={CREAM} />
      {/* front paws */}
      <ellipse cx="51" cy="107" rx="6" ry="3.5" fill={CREAM} />
      <ellipse cx="69" cy="107" rx="6" ry="3.5" fill={CREAM} />
      {/* ears */}
      <path d="M42 30 L48 8 L59 24 Z" fill={FOREST} />
      <path d="M78 30 L72 8 L61 24 Z" fill={FOREST} />
      <path d="M46 24.5 L49 13.5 L54.5 21 Z" fill={BLUSH} />
      <path d="M74 24.5 L71 13.5 L65.5 21 Z" fill={BLUSH} />
      {/* head */}
      <circle cx="60" cy="43" r="22" fill={FOREST} />
      {/* cream muzzle patch */}
      <ellipse cx="60" cy="51" rx="14.5" ry="11" fill={CREAM} />
      {/* alert open eyes */}
      <circle cx="48.5" cy="40" r="4.4" fill={CREAM} />
      <circle cx="71.5" cy="40" r="4.4" fill={CREAM} />
      <circle cx="49.2" cy="40.5" r="2.1" fill={FOREST} />
      <circle cx="70.8" cy="40.5" r="2.1" fill={FOREST} />
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
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      {/* tail */}
      <path
        d="M14 72 q-9 -7 -5 -18"
        stroke={CARAMEL}
        strokeWidth="6.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* long low body */}
      <rect x="10" y="60" width="80" height="36" rx="18" fill={CARAMEL} />
      {/* cream belly */}
      <rect x="22" y="78" width="56" height="18" rx="9" fill={CREAM} />
      {/* short legs */}
      <rect x="20" y="88" width="9" height="17" rx="4.5" fill={CARAMEL} />
      <rect x="36" y="88" width="9" height="17" rx="4.5" fill={CARAMEL} />
      <rect x="58" y="88" width="9" height="17" rx="4.5" fill={CARAMEL} />
      <rect x="74" y="88" width="9" height="17" rx="4.5" fill={CARAMEL} />
      {/* head */}
      <circle cx="92" cy="50" r="19" fill={CARAMEL} />
      {/* cream muzzle */}
      <ellipse cx="101" cy="57" rx="11" ry="8" fill={CREAM} />
      {/* nose */}
      <circle cx="109" cy="55" r="3" fill={FOREST} />
      {/* eye */}
      <circle cx="90" cy="45" r="2.7" fill={FOREST} />
      <circle cx="91" cy="44.2" r="0.9" fill={CREAM} />
      {/* blush cheek */}
      <circle cx="95" cy="61" r="2.6" fill={BLUSH} />
      {/* long floppy ear */}
      <ellipse
        cx="79"
        cy="55"
        rx="7"
        ry="14"
        fill={HONEY}
        transform="rotate(16 79 55)"
      />
      {/* happy mouth */}
      <path
        d="M101 62 q3 2.5 6 0"
        stroke={FOREST}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

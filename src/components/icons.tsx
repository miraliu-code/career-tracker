// Minimal line icons (24x24, stroke = currentColor) used next to page
// headings and dashboard summary cards. Inline SVGs to avoid a dependency.

function Icon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className ?? "size-6"}
    >
      {children}
    </svg>
  );
}

/** Sprout — Dashboard */
export function SproutIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M12 20v-8" />
      <path d="M12 12c0-3.5 2.5-6 6.5-6 0 3.5-2.5 6-6.5 6z" />
      <path d="M12 14c0-2.8-2-4.8-5.5-4.8 0 2.8 2 4.8 5.5 4.8z" />
      <path d="M5 20h14" />
    </Icon>
  );
}

/** Building — Companies */
export function BuildingIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <rect x="5" y="4" width="14" height="16" rx="1.5" />
      <path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2" />
      <path d="M3 20h18" />
    </Icon>
  );
}

/** Briefcase — Applications */
export function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
      <path d="M3.5 12.5h17" />
    </Icon>
  );
}

/** Heart — Contacts */
export function HeartIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M12 20s-7-4.5-8.5-9C2.5 8 4.5 5.5 7.5 5.5c1.8 0 3.4 1 4.5 2.6 1.1-1.6 2.7-2.6 4.5-2.6 3 0 5 2.5 4 5.5C19 15.5 12 20 12 20z" />
    </Icon>
  );
}

/** Graduation cap — Funding */
export function GradCapIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M2.5 9.5 12 5l9.5 4.5L12 14 2.5 9.5z" />
      <path d="M6.5 11.5v4.5c0 1.1 2.5 2.5 5.5 2.5s5.5-1.4 5.5-2.5v-4.5" />
      <path d="M21.5 9.5v5" />
    </Icon>
  );
}

/** Calendar — Events */
export function CalendarIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M8 3.5v4M16 3.5v4" />
    </Icon>
  );
}

/** Clock — deadlines summary card */
export function ClockIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Icon>
  );
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </Icon>
  );
}

export function ChatIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M4 5.5h16v10H9l-4 3v-3H4z" />
    </Icon>
  );
}

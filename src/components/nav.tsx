"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/companies", label: "Companies" },
  { href: "/applications", label: "Applications" },
  { href: "/contacts", label: "Contacts" },
  { href: "/funding", label: "Funding" },
  { href: "/events", label: "Events" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-sage/30 bg-white">
      <nav className="mx-auto flex w-full max-w-6xl items-center gap-1 px-4 py-3 sm:px-6">
        <span className="mr-4 text-sm font-semibold tracking-tight text-forest">
          Career Tracker
        </span>
        {LINKS.map(({ href, label }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-blush/60 text-forest"
                  : "text-sage-deep hover:bg-blush/30 hover:text-forest"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

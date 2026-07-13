"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GlobalSearch } from "@/components/global-search";
import {
  BiscuitMascot,
  SkunkMascot,
  StripesMascot,
} from "@/components/mascots";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/companies", label: "Companies" },
  { href: "/applications", label: "Applications" },
  { href: "/contacts", label: "Contacts" },
  { href: "/funding", label: "Funding" },
  { href: "/events", label: "Events" },
  { href: "/badges", label: "Badges" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-sage/30 bg-white">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-1 px-4 py-3 sm:px-6">
        <Link
          href="/"
          aria-label="Go to dashboard"
          className="mr-3 flex items-center gap-1.5 rounded-full transition-opacity hover:opacity-80"
        >
          <span aria-hidden className="flex items-end gap-0.5">
            <SkunkMascot className="size-7" />
            <StripesMascot className="size-7" />
            <BiscuitMascot className="size-7" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-forest">
            Career Tracker
          </span>
        </Link>
        {LINKS.map(({ href, label }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-blush text-rose-deep"
                  : "text-sage-deep hover:bg-blush/30 hover:text-forest"
              }`}
            >
              {active && (
                <span
                  aria-hidden
                  className="size-1.5 rounded-full bg-rose"
                />
              )}
              {label}
            </Link>
          );
        })}
        <div className="order-last mt-2 w-full sm:order-none sm:mt-0 sm:ml-auto sm:w-auto">
          <GlobalSearch />
        </div>
      </nav>
    </header>
  );
}

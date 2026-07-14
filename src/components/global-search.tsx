"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { STATUS_LABELS, STATUS_STYLES } from "@/components/badges";
import { SearchIcon } from "@/components/icons";
import { MascotSpinner } from "@/components/mascot-spinner";
import { globalSearch, type SearchResults } from "@/app/search/actions";

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [pending, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cmd+K / Ctrl+K focuses the search input from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Debounced search (~200ms). Short queries are cleared in the change
  // handler, so this effect only ever schedules a real search.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const handle = setTimeout(() => {
      startTransition(async () => {
        setResults(await globalSearch(q));
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [query]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    setResults(null);
    router.push(href);
  };

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full sm:w-64">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-sage" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            setOpen(true);
            if (next.trim().length < 2) setResults(null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder="Search…"
          aria-label="Search everything"
          className="w-full rounded-full border border-sage/50 bg-white py-1.5 pl-9 pr-12 text-sm text-forest placeholder:text-sage focus:border-rose/60 focus:outline-none focus:ring-2 focus:ring-rose/20"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-sage/40 bg-mist px-1.5 py-0.5 text-[10px] font-medium text-sage-deep sm:block">
          ⌘K
        </kbd>
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 z-30 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-sage/30 bg-white p-2 shadow-soft sm:left-auto sm:right-0 sm:w-96">
          {pending && !results ? (
            <p className="flex items-center justify-center gap-2 px-3 py-4 text-center text-sm text-sage-deep">
              <MascotSpinner /> Searching…
            </p>
          ) : results && results.totalHits === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="text-sm font-medium text-forest">No matches</p>
              <p className="mt-1 text-sm text-sage-deep">
                Nothing found for “{results.query}”. Try a different word.
              </p>
            </div>
          ) : results ? (
            <div className="space-y-1">
              {results.groups.map((group) => (
                <div key={group.type}>
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-sage">
                    {group.label}
                  </p>
                  {group.hits.map((hit) => (
                    <button
                      key={`${group.type}-${hit.id}`}
                      type="button"
                      onClick={() => go(hit.href)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors hover:bg-blush/25"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-forest">
                          {hit.title}
                        </span>
                        <span className="block truncate text-xs text-sage-deep">
                          {hit.context}
                        </span>
                      </span>
                      {hit.badge && (
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            STATUS_STYLES[hit.badge] ?? STATUS_STYLES.not_started
                          }`}
                        >
                          {STATUS_LABELS[hit.badge] ?? hit.badge}
                        </span>
                      )}
                    </button>
                  ))}
                  {group.total > group.hits.length && (
                    <p className="px-3 pb-1 pt-0.5 text-xs text-sage">
                      +{group.total - group.hits.length} more{" "}
                      {group.label.toLowerCase()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

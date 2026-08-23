"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchIndex, type SearchEntry } from "@/lib/search-index";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: SearchEntry["category"][] = ["Learn", "Lab", "Scenario", "Knowledge Card", "Glossary", "Page"];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const results = React.useMemo(() => searchIndex(query), [query]);

  // Reset activeIndex whenever the query changes, using React's documented
  // "adjust state during render" pattern instead of an effect — this runs
  // synchronously as part of this render rather than triggering a second one.
  const [queryForIndexReset, setQueryForIndexReset] = React.useState(query);
  if (query !== queryForIndexReset) {
    setQueryForIndexReset(query);
    setActiveIndex(0);
  }

  const handleOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);
    if (next) {
      setQuery("");
      setActiveIndex(0);
    }
  }, []);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleOpenChange(!open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleOpenChange]);

  // Focus the input once the dialog has actually opened (a legitimate DOM
  // side effect, not a React state update).
  React.useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  function go(entry: SearchEntry) {
    setOpen(false);
    router.push(entry.href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const entry = results[activeIndex];
      if (entry) go(entry);
    }
  }

  // Keep the highlighted result scrolled into view as the user arrows through
  // (another legitimate DOM side effect).
  React.useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const sorted = [...results].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
  );

  // Precompute "is this the first result in its category" in a plain loop
  // rather than mutating a variable from inside the JSX-producing .map below.
  const grouped: { entry: SearchEntry; globalIndex: number; showHeader: boolean }[] = [];
  let lastCategory: SearchEntry["category"] | null = null;
  for (const entry of sorted) {
    grouped.push({ entry, globalIndex: results.indexOf(entry), showHeader: entry.category !== lastCategory });
    lastCategory = entry.category;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden gap-1.5 text-muted-foreground sm:inline-flex"
        onClick={() => handleOpenChange(true)}
      >
        <Search className="size-3.5" />
        Search
        <kbd className="ml-1 rounded border border-border bg-muted px-1 font-mono text-[10px]">Ctrl K</kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search"
        className="sm:hidden"
        onClick={() => handleOpenChange(true)}
      >
        <Search className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="top-[20%] max-w-lg translate-y-0 gap-0 p-0 sm:max-w-lg" showCloseButton={false}>
          <DialogTitle className="sr-only">Search</DialogTitle>
          <DialogDescription className="sr-only">
            Search Learn modules, Labs, Scenarios, Knowledge Cards, and Glossary terms.
          </DialogDescription>
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search modules, labs, scenarios, glossary..."
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls="command-palette-list"
              aria-activedescendant={results[activeIndex] ? `cp-item-${activeIndex}` : undefined}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div ref={listRef} id="command-palette-list" role="listbox" className="max-h-80 overflow-y-auto p-1.5">
            {query.trim() === "" && (
              <p className="px-2.5 py-6 text-center text-xs text-muted-foreground">
                Type to search across every module, lab, scenario, and glossary term.
              </p>
            )}
            {query.trim() !== "" && grouped.length === 0 && (
              <p className="px-2.5 py-6 text-center text-xs text-muted-foreground">No results for &quot;{query}&quot;.</p>
            )}
            {grouped.map(({ entry, globalIndex, showHeader }) => (
              <React.Fragment key={`${entry.category}-${entry.href}-${entry.title}`}>
                {showHeader && (
                  <div className="px-2.5 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {entry.category}
                  </div>
                )}
                <button
                  id={`cp-item-${globalIndex}`}
                  data-index={globalIndex}
                  type="button"
                  role="option"
                  aria-selected={globalIndex === activeIndex}
                  onMouseEnter={() => setActiveIndex(globalIndex)}
                  onClick={() => go(entry)}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 rounded-md px-2.5 py-2 text-left",
                    globalIndex === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
                  )}
                >
                  <span className="text-sm font-medium">{entry.title}</span>
                  {entry.description && (
                    <span className="line-clamp-1 text-xs text-muted-foreground">{entry.description}</span>
                  )}
                </button>
              </React.Fragment>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

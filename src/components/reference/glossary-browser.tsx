"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { GLOSSARY } from "@/content/reference/glossary";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function GlossaryBrowser() {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GLOSSARY;
    return GLOSSARY.filter(
      (t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms..."
          className="pl-9"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((t) => (
          <div key={t.term} id={t.term} className="rounded-lg border border-border bg-card p-4">
            <div className="mb-1 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{t.term}</h3>
              {t.topicSlug && (
                <Link href={`/learn/${t.topicSlug}`} className="text-[11px] text-brand hover:underline">
                  Full module
                </Link>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{t.definition}</p>
            {t.related && t.related.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {t.related.map((r) => (
                  <button key={r} type="button" onClick={() => setQuery(r)}>
                    <Badge variant="secondary" className="cursor-pointer font-normal hover:bg-accent">
                      {r}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No terms match &quot;{query}&quot;.</p>
        )}
      </div>
    </div>
  );
}

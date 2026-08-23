"use client";

import { AlertTriangle, ArrowUpRight, BadgeCheck, BookOpen, Code2, Newspaper } from "lucide-react";
import type { LearningSource, SourceType } from "@/content/types";
import { useHasMounted } from "@/lib/use-has-mounted";
import { getFreshness } from "@/lib/source-freshness";
import { cn } from "@/lib/utils";

const SOURCE_TYPE_META: Record<SourceType, { label: string; icon: React.ReactNode }> = {
  "cloudflare-documentation": { label: "Cloudflare Docs", icon: <BookOpen className="size-3.5" /> },
  "cloudflare-learning-path": { label: "Cloudflare Learning Path", icon: <BadgeCheck className="size-3.5" /> },
  "cloudflare-api": { label: "Cloudflare API Docs", icon: <Code2 className="size-3.5" /> },
  "cloudflare-blog": { label: "Cloudflare Blog", icon: <Newspaper className="size-3.5" /> },
};

export function SourceVerification({
  sources,
  lastVerified,
}: {
  sources: LearningSource[];
  lastVerified?: string;
}) {
  const mounted = useHasMounted();
  if (sources.length === 0) return null;

  // Only compute staleness once mounted (comparing against "now" during SSR
  // would bake in the build-time date and risk a hydration mismatch right at
  // the threshold boundary — see lib/source-freshness.ts).
  const freshness = mounted ? getFreshness(lastVerified) : null;
  const stale = !!freshness?.stale;

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        stale ? "border-status-challenge/30 bg-status-challenge/5" : "border-status-allow/30 bg-status-allow/5"
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {stale ? (
          <AlertTriangle className="size-4 text-status-challenge" />
        ) : (
          <BadgeCheck className="size-4 text-status-allow" />
        )}
        <span className={cn("font-medium", stale ? "text-status-challenge" : "text-status-allow")}>
          {stale
            ? "Verification may be out of date"
            : "Content verified against official Cloudflare documentation"}
        </span>
        {lastVerified && <span className="text-muted-foreground">— last verified {lastVerified}</span>}
      </div>
      {stale && (
        <p className="mb-3 text-xs text-status-challenge">
          It&apos;s been over {Math.round((freshness?.daysSinceVerified ?? 0) / 30)} months since this module
          was checked against the sources below. Cloudflare&apos;s docs may have changed since — treat
          specifics (exact behavior, field names, plan availability) as needing a re-check before relying on
          them.
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        {sources.map((s, i) => (
          <a
            key={i}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-brand hover:underline"
          >
            {SOURCE_TYPE_META[s.sourceType].icon}
            {s.title}
            <ArrowUpRight className="size-3.5 shrink-0" />
          </a>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        This platform is an independent learning tool and is not affiliated with, endorsed by, or
        certified by Cloudflare. Cloudflare&apos;s documentation is the source of truth — where this content
        simplifies for teaching purposes, that is labeled explicitly.
      </p>
    </div>
  );
}

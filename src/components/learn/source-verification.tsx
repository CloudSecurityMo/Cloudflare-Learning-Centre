import { ArrowUpRight, BadgeCheck, BookOpen, Code2, Newspaper } from "lucide-react";
import type { LearningSource, SourceType } from "@/content/types";

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
  if (sources.length === 0) return null;

  return (
    <div className="rounded-lg border border-status-allow/30 bg-status-allow/5 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <BadgeCheck className="size-4 text-status-allow" />
        <span className="font-medium text-status-allow">
          Content verified against official Cloudflare documentation
        </span>
        {lastVerified && <span className="text-muted-foreground">— last verified {lastVerified}</span>}
      </div>
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

"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { LEARN_TOPICS } from "@/content/learn";
import { SCENARIOS } from "@/content/scenarios";
import { LABS } from "@/lib/labs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBackup } from "@/components/progress/progress-backup";
import { cn } from "@/lib/utils";

function TrackerCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
        checked ? "border-brand bg-brand text-brand-foreground" : "border-input"
      )}
    >
      {checked && <Check className="size-3" strokeWidth={3} />}
    </span>
  );
}

interface TrackerItem {
  slug: string;
  label: string;
  href: string;
  meta?: string;
}

function TrackerSection({
  title,
  items,
  completed,
  onToggle,
}: {
  title: string;
  items: TrackerItem[];
  completed: Record<string, boolean>;
  onToggle: (slug: string) => void;
}) {
  const doneCount = items.filter((i) => completed[i.slug]).length;
  const pct = items.length === 0 ? 0 : Math.round((doneCount / items.length) * 100);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">{title}</h2>
          <span className="font-mono text-xs text-muted-foreground">
            {doneCount} / {items.length}
          </span>
        </div>
        <Progress value={pct} className="mb-4" />
        <div className="flex flex-col divide-y divide-border">
          {items.map((item) => {
            const isDone = !!completed[item.slug];
            return (
              <div key={item.slug} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isDone}
                  aria-label={`${item.label}${item.meta ? `, ${item.meta}` : ""} — mark as ${isDone ? "not done" : "done"}`}
                  onClick={() => onToggle(item.slug)}
                  className="flex flex-1 items-center gap-3 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <TrackerCheckbox checked={isDone} />
                  <span className={isDone ? "flex-1 text-sm text-muted-foreground line-through" : "flex-1 text-sm"}>
                    {item.label}
                    {item.meta && <span className="ml-2 text-xs text-muted-foreground/70">{item.meta}</span>}
                  </span>
                </button>
                <Link
                  href={item.href}
                  className="shrink-0 rounded-sm text-muted-foreground outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring/50"
                  aria-label={`Open ${item.label}`}
                >
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProgressTracker() {
  const completedTopics = useProgress((s) => s.completedTopics);
  const labsCompleted = useProgress((s) => s.labsCompleted);
  const scenariosCompleted = useProgress((s) => s.scenariosCompleted);
  const toggleTopicComplete = useProgress((s) => s.toggleTopicComplete);
  const toggleLabComplete = useProgress((s) => s.toggleLabComplete);
  const toggleScenarioComplete = useProgress((s) => s.toggleScenarioComplete);

  const learnItems: TrackerItem[] = LEARN_TOPICS.map((t) => ({
    slug: t.slug,
    label: t.title,
    href: `/learn/${t.slug}`,
    meta: t.difficulty,
  }));

  const labItems: TrackerItem[] = LABS.map((l) => ({
    slug: l.slug,
    label: l.label,
    href: l.href,
  }));

  const scenarioItems: TrackerItem[] = SCENARIOS.map((s) => ({
    slug: s.slug,
    label: s.title,
    href: "/scenarios",
  }));

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-muted-foreground">
        Check off anything you consider done — this doesn&apos;t require finishing every quiz or reading
        every word. Stored locally in your browser only.
      </p>
      <TrackerSection title="Learn Modules" items={learnItems} completed={completedTopics} onToggle={toggleTopicComplete} />
      <TrackerSection title="Labs" items={labItems} completed={labsCompleted} onToggle={toggleLabComplete} />
      <TrackerSection title="Scenarios" items={scenarioItems} completed={scenariosCompleted} onToggle={toggleScenarioComplete} />
      <ProgressBackup />
    </div>
  );
}

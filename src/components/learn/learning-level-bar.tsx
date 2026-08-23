"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Check, Compass, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";
import { resolveLevelTarget, isLevelDone } from "@/lib/learning-level";

interface LevelPill {
  key: "understand" | "apply" | "architect";
  label: string;
  icon: React.ReactNode;
  href?: string;
  done: boolean;
}

export function LearningLevelBar({
  topicSlug,
  applyHref,
  architectHref,
}: {
  topicSlug: string;
  applyHref?: string;
  architectHref?: string;
}) {
  const completedTopics = useProgress((s) => s.completedTopics);
  const labsCompleted = useProgress((s) => s.labsCompleted);
  const visitedResources = useProgress((s) => s.visitedResources);

  const applyTarget = resolveLevelTarget(applyHref);
  const architectTarget = resolveLevelTarget(architectHref);

  const levels: LevelPill[] = [
    {
      key: "understand",
      label: "Understand",
      icon: <BookOpen className="size-3.5" />,
      done: !!completedTopics[topicSlug],
    },
    {
      key: "apply",
      label: "Apply",
      icon: <FlaskConical className="size-3.5" />,
      href: applyHref,
      done: isLevelDone(applyTarget, labsCompleted, visitedResources),
    },
    {
      key: "architect",
      label: "Architect",
      icon: <Compass className="size-3.5" />,
      href: architectHref,
      done: isLevelDone(architectTarget, labsCompleted, visitedResources),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      {levels.map((level, i) => {
        const content = (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
              level.done
                ? "border-status-allow/50 bg-status-allow/10 text-status-allow font-medium"
                : level.key === "understand"
                ? "border-brand/50 bg-brand/10 text-brand font-medium"
                : level.href
                ? "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground"
                : "border-border text-muted-foreground/50"
            )}
          >
            {level.done ? <Check className="size-3.5" /> : level.icon}
            {level.label}
          </span>
        );
        return (
          <div key={level.key} className="flex items-center gap-1.5">
            {level.href ? <Link href={level.href}>{content}</Link> : content}
            {i < levels.length - 1 && <ArrowRight className="size-3 text-muted-foreground/40" />}
          </div>
        );
      })}
    </div>
  );
}

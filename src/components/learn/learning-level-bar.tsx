import Link from "next/link";
import { ArrowRight, BookOpen, Compass, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

type Level = "understand" | "apply" | "architect";

const LEVELS: { key: Level; label: string; icon: React.ReactNode }[] = [
  { key: "understand", label: "Understand", icon: <BookOpen className="size-3.5" /> },
  { key: "apply", label: "Apply", icon: <FlaskConical className="size-3.5" /> },
  { key: "architect", label: "Architect", icon: <Compass className="size-3.5" /> },
];

export function LearningLevelBar({
  activeLevel,
  applyHref,
  architectHref,
}: {
  activeLevel: Level;
  applyHref?: string;
  architectHref?: string;
}) {
  const hrefFor: Record<Level, string | undefined> = {
    understand: undefined,
    apply: applyHref,
    architect: architectHref,
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      {LEVELS.map((level, i) => {
        const isActive = level.key === activeLevel;
        const href = hrefFor[level.key];
        const content = (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
              isActive
                ? "border-brand/50 bg-brand/10 text-brand font-medium"
                : href
                ? "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground"
                : "border-border text-muted-foreground/50"
            )}
          >
            {level.icon}
            {level.label}
          </span>
        );
        return (
          <div key={level.key} className="flex items-center gap-1.5">
            {href && !isActive ? <Link href={href}>{content}</Link> : content}
            {i < LEVELS.length - 1 && <ArrowRight className="size-3 text-muted-foreground/40" />}
          </div>
        );
      })}
    </div>
  );
}

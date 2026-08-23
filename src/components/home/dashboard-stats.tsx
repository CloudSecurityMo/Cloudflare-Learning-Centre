"use client";

import Link from "next/link";
import { ArrowRight, FlaskConical, LayoutGrid, Wrench } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { LEARN_TOPICS } from "@/content/learn";
import { SCENARIOS } from "@/content/scenarios";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LAB_SLUGS = [
  "dns-lab",
  "waf-lab",
  "tls-lab",
  "bot-lab",
  "request-flow-simulator",
  "troubleshooting",
  "architecture-designer",
];

export function DashboardStats() {
  const completedTopics = useProgress((s) => s.completedTopics);
  const labsCompleted = useProgress((s) => s.labsCompleted);
  const scenariosCompleted = useProgress((s) => s.scenariosCompleted);
  const quizAttempts = useProgress((s) => s.quizAttempts);

  const completedCount = Object.values(completedTopics).filter(Boolean).length;
  const totalTopics = LEARN_TOPICS.length;
  const progressPct = totalTopics === 0 ? 0 : Math.round((completedCount / totalTopics) * 100);

  const labsDone = Object.values(labsCompleted).filter(Boolean).length;
  const scenariosDone = Object.values(scenariosCompleted).filter(Boolean).length;

  const correct = quizAttempts.filter((a) => a.correct).length;
  const knowledgeScore = quizAttempts.length === 0 ? null : Math.round((correct / quizAttempts.length) * 100);

  const weakSlugs = Array.from(
    new Set(
      quizAttempts
        .filter((a) => !a.correct)
        .map((a) => a.topicSlug)
    )
  )
    .slice(0, 3)
    .map((slug) => LEARN_TOPICS.find((t) => t.slug === slug)?.title ?? slug);

  const currentModule = LEARN_TOPICS.find((t) => !completedTopics[t.slug]) ?? LEARN_TOPICS[0];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Learning Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="font-mono text-2xl font-semibold">{progressPct}%</span>
              <span className="text-xs text-muted-foreground">
                {completedCount} / {totalTopics} modules
              </span>
            </div>
            <Progress value={progressPct} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <Stat label="Knowledge Score" value={knowledgeScore === null ? "—" : `${knowledgeScore}%`} />
            <Stat label="Labs Completed" value={`${labsDone} / ${LAB_SLUGS.length}`} />
            <Stat label="Scenarios" value={`${scenariosDone} / ${SCENARIOS.length}`} />
            <Stat label="Quiz Attempts" value={String(quizAttempts.length)} />
          </div>
          {weakSlugs.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Weak Areas
              </div>
              <div className="flex flex-wrap gap-1.5">
                {weakSlugs.map((s) => (
                  <span key={s} className="rounded-full border border-status-block/30 bg-status-block/10 px-2.5 py-0.5 text-xs text-status-block">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Continue Learning</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="text-sm font-medium">{currentModule.title}</div>
          <p className="text-xs text-muted-foreground line-clamp-2">{currentModule.description}</p>
          <Button asChild size="sm" className="w-fit gap-1.5">
            <Link href={`/learn/${currentModule.slug}`}>
              Continue <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <QuickAction
        href="/labs/request-flow-simulator"
        icon={<FlaskConical className="size-4" />}
        title="Start a Lab"
        description="Send a request through the full lifecycle simulator."
      />
      <QuickAction
        href="/labs/troubleshooting"
        icon={<Wrench className="size-4" />}
        title="Troubleshoot an Incident"
        description="Diagnose simulated production incidents."
      />
      <QuickAction
        href="/labs/architecture-designer"
        icon={<LayoutGrid className="size-4" />}
        title="Design an Architecture"
        description="Build a solution for a given requirement."
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-colors group-hover:border-brand/50">
        <CardContent className="flex flex-col gap-2 pt-6">
          <div className="flex size-8 items-center justify-center rounded-md bg-brand/10 text-brand">{icon}</div>
          <div className="text-sm font-medium">{title}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

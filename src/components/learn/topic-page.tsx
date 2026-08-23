"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Circle, Clock } from "lucide-react";
import type { TopicContent } from "@/content/types";
import { getLearnTopic } from "@/content/learn";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { Quiz } from "@/components/learn/quiz";
import { NotesPanel } from "@/components/learn/notes-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

const DIFFICULTY_COLOR: Record<TopicContent["difficulty"], string> = {
  Beginner: "border-status-allow/40 text-status-allow",
  Intermediate: "border-status-challenge/40 text-status-challenge",
  Advanced: "border-status-block/40 text-status-block",
};

export function TopicPage({ topic }: { topic: TopicContent }) {
  const isComplete = useProgress((s) => !!s.completedTopics[topic.slug]);
  const markTopicComplete = useProgress((s) => s.markTopicComplete);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("font-normal", DIFFICULTY_COLOR[topic.difficulty])}>
            {topic.difficulty}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" /> {topic.minutes} min
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{topic.title}</h1>
        <p className="text-base text-muted-foreground">{topic.description}</p>
        {topic.configNote && (
          <div className="rounded-md border border-status-challenge/40 bg-status-challenge/10 px-3 py-2 text-xs text-status-challenge">
            {topic.configNote}
          </div>
        )}
        <Button
          size="sm"
          variant={isComplete ? "secondary" : "default"}
          className="mt-1 w-fit gap-1.5"
          onClick={() => markTopicComplete(topic.slug)}
        >
          {isComplete ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
          {isComplete ? "Completed" : "Mark as complete"}
        </Button>
      </div>

      <Section title="Learning Objectives">
        <ul className="flex flex-col gap-1.5">
          {topic.objectives.map((o, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand" />
              {o}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Concepts">
        <div className="flex flex-col gap-6">
          {topic.concepts.map((c, i) => (
            <div key={i} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">{c.heading}</h3>
              {c.body.split("\n\n").map((para, pi) => (
                <p key={pi} className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {para}
                </p>
              ))}
              {c.diagram && <AsciiDiagram>{c.diagram}</AsciiDiagram>}
            </div>
          ))}
        </div>
      </Section>

      {topic.examples && topic.examples.length > 0 && (
        <Section title="Examples">
          <div className="flex flex-col gap-4">
            {topic.examples.map((ex, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4">
                <h4 className="mb-2 text-sm font-semibold">{ex.title}</h4>
                {ex.request && (
                  <AsciiDiagram className="mb-2 text-status-cache">{ex.request}</AsciiDiagram>
                )}
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{ex.body}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {topic.commonMistakes && topic.commonMistakes.length > 0 && (
        <Section title="Common Mistakes">
          <ul className="flex flex-col gap-2">
            {topic.commonMistakes.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-0.5 shrink-0 text-status-challenge">!</span>
                {m}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {topic.troubleshooting && topic.troubleshooting.length > 0 && (
        <Section title="Troubleshooting">
          <div className="flex flex-col gap-4">
            {topic.troubleshooting.map((t, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4">
                <h4 className="mb-3 text-sm font-semibold text-status-block">{t.symptom}</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Likely causes
                    </div>
                    <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                      {t.causes.map((c, ci) => <li key={ci}>• {c}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Investigation
                    </div>
                    <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                      {t.investigation.map((c, ci) => <li key={ci}>• {c}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Remediation
                    </div>
                    <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                      {t.remediation.map((c, ci) => <li key={ci}>• {c}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {topic.quiz && topic.quiz.length > 0 && (
        <Section title="Quiz">
          <Quiz topicSlug={topic.slug} questions={topic.quiz} />
        </Section>
      )}

      <Section title="Personal Knowledge Base">
        <NotesPanel topicSlug={topic.slug} />
      </Section>

      {topic.relatedTopics && topic.relatedTopics.length > 0 && (
        <Section title="Related Topics">
          <div className="flex flex-wrap gap-2">
            {topic.relatedTopics.map((slug) => {
              const related = getLearnTopic(slug);
              if (!related) return null;
              return (
                <Link key={slug} href={`/learn/${slug}`}>
                  <Badge variant="secondary" className="cursor-pointer font-normal hover:bg-accent">
                    {related.title}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {topic.docs && topic.docs.length > 0 && (
        <Section title="Official Documentation">
          <div className="flex flex-col gap-1.5">
            {topic.docs.map((d, i) => (
              <a
                key={i}
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-1 text-sm text-brand hover:underline"
              >
                {d.label} <ArrowUpRight className="size-3.5" />
              </a>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <Separator className="my-8" />
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>
        {children}
      </section>
    </>
  );
}

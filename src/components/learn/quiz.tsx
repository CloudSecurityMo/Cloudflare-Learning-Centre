"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import type { QuizQuestion } from "@/content/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";

export function Quiz({ topicSlug, questions }: { topicSlug: string; questions: QuizQuestion[] }) {
  const recordQuizAttempt = useProgress((s) => s.recordQuizAttempt);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [revealed, setRevealed] = React.useState<Record<string, boolean>>({});

  function choose(q: QuizQuestion, optionIndex: number) {
    if (revealed[q.id]) return;
    // eslint-disable-next-line react-hooks/purity -- event handler, not render: Date.now() here is safe
    const timestamp = Date.now();
    setAnswers((a) => ({ ...a, [q.id]: optionIndex }));
    setRevealed((r) => ({ ...r, [q.id]: true }));
    recordQuizAttempt({
      topicSlug,
      questionId: q.id,
      correct: optionIndex === q.correctIndex,
      timestamp,
    });
  }

  const score = questions.filter((q) => revealed[q.id] && answers[q.id] === q.correctIndex).length;
  const answeredCount = questions.filter((q) => revealed[q.id]).length;

  return (
    <div className="flex flex-col gap-6">
      {answeredCount > 0 && (
        <div className="text-sm text-muted-foreground">
          Score: <span className="font-mono font-medium text-foreground">{score}</span> /{" "}
          <span className="font-mono">{answeredCount}</span> answered
        </div>
      )}
      {questions.map((q, qi) => {
        const isRevealed = revealed[q.id];
        const chosen = answers[q.id];
        return (
          <div key={q.id} className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 text-sm font-medium">
              <span className="text-muted-foreground">Q{qi + 1}.</span> {q.question}
            </div>
            <div className="flex flex-col gap-2">
              {q.options.map((opt, oi) => {
                const isCorrect = oi === q.correctIndex;
                const isChosen = oi === chosen;
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => choose(q, oi)}
                    disabled={isRevealed}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      !isRevealed && "border-border hover:bg-accent/60 cursor-pointer",
                      isRevealed && isCorrect && "border-status-allow/50 bg-status-allow/10",
                      isRevealed && isChosen && !isCorrect && "border-status-block/50 bg-status-block/10",
                      isRevealed && !isCorrect && !isChosen && "border-border opacity-60"
                    )}
                  >
                    <span>{opt}</span>
                    {isRevealed && isCorrect && <Check className="size-4 shrink-0 text-status-allow" />}
                    {isRevealed && isChosen && !isCorrect && <X className="size-4 shrink-0 text-status-block" />}
                  </button>
                );
              })}
            </div>
            {isRevealed && (
              <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}
      {answeredCount > 0 && answeredCount === questions.length && (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => {
            setAnswers({});
            setRevealed({});
          }}
        >
          Retry quiz
        </Button>
      )}
    </div>
  );
}

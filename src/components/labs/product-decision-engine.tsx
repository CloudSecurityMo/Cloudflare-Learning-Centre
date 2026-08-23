"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { ALL_CAPABILITIES, PRODUCT_DECISIONS, type Capability } from "@/content/product-decisions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";

function sameSet(a: Capability[], b: Capability[]) {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((x) => setB.has(x));
}

export function ProductDecisionEngine() {
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<Capability[]>([]);
  const [revealed, setRevealed] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const markLabComplete = useProgress((s) => s.markLabComplete);

  const scenario = PRODUCT_DECISIONS[index];
  const isCorrect = revealed && sameSet(selected, scenario.correct);

  function toggle(cap: Capability) {
    if (revealed) return;
    setSelected((s) => (s.includes(cap) ? s.filter((c) => c !== cap) : [...s, cap]));
  }

  function submit() {
    if (selected.length === 0) return;
    setRevealed(true);
    if (sameSet(selected, scenario.correct)) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 >= PRODUCT_DECISIONS.length) {
      markLabComplete("product-decision-engine");
      setIndex(0);
      setSelected([]);
      setRevealed(false);
      setScore(0);
      return;
    }
    setIndex((i) => i + 1);
    setSelected([]);
    setRevealed(false);
  }

  const isLast = index + 1 >= PRODUCT_DECISIONS.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Scenario {index + 1} / {PRODUCT_DECISIONS.length}
        </span>
        <span className="font-mono">
          Score: {score} / {index + (revealed ? 1 : 0)}
        </span>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Requirement
          </div>
          <p className="mb-6 text-base leading-relaxed">{scenario.requirement}</p>

          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Which capability (or capabilities) satisfy this? Select all that apply.
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_CAPABILITIES.map((cap) => {
              const isSelected = selected.includes(cap);
              const isCorrectAnswer = scenario.correct.includes(cap);
              let tone = "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground";
              if (revealed) {
                if (isCorrectAnswer) tone = "border-status-allow/60 bg-status-allow/10 text-status-allow";
                else if (isSelected) tone = "border-status-block/60 bg-status-block/10 text-status-block";
                else tone = "border-border text-muted-foreground/50";
              } else if (isSelected) {
                tone = "border-brand/60 bg-brand/10 text-brand";
              }
              return (
                <button
                  key={cap}
                  type="button"
                  onClick={() => toggle(cap)}
                  disabled={revealed}
                  className={cn("rounded-full border px-3 py-1.5 text-xs transition-colors", tone)}
                >
                  {cap}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {!revealed ? (
        <Button onClick={submit} disabled={selected.length === 0} className="w-fit">
          Submit
        </Button>
      ) : (
        <>
          <Card className={cn("border-2", isCorrect ? "border-status-allow/50" : "border-status-block/50")}>
            <CardContent className="flex flex-col gap-2 pt-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                {isCorrect ? (
                  <CheckCircle2 className="size-4 text-status-allow" />
                ) : (
                  <XCircle className="size-4 text-status-block" />
                )}
                {isCorrect ? "Correct" : `Correct answer: ${scenario.correct.join(" + ")}`}
              </div>
              <p className="text-sm text-muted-foreground">{scenario.explanation}</p>
              <div className="mt-1 flex flex-col gap-1">
                {scenario.officialSources.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noreferrer" className="w-fit text-xs text-brand hover:underline">
                    {s.title} ↗
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
          <Button onClick={next} className="w-fit gap-1.5">
            {isLast ? "Restart" : "Next scenario"} <ArrowRight className="size-4" />
          </Button>
        </>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { ARCHITECTURE_REVIEWS } from "@/content/architecture-reviews";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";

export function ArchitectureReview() {
  const [reviewId, setReviewId] = React.useState(ARCHITECTURE_REVIEWS[0].id);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [revealed, setRevealed] = React.useState(false);
  const markLabComplete = useProgress((s) => s.markLabComplete);

  const review = ARCHITECTURE_REVIEWS.find((r) => r.id === reviewId)!;

  function toggle(id: string) {
    if (revealed) return;
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function reveal() {
    setRevealed(true);
    markLabComplete("architecture-designer");
  }

  const validCount = review.concerns.filter((c) => c.valid).length;
  const correctlyIdentified = review.concerns.filter((c) => c.valid && selected.includes(c.id)).length;

  return (
    <div className="flex flex-col gap-6">
      <Select
        value={reviewId}
        onValueChange={(v) => {
          setReviewId(v);
          setSelected([]);
          setRevealed(false);
        }}
      >
        <SelectTrigger className="w-full sm:w-96"><SelectValue /></SelectTrigger>
        <SelectContent>
          {ARCHITECTURE_REVIEWS.map((r) => (
            <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Card>
        <CardContent className="pt-6">
          <AsciiDiagram className="mb-4">{review.diagram}</AsciiDiagram>
          <p className="text-sm text-muted-foreground">{review.context}</p>
        </CardContent>
      </Card>

      <div>
        <div className="mb-2 text-sm font-semibold">
          Which of these are legitimate architecture/security concerns? Select all that apply, then justify by revealing.
        </div>
        <div className="flex flex-col gap-2">
          {review.concerns.map((c) => {
            const isSelected = selected.includes(c.id);
            let tone = "border-border hover:bg-accent/60 cursor-pointer";
            if (revealed) {
              if (c.valid) tone = "border-status-allow/50 bg-status-allow/10";
              else if (isSelected) tone = "border-status-block/50 bg-status-block/10";
              else tone = "border-border opacity-60";
            } else if (isSelected) {
              tone = "border-brand/50 bg-brand/10";
            }
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                disabled={revealed}
                className={cn("flex items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors", tone)}
              >
                {revealed &&
                  (c.valid ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-status-allow" />
                  ) : (
                    <XCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  ))}
                {c.text}
              </button>
            );
          })}
        </div>
      </div>

      {!revealed ? (
        <Button onClick={reveal} disabled={selected.length === 0} className="w-fit">
          Reveal assessment
        </Button>
      ) : (
        <Card className="border-brand/40 bg-brand/5">
          <CardContent className="flex flex-col gap-3 pt-6">
            <div className="text-sm font-semibold">
              You identified {correctlyIdentified} / {validCount} real concerns
            </div>
            <div className="flex flex-col gap-2">
              {review.concerns.map((c) => (
                <div key={c.id} className="text-xs text-muted-foreground">
                  <span className={c.valid ? "font-medium text-status-allow" : "font-medium text-muted-foreground/70"}>
                    {c.valid ? "Real concern — " : "Not a real concern — "}
                  </span>
                  {c.explanation}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

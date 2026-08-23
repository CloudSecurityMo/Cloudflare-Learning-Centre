"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { SCENARIOS } from "@/content/scenarios";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress";

export function ScenarioLibrary() {
  const completed = useProgress((s) => s.scenariosCompleted);
  const markScenarioComplete = useProgress((s) => s.markScenarioComplete);

  return (
    <Accordion type="single" collapsible className="flex flex-col gap-3">
      {SCENARIOS.map((s) => {
        const isDone = !!completed[s.slug];
        return (
          <AccordionItem key={s.slug} value={s.slug} className="rounded-lg border border-border bg-card px-4">
            <AccordionTrigger className="text-left hover:no-underline">
              <div className="flex items-center gap-2">
                {isDone ? (
                  <CheckCircle2 className="size-4 shrink-0 text-status-allow" />
                ) : (
                  <Circle className="size-4 shrink-0 text-muted-foreground" />
                )}
                <div>
                  <div className="text-sm font-semibold">{s.title}</div>
                  <div className="text-xs font-normal text-muted-foreground">{s.summary}</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4 pb-2">
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Requirement
                  </div>
                  <p className="text-sm text-foreground/90">{s.requirement}</p>
                </div>
                <AsciiDiagram className="text-xs">{s.diagram}</AsciiDiagram>
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Considerations
                  </div>
                  <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {s.considerations.map((c, i) => <li key={i}>• {c}</li>)}
                  </ul>
                </div>
                <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-sm">
                  <span className="font-semibold text-brand">Recommended: </span>
                  {s.recommended}
                </div>
                <Button
                  size="sm"
                  variant={isDone ? "secondary" : "outline"}
                  className="w-fit"
                  onClick={() => markScenarioComplete(s.slug)}
                >
                  {isDone ? "Completed" : "Mark as reviewed"}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

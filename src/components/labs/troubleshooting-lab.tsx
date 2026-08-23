"use client";

import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { INCIDENTS, type Incident } from "@/content/troubleshooting/incidents";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";

function HypothesisStep({
  incident,
  onProceed,
}: {
  incident: Incident;
  onProceed: () => void;
}) {
  const [chosen, setChosen] = React.useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        What do you investigate first?
      </div>
      <div className="flex flex-col gap-2">
        {incident.hypotheses.map((h, i) => {
          const isChosen = chosen === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setChosen(i)}
              disabled={chosen !== null}
              className={cn(
                "flex items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                chosen === null && "border-border hover:bg-accent/60 cursor-pointer",
                chosen !== null && isChosen && h.correct && "border-status-allow/50 bg-status-allow/10",
                chosen !== null && isChosen && !h.correct && "border-status-block/50 bg-status-block/10",
                chosen !== null && !isChosen && "border-border opacity-60"
              )}
            >
              {chosen !== null && isChosen && (h.correct ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-status-allow" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0 text-status-block" />
              ))}
              {h.text}
            </button>
          );
        })}
      </div>
      {chosen !== null && (
        <>
          <div className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
            {incident.hypotheses[chosen].feedback}
          </div>
          <Button size="sm" variant="outline" className="w-fit" onClick={onProceed}>
            Continue to full diagnosis
          </Button>
        </>
      )}
    </div>
  );
}

function TradeoffStep({ incident }: { incident: Incident }) {
  const [chosen, setChosen] = React.useState<number | null>(null);
  if (!incident.tradeoffs) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        What should you do?
      </div>
      <div className="flex flex-col gap-2">
        {incident.tradeoffs.map((t, i) => {
          const isChosen = chosen === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setChosen(i)}
              className={cn(
                "flex items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors cursor-pointer",
                isChosen && t.recommended && "border-status-allow/50 bg-status-allow/10",
                isChosen && !t.recommended && "border-status-challenge/50 bg-status-challenge/10",
                !isChosen && "border-border hover:bg-accent/60"
              )}
            >
              {isChosen && (t.recommended ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-status-allow" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0 text-status-challenge" />
              ))}
              {t.action}
            </button>
          );
        })}
      </div>
      {chosen !== null && (
        <div className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
          {incident.tradeoffs[chosen].consequence}
        </div>
      )}
    </div>
  );
}

export function TroubleshootingLab() {
  const [pastHypothesis, setPastHypothesis] = React.useState<Record<string, boolean>>({});
  const markLabComplete = useProgress((s) => s.markLabComplete);

  return (
    <Accordion type="single" collapsible className="flex flex-col gap-3">
      {INCIDENTS.map((inc) => (
        <AccordionItem key={inc.id} value={inc.id} className="rounded-lg border border-border bg-card px-4">
          <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
            {inc.title}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4 pb-2">
              <p className="text-sm text-muted-foreground">{inc.symptom}</p>
              <AsciiDiagram className="text-xs">{inc.architecture}</AsciiDiagram>

              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence</div>
                <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {inc.evidence.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              </div>

              {!pastHypothesis[inc.id] ? (
                <HypothesisStep
                  incident={inc}
                  onProceed={() => {
                    setPastHypothesis((r) => ({ ...r, [inc.id]: true }));
                    markLabComplete("troubleshooting");
                  }}
                />
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <TroubleshootCol title="Likely causes" items={inc.likelyCauses} />
                    <TroubleshootCol title="Investigation steps" items={inc.investigation} />
                    <TroubleshootCol title="Remediation" items={inc.remediation} />
                  </div>
                  <div className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground/80">Explanation: </span>
                    {inc.explanation}
                  </div>
                  <TradeoffStep incident={inc} />
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function TroubleshootCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
        {items.map((it, i) => <li key={i}>• {it}</li>)}
      </ul>
    </div>
  );
}

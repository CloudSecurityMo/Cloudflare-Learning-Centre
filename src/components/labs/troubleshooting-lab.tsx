"use client";

import * as React from "react";
import { INCIDENTS } from "@/content/troubleshooting/incidents";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress";

export function TroubleshootingLab() {
  const [revealed, setRevealed] = React.useState<Record<string, boolean>>({});
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

              {!revealed[inc.id] ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-fit"
                  onClick={() => {
                    setRevealed((r) => ({ ...r, [inc.id]: true }));
                    markLabComplete("troubleshooting");
                  }}
                >
                  Reveal diagnosis
                </Button>
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

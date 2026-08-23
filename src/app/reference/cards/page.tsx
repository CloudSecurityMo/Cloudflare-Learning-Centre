import { KNOWLEDGE_CARDS } from "@/content/reference/cards";
import { Card, CardContent } from "@/components/ui/card";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";

export default function KnowledgeCardsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Knowledge Cards</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Short, self-contained reference cards for the concepts you&apos;ll hit most often.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {KNOWLEDGE_CARDS.map((c) => (
          <Card key={c.slug}>
            <CardContent className="flex flex-col gap-2.5 pt-6">
              <h3 className="text-base font-semibold">{c.question}</h3>
              <p className="text-sm text-foreground/90">{c.definition}</p>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Why it matters</div>
                <p className="text-xs text-muted-foreground">{c.whyItMatters}</p>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Example</div>
                <AsciiDiagram className="mt-1 text-xs">{c.example}</AsciiDiagram>
              </div>
              {c.architecture && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Architecture</div>
                  <p className="text-xs text-muted-foreground">{c.architecture}</p>
                </div>
              )}
              <div className="rounded-md border border-status-challenge/30 bg-status-challenge/10 p-2 text-xs text-status-challenge">
                <span className="font-medium">Common misconception: </span>
                {c.misconception}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

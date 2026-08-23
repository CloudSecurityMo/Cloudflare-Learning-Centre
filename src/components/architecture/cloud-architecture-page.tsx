import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getScenario } from "@/content/scenarios";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CloudArchitecturePage({
  title,
  description,
  modelId,
  scenarioSlug,
}: {
  title: string;
  description: string;
  modelId: string;
  scenarioSlug: string;
}) {
  const scenario = getScenario(scenarioSlug);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      {scenario && (
        <>
          <AsciiDiagram className="mb-6">{scenario.diagram}</AsciiDiagram>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Considerations
              </div>
              <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                {scenario.considerations.map((c, i) => <li key={i}>• {c}</li>)}
              </ul>
            </CardContent>
          </Card>

          <div className="mb-6 rounded-md border border-brand/30 bg-brand/5 p-4 text-sm">
            <span className="font-semibold text-brand">Recommended: </span>
            {scenario.recommended}
          </div>
        </>
      )}

      <Button asChild className="gap-1.5">
        <Link href={`/architecture/deployment-models?model=${modelId}`}>
          Open interactive diagram <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}

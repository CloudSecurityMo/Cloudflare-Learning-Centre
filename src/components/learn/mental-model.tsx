import { Scale } from "lucide-react";
import type { MentalModel, MentalModelSide } from "@/content/mental-models";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { Card, CardContent } from "@/components/ui/card";

function SideCard({ side }: { side: MentalModelSide }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-semibold">{side.label}</div>
      <AsciiDiagram className="text-[11px]">{side.diagram}</AsciiDiagram>
      <ul className="flex flex-col gap-1.5">
        {side.points.map((p, i) => (
          <li key={i} className="text-xs leading-relaxed text-muted-foreground">
            • {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MentalModelCard({ model }: { model: MentalModel }) {
  return (
    <Card className="border-brand/30 bg-brand/[0.03]">
      <CardContent className="pt-6">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand">
          <Scale className="size-3.5" /> Mental Model — {model.title}
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{model.prompt}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <SideCard side={model.sideA} />
          <SideCard side={model.sideB} />
        </div>
        <div className="mt-4 rounded-md bg-muted/40 p-3 text-sm leading-relaxed">{model.explanation}</div>
      </CardContent>
    </Card>
  );
}

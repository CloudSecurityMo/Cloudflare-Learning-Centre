import { NETWORK_FLOWS, NETWORK_FLOWS_SOURCES } from "@/content/architecture/network-flows";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { SourceVerification } from "@/components/learn/source-verification";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function NetworkFlowsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Network Flows</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Not every workload is an HTTP(S) website. Three genuinely different products handle traffic at
          different network layers and different scopes — from one hostname, to one TCP/UDP application, to
          an entire IP prefix.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {NETWORK_FLOWS.map((flow) => (
          <Card key={flow.id}>
            <CardContent className="flex flex-col gap-3 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold">{flow.title}</h2>
                <Badge variant="outline" className="font-mono text-[10px]">{flow.layer}</Badge>
              </div>
              <AsciiDiagram className="text-xs">{flow.diagram}</AsciiDiagram>
              <p className="text-sm text-muted-foreground">{flow.summary}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Scope</div>
                  <p className="text-xs text-muted-foreground">{flow.scope}</p>
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Protects</div>
                  <p className="text-xs text-muted-foreground">{flow.protects}</p>
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-status-challenge">Limitations</div>
                  <p className="text-xs text-muted-foreground">{flow.limitations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <SourceVerification sources={NETWORK_FLOWS_SOURCES} lastVerified="2026-08-23" />
      </div>
    </div>
  );
}

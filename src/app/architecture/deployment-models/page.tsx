"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { DEPLOYMENT_MODELS } from "@/content/architecture/deployment-models";
import { ArchitectureFlow } from "@/components/diagrams/architecture-flow";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function DeploymentModelsPage() {
  return (
    <React.Suspense fallback={null}>
      <DeploymentModelsContent />
    </React.Suspense>
  );
}

function DeploymentModelsContent() {
  const searchParams = useSearchParams();
  const requested = searchParams.get("model");
  const initial = DEPLOYMENT_MODELS.find((m) => m.id === requested)?.id ?? DEPLOYMENT_MODELS[0].id;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Deployment Models</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          The same request can take structurally different paths depending on how Cloudflare is deployed.
          Compare six real patterns — click any node in a diagram for a full breakdown.
        </p>
      </div>

      <Tabs defaultValue={initial}>
        <TabsList className="mb-6 h-auto flex-wrap justify-start gap-1">
          {DEPLOYMENT_MODELS.map((m) => (
            <TabsTrigger key={m.id} value={m.id} className="gap-1.5">
              <span className="font-mono text-xs opacity-60">{m.letter}</span> {m.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {DEPLOYMENT_MODELS.map((m) => (
          <TabsContent key={m.id} value={m.id} className="flex flex-col gap-6">
            <p className="text-sm text-muted-foreground">{m.summary}</p>
            <ArchitectureFlow nodes={m.nodes} edges={m.edges} />

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard title="DNS Flow" body={m.dnsFlow} />
              <InfoCard title="TCP/TLS Flow" body={m.tlsFlow} />
              <InfoCard title="HTTP Flow" body={m.httpFlow} />
              <InfoCard title="Source IP Considerations" body={m.sourceIp} />
              <InfoCard title="Headers" body={m.headers} />
              <InfoCard title="Origin Exposure" body={m.originExposure} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ListCard title="Security Inspection Points" items={m.inspectionPoints} />
              <ListCard title="Failure Points" items={m.failurePoints} tone="warn" />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
        <p className="text-sm leading-relaxed">{body}</p>
      </CardContent>
    </Card>
  );
}

function ListCard({ title, items, tone }: { title: string; items: string[]; tone?: "warn" }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
        <ul className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <li key={i} className={`text-sm ${tone === "warn" ? "text-status-block" : ""}`}>
              • {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

"use client";

import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  CATEGORIES,
  DEFAULT_SELECTIONS,
  REQUIREMENTS,
  TAG_LABELS,
  scoreRequirement,
  type Selections,
} from "@/lib/architecture-designer";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";

export function ArchitectureDesigner() {
  const [reqId, setReqId] = React.useState(REQUIREMENTS[0].id);
  const [selections, setSelections] = React.useState<Selections>(DEFAULT_SELECTIONS);
  const [showRecommended, setShowRecommended] = React.useState(false);
  const markLabComplete = useProgress((s) => s.markLabComplete);

  const requirement = REQUIREMENTS.find((r) => r.id === reqId)!;
  const result = scoreRequirement(requirement, selections);

  React.useEffect(() => {
    if (result.percent === 100) markLabComplete("architecture-designer");
  }, [result.percent, markLabComplete]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Requirement
          </div>
          <Select
            value={reqId}
            onValueChange={(v) => {
              setReqId(v);
              setSelections(DEFAULT_SELECTIONS);
              setShowRecommended(false);
            }}
          >
            <SelectTrigger className="mb-3 w-full sm:w-96"><SelectValue /></SelectTrigger>
            <SelectContent>
              {REQUIREMENTS.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-foreground/90">{requirement.prompt}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            {CATEGORIES.map((cat) => (
              <div key={cat.key}>
                <label className="mb-1.5 block text-xs text-muted-foreground">{cat.label}</label>
                <Select
                  value={selections[cat.key]}
                  onValueChange={(v) => setSelections((s) => ({ ...s, [cat.key]: v }))}
                >
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {cat.options.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Architecture score
                </span>
                <span className="font-mono text-xl font-semibold">{result.percent}%</span>
              </div>
              <Progress value={result.percent} className="mb-3" />
              {result.bypassedEdge && (
                <p className="mb-2 rounded-md border border-status-block/40 bg-status-block/10 p-2 text-xs text-status-block">
                  DNS is set to DNS-only — no Cloudflare edge product applies regardless of any other
                  selection. Every requirement below is unmet until this is proxied.
                </p>
              )}
              <div className="flex flex-col gap-1.5">
                {requirement.requiredTags.map((tag) => {
                  const met = result.met.includes(tag);
                  return (
                    <div key={tag} className="flex items-start gap-2 text-xs">
                      {met ? (
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-status-allow" />
                      ) : (
                        <XCircle className="mt-0.5 size-3.5 shrink-0 text-status-block" />
                      )}
                      <span className={cn(!met && "text-muted-foreground")}>{TAG_LABELS[tag] ?? tag}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {!showRecommended ? (
            <Button variant="outline" size="sm" onClick={() => setShowRecommended(true)}>
              Reveal recommended architecture
            </Button>
          ) : (
            <Card className="border-brand/40 bg-brand/5">
              <CardContent className="pt-6">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">
                  Recommended architecture
                </div>
                <ul className="flex flex-col gap-1 text-sm">
                  {CATEGORIES.map((cat) => {
                    const opt = cat.options.find((o) => o.id === requirement.idealSelections[cat.key]);
                    return (
                      <li key={cat.key} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{cat.label}</span>
                        <span className="text-right font-medium">{opt?.label}</span>
                      </li>
                    );
                  })}
                </ul>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3 w-fit"
                  onClick={() => setSelections(requirement.idealSelections)}
                >
                  Apply recommended selections
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { evaluateRateLimit, type RateLimitConfig } from "@/lib/rate-limit-lab";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";

const PRESETS: { label: string; cfg: RateLimitConfig }[] = [
  { label: "Login endpoint (typical)", cfg: { thresholdRequests: 10, periodSeconds: 60, legitimateBurst: 4, attackRate: 200 } },
  { label: "Threshold too strict", cfg: { thresholdRequests: 3, periodSeconds: 60, legitimateBurst: 4, attackRate: 200 } },
  { label: "Threshold too loose", cfg: { thresholdRequests: 500, periodSeconds: 60, legitimateBurst: 4, attackRate: 200 } },
  { label: "Low-and-slow attacker", cfg: { thresholdRequests: 10, periodSeconds: 60, legitimateBurst: 12, attackRate: 8 } },
];

const VERDICT_STYLE: Record<string, string> = {
  balanced: "border-status-allow/50",
  "too-strict": "border-status-challenge/50",
  "too-loose": "border-status-block/50",
  "both-wrong": "border-status-block/50",
};

export function RateLimitLab() {
  const [cfg, setCfg] = React.useState<RateLimitConfig>(PRESETS[0].cfg);
  const markLabComplete = useProgress((s) => s.markLabComplete);
  const result = evaluateRateLimit(cfg);

  React.useEffect(() => {
    markLabComplete("rate-limit-lab");
  }, [markLabComplete]);

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="h-fit">
        <CardContent className="flex flex-col gap-4 pt-6">
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Preset scenarios</Label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setCfg(p.cfg)}
                  className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Threshold (requests)</Label>
              <Input
                type="number"
                min={1}
                value={cfg.thresholdRequests}
                onChange={(e) => setCfg((c) => ({ ...c, thresholdRequests: Number(e.target.value) }))}
                className="font-mono text-sm"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Period</Label>
              <Select
                value={String(cfg.periodSeconds)}
                onValueChange={(v) => setCfg((c) => ({ ...c, periodSeconds: Number(v) }))}
              >
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10s</SelectItem>
                  <SelectItem value="60">60s (1 min)</SelectItem>
                  <SelectItem value="300">300s (5 min)</SelectItem>
                  <SelectItem value="3600">3600s (1 hr)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Legitimate user burst (requests in the period)
            </Label>
            <Input
              type="number"
              min={0}
              value={cfg.legitimateBurst}
              onChange={(e) => setCfg((c) => ({ ...c, legitimateBurst: Number(e.target.value) }))}
              className="font-mono text-sm"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              e.g. a flaky mobile connection retrying, or a single-page app double-submitting.
            </p>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Attack traffic rate (requests in the period)
            </Label>
            <Input
              type="number"
              min={0}
              value={cfg.attackRate}
              onChange={(e) => setCfg((c) => ({ ...c, attackRate: Number(e.target.value) }))}
              className="font-mono text-sm"
            />
          </div>

          <AsciiDiagram className="text-xs">
            {`COUNT BY ip.src\nPERIOD ${cfg.periodSeconds}s  THRESHOLD ${cfg.thresholdRequests}\nTHEN Managed Challenge`}
          </AsciiDiagram>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className={cn("border-2", result.legitimateBlocked ? "border-status-block/50" : "border-status-allow/50")}>
            <CardContent className="flex flex-col gap-2 pt-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                {result.legitimateBlocked ? (
                  <XCircle className="size-4 text-status-block" />
                ) : (
                  <CheckCircle2 className="size-4 text-status-allow" />
                )}
                Legitimate user
              </div>
              <p className="text-xs text-muted-foreground">
                {cfg.legitimateBurst} requests / {cfg.periodSeconds}s —{" "}
                {result.legitimateBlocked ? "challenged/blocked (false positive)" : "allowed through"}
              </p>
            </CardContent>
          </Card>
          <Card className={cn("border-2", result.attackBlocked ? "border-status-allow/50" : "border-status-block/50")}>
            <CardContent className="flex flex-col gap-2 pt-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                {result.attackBlocked ? (
                  <CheckCircle2 className="size-4 text-status-allow" />
                ) : (
                  <XCircle className="size-4 text-status-block" />
                )}
                Attack traffic
              </div>
              <p className="text-xs text-muted-foreground">
                {cfg.attackRate} requests / {cfg.periodSeconds}s —{" "}
                {result.attackBlocked ? "stopped" : "gets through undetected"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className={cn("border-2", VERDICT_STYLE[result.verdict])}>
          <CardContent className="flex flex-col gap-2 pt-6">
            <div className="flex items-center gap-2 text-base font-semibold">
              {result.verdict === "balanced" ? (
                <CheckCircle2 className="size-5 text-status-allow" />
              ) : result.verdict === "too-strict" ? (
                <AlertTriangle className="size-5 text-status-challenge" />
              ) : (
                <XCircle className="size-5 text-status-block" />
              )}
              {result.headline}
            </div>
            <p className="text-sm text-muted-foreground">{result.explanation}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

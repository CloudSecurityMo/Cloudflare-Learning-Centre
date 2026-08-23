"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ban, CheckCircle2, CircleDashed, Loader2, RotateCw, Send } from "lucide-react";
import { simulateRequest, type SimRequest, type SimulationResult } from "@/lib/simulate-request";
import { STAGE_META, STAGE_ORDER } from "@/content/simulator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";

const COUNTRIES = [
  { code: "US", label: "US — United States" },
  { code: "GB", label: "GB — United Kingdom" },
  { code: "DE", label: "DE — Germany" },
  { code: "AU", label: "AU — Australia" },
  { code: "IN", label: "IN — India" },
  { code: "BR", label: "BR — Brazil" },
  { code: "JP", label: "JP — Japan" },
  { code: "RU", label: "RU — Russia" },
  { code: "CN", label: "CN — China" },
  { code: "KP", label: "KP — North Korea" },
  { code: "IR", label: "IR — Iran" },
];

const DEFAULT_REQUEST: SimRequest = {
  method: "GET",
  hostname: "app.example.com",
  protocol: "HTTPS",
  path: "/",
  query: "",
  body: "",
  country: "US",
  sourceIp: "203.0.113.50",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
  botScore: 85,
  requestsPerMinute: 4,
  proxied: true,
};

const PRESETS: { label: string; req: Partial<SimRequest> }[] = [
  { label: "Normal page load", req: { method: "GET", path: "/", query: "", body: "", botScore: 85, requestsPerMinute: 4 } },
  { label: "Static asset", req: { method: "GET", path: "/images/logo.png", query: "", body: "", botScore: 85, requestsPerMinute: 4 } },
  { label: "SQL injection attempt", req: { method: "GET", path: "/search", query: "q=' OR 1=1--", body: "", botScore: 85, requestsPerMinute: 4 } },
  { label: "XSS attempt", req: { method: "GET", path: "/comment", query: "text=<script>alert(1)</script>", body: "", botScore: 85, requestsPerMinute: 4 } },
  { label: "Geo-restricted admin access", req: { method: "GET", path: "/admin", query: "", body: "", country: "RU", botScore: 85, requestsPerMinute: 4 } },
  { label: "Scraper bot", req: { method: "GET", path: "/products/1", query: "", body: "", botScore: 6, userAgent: "python-requests/2.31", requestsPerMinute: 4 } },
  { label: "Credential stuffing", req: { method: "POST", path: "/api/login", query: "", body: "{\"user\":\"a\",\"pass\":\"b\"}", botScore: 20, requestsPerMinute: 240 } },
  { label: "Volumetric flood", req: { method: "GET", path: "/", query: "", body: "", botScore: 85, requestsPerMinute: 5000 } },
];

export function RequestSimulator() {
  const [req, setReq] = React.useState<SimRequest>(DEFAULT_REQUEST);
  const [result, setResult] = React.useState<SimulationResult | null>(null);
  const [revealCount, setRevealCount] = React.useState(0);
  const markLabComplete = useProgress((s) => s.markLabComplete);

  function send() {
    const r = simulateRequest(req);
    setResult(r);
    setRevealCount(0);
    markLabComplete("request-flow-simulator");
  }

  const isDone = !!result && revealCount >= result.stages.length;
  const running = !!result && !isDone;

  React.useEffect(() => {
    if (!running || !result) return;
    const t = setTimeout(() => setRevealCount((c) => c + 1), 400);
    return () => clearTimeout(t);
  }, [running, result, revealCount]);

  const visibleStages = result ? result.stages.slice(0, revealCount) : [];
  const lastVisible = visibleStages[visibleStages.length - 1];

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <Card className="h-fit">
        <CardContent className="flex flex-col gap-4 pt-6">
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Preset scenarios</Label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() =>
                    setReq((r) => ({
                      ...DEFAULT_REQUEST,
                      hostname: r.hostname,
                      sourceIp: r.sourceIp,
                      userAgent: r.userAgent,
                      proxied: r.proxied,
                      ...p.req,
                    }))
                  }
                  className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[90px_1fr] gap-2">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Method</Label>
              <Select value={req.method} onValueChange={(v) => setReq((r) => ({ ...r, method: v as "GET" | "POST" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Hostname</Label>
              <Input value={req.hostname} onChange={(e) => setReq((r) => ({ ...r, hostname: e.target.value }))} className="font-mono text-sm" />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Path</Label>
            <Input value={req.path} onChange={(e) => setReq((r) => ({ ...r, path: e.target.value }))} className="font-mono text-sm" />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Query string</Label>
            <Input
              value={req.query}
              onChange={(e) => setReq((r) => ({ ...r, query: e.target.value }))}
              placeholder="q=hello"
              className="font-mono text-sm"
            />
          </div>

          {req.method === "POST" && (
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Body</Label>
              <Textarea
                value={req.body}
                onChange={(e) => setReq((r) => ({ ...r, body: e.target.value }))}
                rows={2}
                className="font-mono text-xs"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Country</Label>
              <Select value={req.country} onValueChange={(v) => setReq((r) => ({ ...r, country: v }))}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Protocol</Label>
              <Select value={req.protocol} onValueChange={(v) => setReq((r) => ({ ...r, protocol: v as "HTTPS" | "HTTP" }))}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HTTPS">HTTPS</SelectItem>
                  <SelectItem value="HTTP">HTTP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Source IP</Label>
            <Input value={req.sourceIp} onChange={(e) => setReq((r) => ({ ...r, sourceIp: e.target.value }))} className="font-mono text-sm" />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">User-Agent</Label>
            <Input value={req.userAgent} onChange={(e) => setReq((r) => ({ ...r, userAgent: e.target.value }))} className="font-mono text-xs" />
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <Label className="text-xs text-muted-foreground">Bot score</Label>
              <span className="font-mono text-xs">{req.botScore} / 99</span>
            </div>
            <input
              type="range"
              min={1}
              max={99}
              value={req.botScore}
              onChange={(e) => setReq((r) => ({ ...r, botScore: Number(e.target.value) }))}
              className="w-full accent-brand"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Automated</span>
              <span>Human</span>
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Requests / minute (this key)</Label>
            <Input
              type="number"
              min={0}
              value={req.requestsPerMinute}
              onChange={(e) => setReq((r) => ({ ...r, requestsPerMinute: Number(e.target.value) }))}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <div className="min-w-0">
              <div className="text-sm">DNS record is proxied</div>
              <div className="text-xs text-muted-foreground">Off simulates a DNS-only record — Cloudflare is bypassed entirely.</div>
            </div>
            <Switch checked={req.proxied} onCheckedChange={(v) => setReq((r) => ({ ...r, proxied: v }))} className="shrink-0" />
          </div>

          <AsciiDiagram className="text-xs">
            {`${req.method} ${req.protocol.toLowerCase()}://${req.hostname}${req.path}${req.query ? "?" + req.query : ""}`}
          </AsciiDiagram>

          <Button onClick={send} className="gap-1.5" disabled={running}>
            {running ? <Loader2 className="size-4 animate-spin" /> : result ? <RotateCw className="size-4" /> : <Send className="size-4" />}
            {result ? "RE-EVALUATE" : "SEND REQUEST"}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground/80">Conceptual request-processing model.</span> Stage
          order mirrors Cloudflare&apos;s documented security phase order; exact behavior depends on plan,
          configuration, and traffic type. This is an educational simulation, not a reproduction of
          Cloudflare&apos;s proprietary detection systems.
        </div>

        <div className="flex flex-col gap-2">
          {STAGE_ORDER.map((stageId, i) => {
            const stage = visibleStages.find((s) => s.stageId === stageId);
            const isPending = !stage;
            const isCurrent = lastVisible?.stageId === stageId && running;
            return (
              <motion.div
                key={stageId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: isPending ? 0.35 : 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex items-start gap-3 rounded-lg border px-4 py-3",
                  stage?.blocked
                    ? "border-status-block/50 bg-status-block/10"
                    : stage?.skipped
                    ? "border-border bg-muted/20"
                    : stage
                    ? "border-status-allow/40 bg-status-allow/5"
                    : "border-border"
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {isPending ? (
                    <CircleDashed className="size-4 text-muted-foreground" />
                  ) : stage.blocked ? (
                    <Ban className="size-4 text-status-block" />
                  ) : stage.skipped ? (
                    <CircleDashed className="size-4 text-muted-foreground" />
                  ) : (
                    <CheckCircle2 className="size-4 text-status-allow" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-semibold">
                      {i + 1}. {STAGE_META[stageId].label}
                    </span>
                    {isCurrent && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
                  </div>
                  {!stage && <p className="text-xs text-muted-foreground">{STAGE_META[stageId].blurb}</p>}
                  <AnimatePresence>
                    {stage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="overflow-hidden"
                      >
                        <p className="mt-1 text-sm font-medium">{stage.decision}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{stage.detail}</p>
                        {stage.evidence && stage.evidence.length > 0 && (
                          <div className="mt-2 rounded-md bg-muted/40 p-2">
                            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Evidence
                            </div>
                            <ul className="flex flex-col gap-0.5">
                              {stage.evidence.map((e, ei) => (
                                <li key={ei} className="font-mono text-[11px] text-foreground/80">
                                  {e}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {stage.relevantLogs && (
                          <p className="mt-1.5 text-[11px] text-muted-foreground">
                            <span className="font-medium text-foreground/70">Relevant logs: </span>
                            {stage.relevantLogs}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {isDone && result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={cn("border-2", result.blockedAt ? "border-status-block/50" : "border-status-allow/50")}>
                <CardContent className="flex flex-wrap items-center gap-4 pt-6">
                  <div>
                    <div className="text-xs text-muted-foreground">Final status</div>
                    <div className={cn("font-mono text-2xl font-semibold", result.blockedAt ? "text-status-block" : "text-status-allow")}>
                      {result.finalStatus}
                    </div>
                    <div className="text-xs text-muted-foreground">{result.finalStatusLabel}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">cf-cache-status</div>
                    <Badge variant="outline" className="mt-1 font-mono">{result.cacheStatus}</Badge>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Ray ID</div>
                    <div className="font-mono text-sm">{result.rayId}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { evaluateTls, type OriginCertState, type TlsMode } from "@/lib/tls-lab";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { useProgress } from "@/lib/progress";

const MODE_LABELS: Record<TlsMode, string> = {
  off: "Off",
  flexible: "Flexible",
  full: "Full",
  "full-strict": "Full (Strict)",
};

const ORIGIN_LABELS: Record<OriginCertState, string> = {
  valid: "Valid, trusted certificate",
  invalid: "Self-signed / expired certificate",
  none: "No HTTPS listener (HTTP only)",
};

export function TlsLab() {
  const [mode, setMode] = React.useState<TlsMode>("full-strict");
  const [origin, setOrigin] = React.useState<OriginCertState>("valid");
  const markLabComplete = useProgress((s) => s.markLabComplete);
  const outcome = evaluateTls(mode, origin);

  React.useEffect(() => {
    markLabComplete("tls-lab");
  }, [markLabComplete]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card>
        <CardContent className="flex flex-col gap-5 pt-6">
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">SSL/TLS mode</label>
            <Select value={mode} onValueChange={(v) => setMode(v as TlsMode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(MODE_LABELS) as TlsMode[]).map((m) => (
                  <SelectItem key={m} value={m}>{MODE_LABELS[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">Origin certificate state</label>
            <Select value={origin} onValueChange={(v) => setOrigin(v as OriginCertState)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(ORIGIN_LABELS) as OriginCertState[]).map((o) => (
                  <SelectItem key={o} value={o}>{ORIGIN_LABELS[o]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AsciiDiagram className="text-xs">
            {`Browser --[${outcome.browserLeg}]--> Cloudflare --[${outcome.originLeg}]--> Origin`}
          </AsciiDiagram>
        </CardContent>
      </Card>

      <Card
        className={
          outcome.status === "ok"
            ? "border-status-allow/50"
            : outcome.status === "error"
            ? "border-status-block/50"
            : "border-status-challenge/50"
        }
      >
        <CardContent className="flex flex-col gap-3 pt-6">
          <div className="flex items-center gap-2">
            {outcome.status === "ok" && <CheckCircle2 className="size-5 text-status-allow" />}
            {outcome.status === "error" && <XCircle className="size-5 text-status-block" />}
            {outcome.status === "insecure" && <AlertTriangle className="size-5 text-status-challenge" />}
            <span className="text-lg font-semibold">
              {outcome.errorCode ? `Error ${outcome.errorCode}` : outcome.status === "insecure" ? "Works, but insecure" : "Success"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{outcome.message}</p>
        </CardContent>
      </Card>
    </div>
  );
}

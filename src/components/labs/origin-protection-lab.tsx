"use client";

import * as React from "react";
import { AlertTriangle, ShieldCheck, ShieldOff } from "lucide-react";
import { evaluateOriginProtection, type OriginProtectionConfig } from "@/lib/origin-protection";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";

const CONTROLS: { key: keyof OriginProtectionConfig; label: string; description: string }[] = [
  {
    key: "staleDnsRecord",
    label: "Stale DNS-only record exists",
    description: "A forgotten subdomain (e.g. direct.example.com) still resolves to the origin's real IP, DNS-only.",
  },
  {
    key: "firewallRestrictedToCloudflare",
    label: "Origin firewall restricted to Cloudflare IP ranges",
    description: "The origin only accepts inbound connections from Cloudflare's published IP ranges.",
  },
  {
    key: "authenticatedOriginPulls",
    label: "Authenticated Origin Pulls (mTLS) enabled",
    description: "The origin requires a valid Cloudflare client certificate on every connection.",
  },
  {
    key: "tunnelInUse",
    label: "Cloudflare Tunnel in use",
    description: "cloudflared connects outbound — there's no public inbound port on the origin at all.",
  },
];

const DEFAULT_CONFIG: OriginProtectionConfig = {
  staleDnsRecord: true,
  firewallRestrictedToCloudflare: false,
  authenticatedOriginPulls: false,
  tunnelInUse: false,
};

export function OriginProtectionLab() {
  const [cfg, setCfg] = React.useState<OriginProtectionConfig>(DEFAULT_CONFIG);
  const markLabComplete = useProgress((s) => s.markLabComplete);
  const result = evaluateOriginProtection(cfg);

  React.useEffect(() => {
    markLabComplete("origin-protection");
  }, [markLabComplete]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-6">
        <AsciiDiagram>
          {result.bypassable
            ? "Internet\n   |\n   +----→ Cloudflare (WAF, Bot Mgmt, DDoS — all bypassed)\n   |\n   +----→ Origin IP (attacker connects directly)"
            : "Internet\n   |\nCloudflare (WAF, Bot Mgmt, DDoS mitigation apply)\n   |\nOrigin (not directly reachable)"}
        </AsciiDiagram>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            {CONTROLS.map((c) => (
              <div key={c.key} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{c.label}</div>
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                </div>
                <Switch
                  checked={cfg[c.key]}
                  onCheckedChange={(v) => setCfg((prev) => ({ ...prev, [c.key]: v }))}
                  className="shrink-0"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground/80">Core principle: </span>
          Cloudflare only controls traffic that actually passes through Cloudflare. Every control above works
          by either removing the origin&apos;s public reachability entirely (Tunnel) or by making the origin
          reject anything that didn&apos;t come through Cloudflare (IP allowlisting, Authenticated Origin Pulls).
        </div>
      </div>

      <Card
        className={cn(
          "h-fit border-2",
          result.bypassable
            ? "border-status-block/50"
            : result.connectable
            ? "border-status-challenge/50"
            : "border-status-allow/50"
        )}
      >
        <CardContent className="flex flex-col gap-3 pt-6">
          <div className="flex items-center gap-2">
            {result.bypassable ? (
              <ShieldOff className="size-5 text-status-block" />
            ) : result.connectable ? (
              <AlertTriangle className="size-5 text-status-challenge" />
            ) : (
              <ShieldCheck className="size-5 text-status-allow" />
            )}
            <span className="text-base font-semibold">{result.headline}</span>
          </div>
          <p className="text-sm text-muted-foreground">{result.explanation}</p>
        </CardContent>
      </Card>
    </div>
  );
}

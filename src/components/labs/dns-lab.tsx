"use client";

import * as React from "react";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useProgress } from "@/lib/progress";

interface ZoneRecord {
  name: string;
  type: "A" | "CNAME" | "MX" | "TXT";
  value: string;
  proxiable: boolean;
  defaultProxied: boolean;
}

const ZONE: ZoneRecord[] = [
  { name: "example.com", type: "A", value: "203.0.113.10", proxiable: true, defaultProxied: true },
  { name: "www.example.com", type: "CNAME", value: "example.com", proxiable: true, defaultProxied: true },
  { name: "staging.example.com", type: "A", value: "203.0.113.10", proxiable: true, defaultProxied: false },
  { name: "mail.example.com", type: "A", value: "198.51.100.5", proxiable: false, defaultProxied: false },
  { name: "example.com (MX)", type: "MX", value: "10 mail.example.com", proxiable: false, defaultProxied: false },
  { name: "example.com (TXT)", type: "TXT", value: "\"v=spf1 include:_spf.example.com ~all\"", proxiable: false, defaultProxied: false },
];

export function DnsLab() {
  const [proxied, setProxied] = React.useState<Record<string, boolean>>(
    Object.fromEntries(ZONE.filter((r) => r.proxiable).map((r) => [r.name, r.defaultProxied]))
  );
  const markLabComplete = useProgress((s) => s.markLabComplete);

  React.useEffect(() => {
    markLabComplete("dns-lab");
  }, [markLabComplete]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardContent className="flex flex-col gap-1 pt-6">
          {ZONE.map((r) => {
            const isProxied = r.proxiable ? proxied[r.name] : false;
            return (
              <div key={r.name} className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{r.name}</span>
                    <Badge variant="outline" className="font-mono text-[10px]">{r.type}</Badge>
                  </div>
                  <div className="truncate font-mono text-xs text-muted-foreground">{r.value}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`text-xs ${!r.proxiable ? "text-muted-foreground/50" : isProxied ? "text-brand" : "text-muted-foreground"}`}>
                    {r.proxiable ? (isProxied ? "Proxied" : "DNS only") : "Not proxyable"}
                  </span>
                  <Switch
                    checked={isProxied}
                    disabled={!r.proxiable}
                    onCheckedChange={(v) => setProxied((p) => ({ ...p, [r.name]: v }))}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {ZONE.filter((r) => r.proxiable).map((r) => {
          const isProxied = proxied[r.name];
          return (
            <Card key={r.name} className={isProxied ? "border-brand/40" : "border-border"}>
              <CardContent className="pt-5">
                <div className="mb-2 font-mono text-xs font-medium">{r.name}</div>
                <AsciiDiagram className="mb-2 text-[11px]">
                  {isProxied
                    ? "Browser --HTTPS--> Cloudflare Edge --> Origin\n(WAF, CDN, Bot Mgmt, DDoS all apply)"
                    : "Browser -----------------------------> Origin\n(direct connection, Cloudflare not involved)"}
                </AsciiDiagram>
                <p className="text-xs text-muted-foreground">
                  {isProxied
                    ? "DNS resolves to Cloudflare's anycast IPs. The origin IP is hidden from this answer, cache/WAF/Bot Management/DDoS mitigation all apply, and edge TLS termination is active."
                    : "DNS resolves directly to the origin's real IP. No Cloudflare product is in the request path — the origin handles TLS, security, and load entirely on its own."}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

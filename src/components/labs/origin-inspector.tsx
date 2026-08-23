"use client";

import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { buildForwardedHeaders, computeOriginLog } from "@/lib/origin-inspector";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";

const VISITOR_IP = "198.51.100.23";
const CF_EDGE_IP = "104.16.132.229";

export function OriginInspector() {
  const [trustsForwardedHeaders, setTrustsForwardedHeaders] = React.useState(true);
  const markLabComplete = useProgress((s) => s.markLabComplete);

  React.useEffect(() => {
    markLabComplete("origin-inspector");
  }, [markLabComplete]);

  const headers = buildForwardedHeaders(VISITOR_IP, "GB", "app.example.com", true);
  const log = computeOriginLog(VISITOR_IP, CF_EDGE_IP, trustsForwardedHeaders);

  return (
    <div className="flex flex-col gap-6">
      <AsciiDiagram>
        {`Client\n${VISITOR_IP}\n     ↓\nCloudflare (terminates client connection, opens a NEW connection to origin)\n     ↓\nOrigin (sees ${CF_EDGE_IP} as the TCP source — always, for proxied traffic)`}
      </AsciiDiagram>

      <div>
        <div className="mb-2 text-sm font-semibold">Headers the origin receives</div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">Header</th>
                <th className="px-3 py-2 font-medium">Value</th>
                <th className="px-3 py-2 font-medium">What it&apos;s for</th>
              </tr>
            </thead>
            <tbody>
              {headers.map((h) => (
                <tr key={h.name} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-mono text-xs font-medium">{h.name}</td>
                  <td className="px-3 py-2 font-mono text-xs text-status-cache">{h.value}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{h.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Origin trusts forwarded headers</div>
              <p className="text-xs text-muted-foreground">
                Is the origin&apos;s web server configured to read CF-Connecting-IP (e.g. via a real-IP module)
                instead of the raw TCP source?
              </p>
            </div>
            <Switch checked={trustsForwardedHeaders} onCheckedChange={setTrustsForwardedHeaders} />
          </div>

          <div
            className={cn(
              "rounded-md border p-3",
              log.isCorrect ? "border-status-allow/40 bg-status-allow/5" : "border-status-block/40 bg-status-block/5"
            )}
          >
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
              {log.isCorrect ? (
                <CheckCircle2 className="size-4 text-status-allow" />
              ) : (
                <XCircle className="size-4 text-status-block" />
              )}
              Origin access log records: <span className="font-mono">{log.sourceIp}</span>
            </div>
            <p className="text-xs text-muted-foreground">{log.explanation}</p>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-1 text-sm font-semibold">Why did this happen?</div>
        <p className="text-sm text-muted-foreground">
          A reverse proxy always terminates the client&apos;s connection and opens its own, separate
          connection to the origin. The origin&apos;s operating-system-level view of &quot;who connected&quot;
          is that second connection — from Cloudflare — full stop. There is no way for the origin to see the
          visitor&apos;s IP at the TCP layer; it can only recover it from an application-layer header
          Cloudflare adds (CF-Connecting-IP), and only if the origin&apos;s software is explicitly configured
          to read it.
        </p>
      </div>
    </div>
  );
}

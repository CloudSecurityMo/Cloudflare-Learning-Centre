"use client";

import * as React from "react";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";

type Action = "block" | "challenge" | "rateLimit" | "allow" | "monitor";

const ACTIONS: { id: Action; label: string; tone: string }[] = [
  { id: "block", label: "Block", tone: "border-status-block/50 bg-status-block/10 text-status-block" },
  { id: "challenge", label: "Managed Challenge", tone: "border-status-challenge/50 bg-status-challenge/10 text-status-challenge" },
  { id: "rateLimit", label: "Rate Limit", tone: "border-status-cache/50 bg-status-cache/10 text-status-cache" },
  { id: "allow", label: "Allow", tone: "border-status-allow/50 bg-status-allow/10 text-status-allow" },
  { id: "monitor", label: "Monitor only", tone: "border-status-log/50 bg-status-log/10 text-status-log" },
];

const CONSEQUENCES: Record<Action, string> = {
  block:
    "Stops the scraping immediately. Risk: if the bot score has any false-positive rate, some real users or a wanted integration (e.g. a price-comparison partner acting honestly) get blocked too. Best when you're highly confident the traffic is unwanted and low-value.",
  challenge:
    "Filters out simple/non-browser clients while adding minimal friction for real browsers (including humans on privacy-hardened setups). A more sophisticated scraper running a real headless browser may still pass. Good default for 'probably a bot, not fully certain.'",
  rateLimit:
    "Doesn't make an identity judgment at all — just caps how much damage any single client can do to the origin. Useful when you're unsure the score is right, or want a floor of protection regardless of bot classification.",
  allow:
    "Appropriate only if this turns out to be a bot you want (e.g. a verified search engine crawler, or a legitimate partner integration). Should be paired with an explicit allowlist (verified bot list or Custom Rule), not a default.",
  monitor:
    "Takes no enforcement action, just logs for visibility. Useful as a first step to confirm the pattern and volume before choosing a stronger response — avoids acting on incomplete evidence.",
};

export function BotLab() {
  const [action, setAction] = React.useState<Action | null>(null);
  const markLabComplete = useProgress((s) => s.markLabComplete);

  React.useEffect(() => {
    if (action) markLabComplete("bot-lab");
  }, [action, markLabComplete]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="text-sm font-semibold">Scenario</div>
          <p className="text-sm text-muted-foreground">
            An automated client is repeatedly accessing <code className="font-mono">/products/*</code> —
            sequential pagination, consistent low-second request intervals, no cookies retained between
            requests, and a TLS fingerprint that doesn&apos;t match a mainstream browser release.
          </p>
          <AsciiDiagram className="text-xs">
            {"GET /products/1   →  200\n" +
              "GET /products/2   →  200   (0.4s later)\n" +
              "GET /products/3   →  200   (0.4s later)\n" +
              "GET /products/4   →  200   (0.4s later)\n" +
              "...continues across the full catalog"}
          </AsciiDiagram>
          <div className="flex flex-wrap gap-3 text-sm">
            <Metric label="Bot score" value="4 / 99" tone="text-status-block" />
            <Metric label="Origin DB load" value="+340%" tone="text-status-block" />
            <Metric label="Verified bot match" value="No" tone="text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-2 text-sm font-semibold">Choose a response</div>
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAction(a.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                action === a.id ? a.tone : "border-border text-muted-foreground hover:bg-accent/40"
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {action && (
        <Card>
          <CardContent className="flex flex-col gap-2 pt-6">
            <Badge variant="outline" className="w-fit">{ACTIONS.find((a) => a.id === action)?.label}</Badge>
            <p className="text-sm text-muted-foreground">{CONSEQUENCES[action]}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-md border border-border px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={cn("font-mono text-sm font-semibold", tone)}>{value}</div>
    </div>
  );
}

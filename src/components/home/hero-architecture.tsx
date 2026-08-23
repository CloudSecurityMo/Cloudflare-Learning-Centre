"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowDown, Globe, Network, ShieldCheck, Server } from "lucide-react";
import { NodeDetailSheet } from "@/components/diagrams/node-detail-sheet";
import { cn } from "@/lib/utils";

const CF_CAPABILITIES = [
  { slug: "edge-tls", label: "TLS" },
  { slug: "rate-limiting", label: "Rate Limit" },
  { slug: "waf", label: "WAF" },
  { slug: "bot-management", label: "Bot Mgmt" },
  { slug: "cdn", label: "CDN" },
];

function NodeBox({
  icon,
  title,
  onClick,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium shadow-sm transition-colors hover:border-brand/50 hover:bg-accent/40",
        className
      )}
    >
      {icon}
      {title}
    </motion.button>
  );
}

export function HeroArchitecture() {
  const [active, setActive] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  function show(slug: string) {
    setActive(slug);
    setOpen(true);
  }

  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-grid bg-card/40 px-4 py-10">
      <NodeBox icon={<Globe className="size-4" />} title="Internet / Browser" onClick={() => show("internet")} />
      <ArrowDown className="size-4 text-muted-foreground" />
      <NodeBox icon={<Network className="size-4" />} title="DNS Resolution" onClick={() => show("dns")} />
      <ArrowDown className="size-4 text-muted-foreground" />

      <div className="w-full max-w-2xl rounded-xl border-2 border-brand/40 bg-brand/5 p-4">
        <div className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand">
          <ShieldCheck className="size-4" /> Cloudflare Edge
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {CF_CAPABILITIES.map((c) => (
            <NodeBox key={c.slug} title={c.label} onClick={() => show(c.slug)} className="bg-background" />
          ))}
        </div>
      </div>

      <ArrowDown className="size-4 text-muted-foreground" />
      <div className="flex flex-col items-center gap-1">
        <NodeBox icon={<Server className="size-4" />} title="Origin" onClick={() => show("origin")} />
        <div className="mt-1 flex flex-wrap justify-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="rounded border border-border px-1.5 py-0.5">AWS</span>
          <span className="rounded border border-border px-1.5 py-0.5">Azure</span>
          <span className="rounded border border-border px-1.5 py-0.5">Kubernetes</span>
          <span className="rounded border border-border px-1.5 py-0.5">On-Prem</span>
        </div>
      </div>

      <NodeDetailSheet slug={active} open={open} onOpenChange={setOpen} />
    </div>
  );
}

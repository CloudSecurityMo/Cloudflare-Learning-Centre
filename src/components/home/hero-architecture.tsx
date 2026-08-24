"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Globe, Network, ShieldCheck, Server } from "lucide-react";
import { NodeDetailSheet } from "@/components/diagrams/node-detail-sheet";
import { cn } from "@/lib/utils";

/** A small dot that travels the connector on a loop, evoking a request flowing down the chain. */
function FlowConnector({ delay = 0 }: { delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative flex h-8 w-4 items-center justify-center">
      <div className="h-full w-px bg-border" />
      <ArrowDown className="absolute -bottom-0.5 size-4 text-muted-foreground" />
      {!reduceMotion && (
        <motion.span
          aria-hidden
          className="absolute left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-brand"
          style={{ boxShadow: "0 0 6px 1px var(--brand)" }}
          initial={{ top: "0%", opacity: 0 }}
          animate={{ top: ["0%", "75%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.3, repeat: Infinity, repeatDelay: 2.3, delay, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

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
      <FlowConnector delay={0} />
      <NodeBox icon={<Network className="size-4" />} title="DNS Resolution" onClick={() => show("dns")} />
      <FlowConnector delay={0.4} />

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

      <FlowConnector delay={0.8} />
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

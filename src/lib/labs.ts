// Canonical registry of interactive labs that actually track completion via
// useProgress().markLabComplete(slug). Keep this in sync with the slug each
// lab component passes to markLabComplete — it's the single source of truth
// for both the dashboard stats and the progress tracker page.

export interface LabRef {
  slug: string;
  label: string;
  href: string;
}

export const LABS: LabRef[] = [
  { slug: "dns-lab", label: "DNS Lab", href: "/labs/dns-lab" },
  { slug: "waf-lab", label: "WAF Rule Builder", href: "/labs/waf-lab" },
  { slug: "tls-lab", label: "TLS Lab", href: "/labs/tls-lab" },
  { slug: "bot-lab", label: "Bot Detection Lab", href: "/labs/bot-lab" },
  { slug: "request-flow-simulator", label: "Request Flow Simulator", href: "/labs/request-flow-simulator" },
  { slug: "troubleshooting", label: "Troubleshooting Academy", href: "/labs/troubleshooting" },
  { slug: "architecture-designer", label: "Architecture Designer", href: "/labs/architecture-designer" },
];

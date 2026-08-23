export interface NavItem {
  label: string;
  href: string;
  status?: "ready" | "soon";
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: "Learn",
    items: [
      { label: "Cloudflare Fundamentals", href: "/learn/fundamentals", status: "ready" },
      { label: "DNS", href: "/learn/dns", status: "ready" },
      { label: "Proxying", href: "/learn/proxying", status: "ready" },
      { label: "CDN & Caching", href: "/learn/cdn", status: "ready" },
      { label: "SSL/TLS", href: "/learn/ssl-tls", status: "ready" },
      { label: "WAF", href: "/learn/waf", status: "ready" },
      { label: "DDoS Protection", href: "/learn/ddos", status: "ready" },
      { label: "Bot Management", href: "/learn/bot-management", status: "ready" },
      { label: "Rate Limiting", href: "/learn/rate-limiting", status: "ready" },
      { label: "API Security", href: "/learn/api-security", status: "ready" },
      { label: "Workers", href: "/learn/workers", status: "ready" },
      { label: "Zero Trust", href: "/learn/zero-trust", status: "ready" },
      { label: "Load Balancing", href: "/learn/load-balancing", status: "ready" },
      { label: "Observability", href: "/learn/observability", status: "ready" },
      { label: "Logging", href: "/learn/logging", status: "ready" },
    ],
  },
  {
    label: "Architecture",
    items: [
      { label: "Deployment Models", href: "/architecture/deployment-models", status: "ready" },
      { label: "Request Decision Engine", href: "/labs/request-flow-simulator", status: "ready" },
      { label: "Reference Architectures", href: "/architecture/reference-architectures", status: "ready" },
      { label: "Network Flows", href: "/architecture/network-flows", status: "soon" },
      { label: "Security Layers", href: "/architecture/security-layers", status: "ready" },
      { label: "Hybrid Cloud", href: "/architecture/hybrid-cloud", status: "soon" },
      { label: "AWS + Cloudflare", href: "/architecture/aws", status: "ready" },
      { label: "Azure + Cloudflare", href: "/architecture/azure", status: "ready" },
      { label: "Kubernetes + Cloudflare", href: "/architecture/kubernetes", status: "ready" },
      { label: "On-Prem + Cloudflare", href: "/architecture/on-prem", status: "soon" },
    ],
  },
  {
    label: "Labs",
    items: [
      { label: "DNS Lab", href: "/labs/dns-lab", status: "ready" },
      { label: "WAF Rule Builder", href: "/labs/waf-lab", status: "ready" },
      { label: "TLS Lab", href: "/labs/tls-lab", status: "ready" },
      { label: "Origin Inspector", href: "/labs/origin-inspector", status: "ready" },
      { label: "Origin Protection Lab", href: "/labs/origin-protection", status: "ready" },
      { label: "Bot Detection Lab", href: "/labs/bot-lab", status: "ready" },
      { label: "Rate Limiting Lab", href: "/labs/rate-limit-lab", status: "soon" },
      { label: "Cloudflare Tunnel Lab", href: "/learn/tunnel", status: "ready" },
      { label: "Troubleshooting Lab", href: "/labs/troubleshooting", status: "ready" },
      { label: "Request Decision Engine", href: "/labs/request-flow-simulator", status: "ready" },
      { label: "Product Decision Engine", href: "/labs/product-decision-engine", status: "ready" },
      { label: "Architecture Designer", href: "/labs/architecture-designer", status: "ready" },
    ],
  },
  {
    label: "Reference",
    items: [
      { label: "Glossary", href: "/reference/glossary", status: "ready" },
      { label: "Knowledge Cards", href: "/reference/cards", status: "ready" },
      { label: "HTTP Status Codes", href: "/reference/http-status-codes", status: "ready" },
      { label: "Cloudflare Error Codes", href: "/reference/error-codes", status: "ready" },
      { label: "DNS Records", href: "/reference/dns-records", status: "ready" },
    ],
  },
  {
    label: "Scenarios",
    items: [
      { label: "Scenario Library", href: "/scenarios", status: "ready" },
    ],
  },
];

export const FLAT_NAV: NavItem[] = NAV.flatMap((g) => g.items);

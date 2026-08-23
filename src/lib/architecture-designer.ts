export type CategoryKey = "dns" | "tls" | "waf" | "origin" | "cache" | "rateLimit" | "bot";

export interface DesignOption {
  id: string;
  label: string;
  tags: string[];
}

export interface DesignCategory {
  key: CategoryKey;
  label: string;
  options: DesignOption[];
}

export const CATEGORIES: DesignCategory[] = [
  {
    key: "dns",
    label: "DNS configuration",
    options: [
      { id: "dns-only", label: "DNS only (grey cloud)", tags: [] },
      { id: "proxied", label: "Proxied (orange cloud)", tags: ["edge-visibility", "cache-eligible", "ddos-l7-eligible"] },
    ],
  },
  {
    key: "tls",
    label: "SSL/TLS mode",
    options: [
      { id: "off", label: "Off", tags: [] },
      { id: "flexible", label: "Flexible", tags: ["tls-edge"] },
      { id: "full", label: "Full", tags: ["tls-edge", "tls-origin-encrypted"] },
      { id: "full-strict", label: "Full (Strict)", tags: ["tls-edge", "tls-origin-encrypted", "tls-origin-validated"] },
    ],
  },
  {
    key: "waf",
    label: "WAF",
    options: [
      { id: "disabled", label: "Disabled", tags: [] },
      { id: "managed", label: "Managed Rules only", tags: ["waf-signatures"] },
      { id: "managed-custom", label: "Managed + Custom Rules", tags: ["waf-signatures", "waf-policy"] },
    ],
  },
  {
    key: "origin",
    label: "Origin architecture",
    options: [
      { id: "open", label: "Public IP, open firewall", tags: [] },
      { id: "firewalled", label: "Public IP, firewalled to Cloudflare ranges", tags: ["origin-ip-hardened"] },
      { id: "tunnel", label: "Cloudflare Tunnel (no inbound port)", tags: ["origin-ip-hardened", "no-inbound-exposure"] },
    ],
  },
  {
    key: "cache",
    label: "Caching",
    options: [
      { id: "disabled", label: "Disabled", tags: [] },
      { id: "static", label: "Static assets only (default)", tags: ["caching-static"] },
      { id: "full", label: "Static + Cache Rules for dynamic content", tags: ["caching-static", "caching-dynamic"] },
    ],
  },
  {
    key: "rateLimit",
    label: "Rate limiting",
    options: [
      { id: "disabled", label: "Disabled", tags: [] },
      { id: "key-endpoints", label: "Enabled on key endpoints (login, checkout, API)", tags: ["rate-limiting"] },
    ],
  },
  {
    key: "bot",
    label: "Bot protection",
    options: [
      { id: "disabled", label: "Disabled", tags: [] },
      { id: "fight-mode", label: "Bot Fight Mode", tags: ["bot-basic"] },
      { id: "bot-management", label: "Bot Management", tags: ["bot-basic", "bot-advanced"] },
    ],
  },
];

export type Selections = Record<CategoryKey, string>;

export const DEFAULT_SELECTIONS: Selections = {
  dns: "dns-only",
  tls: "off",
  waf: "disabled",
  origin: "open",
  cache: "disabled",
  rateLimit: "disabled",
  bot: "disabled",
};

export interface Requirement {
  id: string;
  title: string;
  prompt: string;
  requiredTags: string[];
  idealSelections: Selections;
}

export const REQUIREMENTS: Requirement[] = [
  {
    id: "azure-public",
    title: "Public-facing Azure application",
    prompt:
      "A company has a public-facing Azure application. It wants DDoS protection, WAF, bot mitigation, TLS termination, and protection of the origin IP.",
    requiredTags: [
      "edge-visibility",
      "ddos-l7-eligible",
      "waf-signatures",
      "bot-basic",
      "tls-edge",
      "tls-origin-validated",
      "origin-ip-hardened",
    ],
    idealSelections: {
      dns: "proxied",
      tls: "full-strict",
      waf: "managed-custom",
      origin: "firewalled",
      cache: "static",
      rateLimit: "key-endpoints",
      bot: "bot-management",
    },
  },
  {
    id: "internal-tool",
    title: "Internal employee tool, zero public exposure",
    prompt:
      "An internal admin dashboard must be reachable by employees from anywhere, with zero public inbound exposure and no VPN client.",
    requiredTags: ["edge-visibility", "no-inbound-exposure", "tls-origin-validated"],
    idealSelections: {
      dns: "proxied",
      tls: "full-strict",
      waf: "managed",
      origin: "tunnel",
      cache: "disabled",
      rateLimit: "disabled",
      bot: "disabled",
    },
  },
  {
    id: "api-partner",
    title: "Public API consumed by partners",
    prompt:
      "A public REST API needs abuse protection on high-value endpoints, strong origin protection, and encrypted, validated transport end-to-end, without over-caching dynamic responses.",
    requiredTags: ["edge-visibility", "waf-signatures", "rate-limiting", "tls-origin-validated", "origin-ip-hardened"],
    idealSelections: {
      dns: "proxied",
      tls: "full-strict",
      waf: "managed-custom",
      origin: "firewalled",
      cache: "disabled",
      rateLimit: "key-endpoints",
      bot: "bot-management",
    },
  },
];

export function grantedTags(selections: Selections): Set<string> {
  if (selections.dns === "dns-only") {
    // Nothing downstream applies — traffic bypasses Cloudflare entirely.
    return new Set();
  }
  const tags = new Set<string>();
  for (const cat of CATEGORIES) {
    const opt = cat.options.find((o) => o.id === selections[cat.key]);
    opt?.tags.forEach((t) => tags.add(t));
  }
  return tags;
}

export function scoreRequirement(requirement: Requirement, selections: Selections) {
  const granted = grantedTags(selections);
  const met = requirement.requiredTags.filter((t) => granted.has(t));
  const missing = requirement.requiredTags.filter((t) => !granted.has(t));
  const percent = Math.round((met.length / requirement.requiredTags.length) * 100);
  return { met, missing, percent, bypassedEdge: selections.dns === "dns-only" };
}

export const TAG_LABELS: Record<string, string> = {
  "edge-visibility": "Traffic reaches Cloudflare's edge at all",
  "cache-eligible": "Eligible for edge caching",
  "ddos-l7-eligible": "L7 DDoS mitigation surface (rate limiting/bot mgmt can apply)",
  "tls-edge": "Browser-to-edge TLS",
  "tls-origin-encrypted": "Edge-to-origin traffic encrypted",
  "tls-origin-validated": "Edge-to-origin certificate validated (Full Strict)",
  "waf-signatures": "Known attack signature detection",
  "waf-policy": "Organization-specific policy enforcement",
  "origin-ip-hardened": "Origin firewalled against direct access",
  "no-inbound-exposure": "No inbound port open on origin network at all",
  "caching-static": "Static asset caching",
  "caching-dynamic": "Dynamic content caching via Cache Rules",
  "rate-limiting": "Volume-based abuse protection",
  "bot-basic": "Basic automated-traffic filtering",
  "bot-advanced": "Advanced fingerprinting/behavioral bot detection",
};

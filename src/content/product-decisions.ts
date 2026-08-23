import type { LearningSource } from "./types";

export type Capability =
  | "WAF"
  | "Rate Limiting"
  | "Bot Management"
  | "DDoS Protection"
  | "Cloudflare Tunnel"
  | "Access"
  | "Gateway"
  | "Load Balancing"
  | "CDN / Caching"
  | "API Shield"
  | "Logpush"
  | "Full (Strict) SSL/TLS + Authenticated Origin Pulls";

export const ALL_CAPABILITIES: Capability[] = [
  "WAF",
  "Rate Limiting",
  "Bot Management",
  "DDoS Protection",
  "Cloudflare Tunnel",
  "Access",
  "Gateway",
  "Load Balancing",
  "CDN / Caching",
  "API Shield",
  "Logpush",
  "Full (Strict) SSL/TLS + Authenticated Origin Pulls",
];

export interface ProductDecisionScenario {
  id: string;
  requirement: string;
  correct: Capability[];
  explanation: string;
  officialSources: LearningSource[];
}

export const PRODUCT_DECISIONS: ProductDecisionScenario[] = [
  {
    id: "pd-1",
    requirement: "Protect a public web application from SQL injection and cross-site scripting.",
    correct: ["WAF"],
    explanation:
      "This is exactly what WAF Managed Rules exist for — signature-based detection of known attack patterns like SQLi and XSS, applied to every proxied request.",
    officialSources: [{ title: "WAF overview", url: "https://developers.cloudflare.com/waf/", sourceType: "cloudflare-documentation" }],
  },
  {
    id: "pd-2",
    requirement: "Limit excessive login attempts against /login without blocking normal traffic elsewhere.",
    correct: ["Rate Limiting"],
    explanation:
      "This is a pure volume problem scoped to one endpoint — Rate Limiting Rules count requests per key over a period and act once a threshold is crossed, without needing to inspect content or assess identity.",
    officialSources: [{ title: "Rate limiting rules", url: "https://developers.cloudflare.com/waf/rate-limiting-rules/", sourceType: "cloudflare-documentation" }],
  },
  {
    id: "pd-3",
    requirement: "Identify whether traffic hitting the product catalog is automated, and distinguish good bots from bad ones.",
    correct: ["Bot Management"],
    explanation:
      "Bot Management's fingerprinting, behavioral analysis, and verified-bot allowlist directly answer 'is this a human, a wanted bot, or an unwanted bot?' — something WAF and Rate Limiting can't determine.",
    officialSources: [{ title: "Bot Management overview", url: "https://developers.cloudflare.com/bots/", sourceType: "cloudflare-documentation" }],
  },
  {
    id: "pd-4",
    requirement: "Give remote employees access to an internal admin tool without exposing it publicly or requiring a traditional VPN.",
    correct: ["Cloudflare Tunnel", "Access"],
    explanation:
      "This needs both halves: Cloudflare Tunnel removes the need for any public inbound port on the app's network, and Access adds the identity-based policy layer (who's allowed in) in front of the Tunnel hostname. Neither alone fully satisfies the requirement.",
    officialSources: [
      { title: "Cloudflare Tunnel", url: "https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/", sourceType: "cloudflare-documentation" },
      { title: "Cloudflare Zero Trust (Cloudflare One)", url: "https://developers.cloudflare.com/cloudflare-one/", sourceType: "cloudflare-documentation" },
    ],
  },
  {
    id: "pd-5",
    requirement: "Distribute traffic across origins in two AWS regions and fail over automatically if one becomes unhealthy.",
    correct: ["Load Balancing"],
    explanation:
      "Load Balancing's pools and active health checks are purpose-built for exactly this — steering traffic at the edge, before it ever reaches a region, based on real-time health.",
    officialSources: [{ title: "Load Balancing overview", url: "https://developers.cloudflare.com/load-balancing/", sourceType: "cloudflare-documentation" }],
  },
  {
    id: "pd-6",
    requirement: "Reduce origin load for a marketing site's images, CSS, and JS without touching dynamic pages.",
    correct: ["CDN / Caching"],
    explanation:
      "Static assets are cacheable by file extension by default. This is a caching problem, not a security problem — WAF and Bot Management don't reduce origin load; the CDN cache does.",
    officialSources: [{ title: "Caching overview", url: "https://developers.cloudflare.com/cache/", sourceType: "cloudflare-documentation" }],
  },
  {
    id: "pd-7",
    requirement: "Enforce that every request to a documented REST API matches its OpenAPI schema, rejecting malformed requests regardless of whether they match a known attack signature.",
    correct: ["API Shield"],
    explanation:
      "This is a positive-security-model requirement (define what's valid, reject everything else) — exactly what API Shield's schema validation provides, distinct from the WAF's negative/signature-based model.",
    officialSources: [{ title: "API Shield overview", url: "https://developers.cloudflare.com/api-shield/", sourceType: "cloudflare-documentation" }],
  },
  {
    id: "pd-8",
    requirement: "Guarantee the Cloudflare-to-origin connection is always encrypted, with a validated certificate, and that the origin only accepts connections that actually came from Cloudflare.",
    correct: ["Full (Strict) SSL/TLS + Authenticated Origin Pulls"],
    explanation:
      "Full (Strict) covers encryption + certificate validation for the edge-to-origin leg. Authenticated Origin Pulls adds the complementary guarantee that the origin only accepts connections presenting a valid Cloudflare client certificate — closing the gap that IP allowlisting alone leaves open.",
    officialSources: [
      { title: "SSL/TLS encryption modes", url: "https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/", sourceType: "cloudflare-documentation" },
      { title: "Authenticated Origin Pulls (mTLS)", url: "https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/", sourceType: "cloudflare-documentation" },
    ],
  },
  {
    id: "pd-9",
    requirement: "Control which websites and categories of destinations managed corporate devices are allowed to reach on the internet.",
    correct: ["Gateway"],
    explanation:
      "This is outbound traffic filtering from a device/network's perspective — exactly Gateway's job, distinct from Access (which controls inbound access to a specific application).",
    officialSources: [{ title: "Cloudflare Zero Trust (Cloudflare One)", url: "https://developers.cloudflare.com/cloudflare-one/", sourceType: "cloudflare-documentation" }],
  },
  {
    id: "pd-10",
    requirement: "Export detailed security event and HTTP request logs to a SIEM for a full year of retention and cross-system correlation.",
    correct: ["Logpush"],
    explanation:
      "Dashboard analytics aren't built for long-term retention or export. Logpush continuously exports raw log datasets to storage/SIEM destinations you control.",
    officialSources: [{ title: "Logpush", url: "https://developers.cloudflare.com/logs/logpush/", sourceType: "cloudflare-documentation" }],
  },
  {
    id: "pd-11",
    requirement: "Withstand a large-scale volumetric flood aimed at exhausting the origin's network capacity.",
    correct: ["DDoS Protection"],
    explanation:
      "Volumetric floods are a network-layer capacity problem, mitigated by Cloudflare's always-on, anycast-distributed DDoS protection — not something WAF or Rate Limiting (which operate per-request/per-key at L7) are designed to absorb at that scale.",
    officialSources: [{ title: "DDoS Protection overview", url: "https://developers.cloudflare.com/ddos-protection/", sourceType: "cloudflare-documentation" }],
  },
  {
    id: "pd-12",
    requirement: "Remove the origin's public IP exposure entirely — no inbound port should exist on the origin's network.",
    correct: ["Cloudflare Tunnel"],
    explanation:
      "IP allowlisting still leaves an inbound-listening port that depends on firewall rules staying correct. Only Cloudflare Tunnel's outbound-only connection model removes the inbound port altogether.",
    officialSources: [{ title: "Cloudflare Tunnel", url: "https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/", sourceType: "cloudflare-documentation" }],
  },
];

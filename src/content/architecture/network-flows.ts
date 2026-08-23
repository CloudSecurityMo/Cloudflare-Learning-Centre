import type { LearningSource } from "@/content/types";

export interface NetworkFlow {
  id: string;
  title: string;
  layer: string;
  diagram: string;
  summary: string;
  scope: string;
  protects: string;
  limitations: string;
}

export const NETWORK_FLOWS: NetworkFlow[] = [
  {
    id: "standard-proxy",
    title: "Standard reverse proxy (HTTP/HTTPS)",
    layer: "L7 — Application",
    diagram: "Browser --HTTPS--> Cloudflare Edge (per-hostname) --HTTP(S)--> Origin",
    summary:
      "The default orange-cloud path everything else in this lab assumes: Cloudflare terminates the client's TLS connection, inspects the HTTP request, and opens its own connection to the origin. Scoped per hostname/DNS record.",
    scope: "One proxied DNS record at a time.",
    protects: "WAF, Bot Management, Rate Limiting, caching, and L7 DDoS mitigation all apply here.",
    limitations: "Only handles HTTP(S). Anything else — a game server, a database port, raw TCP — needs a different product.",
  },
  {
    id: "spectrum",
    title: "Spectrum (TCP/UDP applications)",
    layer: "L4 — Transport",
    diagram: "Client --TCP/UDP--> Cloudflare Edge (per-application) --TCP/UDP--> Origin",
    summary:
      "Extends the same proxy-and-protect model to non-HTTP TCP/UDP traffic — Cloudflare's docs give examples like MQTT, email, file transfer, version control, and game servers. Still a per-application proxy: you configure Spectrum for one port/protocol at a time, and it still masks the origin IP the same way the standard proxy does.",
    scope: "One configured TCP/UDP application at a time.",
    protects: "L3/L4 DDoS protection and origin IP masking for protocols the standard HTTP proxy can't handle. Proxy Protocol support lets the origin recover the real client IP (the TCP/UDP equivalent of CF-Connecting-IP).",
    limitations: "No WAF/Bot Management-style L7 content inspection — Spectrum operates below the application layer, so it can't parse protocol-specific content the way the HTTP proxy parses HTTP. Available on paid plans; custom (non-templated) TCP/UDP apps require Enterprise.",
  },
  {
    id: "magic-transit",
    title: "Magic Transit (whole-network DDoS protection)",
    layer: "L3 — Network",
    diagram: "Internet --IP traffic for your whole prefix--> Cloudflare (via BGP announcement) --GRE/IPsec--> Your network",
    summary:
      "A fundamentally different scope from the other two: instead of proxying one hostname or one application, Cloudflare announces your own IP prefix via BGP on your behalf, so ALL traffic to your entire network range routes through Cloudflare's edge for inspection before reaching you over a GRE or IPsec tunnel back to your infrastructure.",
    scope: "An entire customer-owned IP prefix (traditionally /24 or larger).",
    protects: "Volumetric and protocol-level DDoS mitigation for everything in that IP range — not just one service.",
    limitations: "Enterprise-only, and a fundamentally bigger architectural commitment (BGP peering, network re-routing) than proxying a hostname or configuring Spectrum. Not a substitute for L7 controls — traffic that reaches an actual web service still needs WAF/Bot Management separately.",
  },
];

export const NETWORK_FLOWS_SOURCES: LearningSource[] = [
  { title: "Spectrum overview", url: "https://developers.cloudflare.com/spectrum/", sourceType: "cloudflare-documentation" },
  { title: "Magic Transit overview", url: "https://developers.cloudflare.com/magic-transit/", sourceType: "cloudflare-documentation" },
  { title: "Network layers reference", url: "https://developers.cloudflare.com/fundamentals/reference/network-layers/", sourceType: "cloudflare-documentation" },
];

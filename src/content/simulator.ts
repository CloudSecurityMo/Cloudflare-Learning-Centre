import type { StageId } from "@/lib/simulate-request";

export const STAGE_META: Record<StageId, { label: string; blurb: string }> = {
  browser: { label: "Browser", blurb: "The request is constructed on the client." },
  dns: { label: "DNS Resolution", blurb: "The hostname resolves to an IP — Cloudflare's edge or the origin, depending on proxy status." },
  edge: { label: "Cloudflare Edge", blurb: "Anycast routes the connection to the nearest Cloudflare data center." },
  tls: { label: "TLS", blurb: "The browser-to-edge TLS handshake is terminated." },
  waf: { label: "WAF", blurb: "Managed and Custom Rules inspect the full request content." },
  bot: { label: "Bot Management", blurb: "Fingerprinting and behavioral signals assess client authenticity." },
  rateLimit: { label: "Rate Limiting", blurb: "Request volume for this key is checked against configured thresholds." },
  cache: { label: "Cache", blurb: "Cloudflare checks whether a valid cached response already exists." },
  origin: { label: "Origin", blurb: "If not served from cache, the request reaches your application." },
  response: { label: "Response", blurb: "The final response returns to the browser." },
};

export const STAGE_ORDER: StageId[] = ["browser", "dns", "edge", "tls", "waf", "bot", "rateLimit", "cache", "origin", "response"];

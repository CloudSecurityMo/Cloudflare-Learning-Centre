import type { LearningSource } from "./types";

export interface MentalModelSide {
  label: string;
  diagram: string;
  points: string[];
}

export interface MentalModel {
  slug: string;
  title: string;
  prompt: string;
  sideA: MentalModelSide;
  sideB: MentalModelSide;
  explanation: string;
  officialSources: LearningSource[];
}

export const MENTAL_MODELS: MentalModel[] = [
  {
    slug: "dns-vs-proxy",
    title: "DNS Only vs Proxied",
    prompt: "The single toggle that decides whether Cloudflare is in the request path at all.",
    sideA: {
      label: "DNS Only",
      diagram: "User\n ↓\nDNS (Cloudflare)\n ↓\nOrigin",
      points: [
        "Cloudflare answers with the origin's real IP",
        "Browser connects directly to the origin",
        "No WAF, CDN, Bot Management, or DDoS mitigation applies",
        "Origin IP is exposed in the DNS answer itself",
      ],
    },
    sideB: {
      label: "Proxied",
      diagram: "User\n ↓\nDNS (Cloudflare)\n ↓\nCloudflare Edge\n ↓\nOrigin",
      points: [
        "Cloudflare answers with its own anycast IP",
        "Browser connects to Cloudflare; Cloudflare connects to the origin separately",
        "WAF, CDN, Bot Management, and DDoS mitigation all apply",
        "Origin IP is hidden from this DNS answer (but must still be firewalled — see Origin Protection)",
      ],
    },
    explanation:
      "This is the most consequential setting in the entire platform: every other product in this section — WAF, CDN, Bot Management, Rate Limiting — only ever sees traffic for proxied hostnames. A DNS-only record is, from Cloudflare's security products' point of view, invisible.",
    officialSources: [
      { title: "How Cloudflare works", url: "https://developers.cloudflare.com/fundamentals/concepts/how-cloudflare-works/", sourceType: "cloudflare-documentation" },
      { title: "Proxied DNS records", url: "https://developers.cloudflare.com/dns/manage-dns-records/reference/proxied-dns-records/", sourceType: "cloudflare-documentation" },
    ],
  },
  {
    slug: "cdn-vs-waf",
    title: "CDN vs WAF",
    prompt: "Both sit at Cloudflare's edge on every proxied request — but they answer completely different questions.",
    sideA: {
      label: "CDN (Cache)",
      diagram: "Request → cache key lookup → HIT (return cached copy)\n                        → MISS (forward to origin, store response)",
      points: [
        "Question it answers: \"do I already have a copy of this response?\"",
        "Operates on cacheable content — mostly static assets by default",
        "Goal: reduce latency and origin load",
        "Has no concept of 'malicious' — it doesn't inspect for attacks",
      ],
    },
    sideB: {
      label: "WAF",
      diagram: "Request → Custom Rules → Rate Limiting → Managed Rules → allow/block/challenge",
      points: [
        "Question it answers: \"does this request's content match a known attack pattern or violate policy?\"",
        "Inspects every proxied request's method, path, headers, cookies, body",
        "Goal: block malicious requests before they're served or forwarded",
        "Has no concept of 'reduce origin load' — that's not its job",
      ],
    },
    explanation:
      "In the actual request path, WAF evaluation happens before the cache lookup — a blocked request never reaches the cache/origin stage at all. The two are complementary, not competing: CDN makes legitimate traffic cheap and fast; WAF stops illegitimate traffic from being served or forwarded in the first place.",
    officialSources: [
      { title: "Caching overview", url: "https://developers.cloudflare.com/cache/", sourceType: "cloudflare-documentation" },
      { title: "WAF overview", url: "https://developers.cloudflare.com/waf/", sourceType: "cloudflare-documentation" },
      { title: "Security feature execution order", url: "https://developers.cloudflare.com/waf/feature-interoperability/", sourceType: "cloudflare-documentation" },
    ],
  },
  {
    slug: "waf-vs-ddos",
    title: "WAF vs DDoS Protection",
    prompt: "Complementary, not overlapping — they're built to catch structurally different kinds of attack.",
    sideA: {
      label: "WAF",
      diagram: "One request → content inspected → attack signature matched → block",
      points: [
        "Cares about the content of an individual request",
        "Operates at L7 (HTTP)",
        "Effective against SQL injection, XSS, RCE, path traversal — attacks that live in a request's structure",
        "Doesn't help if the 'attack' is simply overwhelming volume of otherwise well-formed requests",
      ],
    },
    sideB: {
      label: "DDoS Protection",
      diagram: "Many requests/packets → traffic pattern/volume analyzed → mitigated at scale",
      points: [
        "Cares about the volume and pattern of traffic in aggregate",
        "Spans L3 (network), L4 (transport), and L7 (application)",
        "Effective against volumetric floods, SYN floods, and HTTP floods",
        "Doesn't inspect individual request content for attack signatures — that's the WAF's job",
      ],
    },
    explanation:
      "A layered defense needs both: WAF stops a single malicious, well-crafted request; DDoS protection stops an army of simple, individually harmless-looking requests from overwhelming you by sheer volume. L7 DDoS mitigation and WAF/Rate Limiting overlap operationally (both evaluate HTTP traffic), but they're triggered by different signals — content vs. volume/pattern.",
    officialSources: [
      { title: "WAF overview", url: "https://developers.cloudflare.com/waf/", sourceType: "cloudflare-documentation" },
      { title: "DDoS Protection overview", url: "https://developers.cloudflare.com/ddos-protection/", sourceType: "cloudflare-documentation" },
      { title: "Network layers reference", url: "https://developers.cloudflare.com/fundamentals/reference/network-layers/", sourceType: "cloudflare-documentation" },
    ],
  },
  {
    slug: "bot-vs-rate-limit",
    title: "Bot Management vs Rate Limiting",
    prompt: "One asks \"who is this?\" — the other asks \"how much are they doing?\"",
    sideA: {
      label: "Bot Management",
      diagram: "Request → fingerprint + behavior + reputation → bot score (1-99) → allow/challenge/block",
      points: [
        "Question: is this client automated, and is it a good or bad bot?",
        "Signal: TLS/HTTP fingerprinting, behavioral analysis, IP reputation, ML models",
        "Works on a single request in isolation — no volume threshold needed",
        "Per-request score (cf.bot_management.score) requires the Enterprise Bot Management add-on",
      ],
    },
    sideB: {
      label: "Rate Limiting",
      diagram: "Requests from key X → count over period → threshold exceeded? → block/challenge",
      points: [
        "Question: has this key sent too many requests in this window?",
        "Signal: pure request volume, counted by IP/session/header/custom key",
        "Requires accumulating multiple requests — meaningless for a single request",
        "Available on every plan (Free/Pro get IP-only counting; custom keys need Business+)",
      ],
    },
    explanation:
      "A single, low-and-slow bot can stay under any rate limit threshold indefinitely — volume alone won't catch it, which is exactly what Bot Management is for. Conversely, a burst of traffic from a real, high-value integration (not a bot at all) can trip a rate limit that Bot Management would never have flagged. They catch different failure modes and are commonly used together.",
    officialSources: [
      { title: "Bot Management overview", url: "https://developers.cloudflare.com/bots/", sourceType: "cloudflare-documentation" },
      { title: "Rate limiting rules", url: "https://developers.cloudflare.com/waf/rate-limiting-rules/", sourceType: "cloudflare-documentation" },
      { title: "cf.bot_management.score field reference", url: "https://developers.cloudflare.com/ruleset-engine/rules-language/fields/reference/cf.bot_management.score", sourceType: "cloudflare-documentation" },
    ],
  },
  {
    slug: "tunnel-vs-vpn",
    title: "Cloudflare Tunnel vs a Traditional VPN",
    prompt: "Both let remote users/services reach private resources — the connection direction and trust model differ fundamentally.",
    sideA: {
      label: "Traditional VPN",
      diagram: "Client --[VPN tunnel]--> Network edge (inbound listener) --> Internal network (broad access)",
      points: [
        "Requires an inbound-listening VPN endpoint on the network",
        "Once connected, a user is typically placed 'inside' the network with broad reachability",
        "Access control is often coarse — network-level, not per-application",
        "The VPN endpoint itself is a discoverable, attackable inbound target",
      ],
    },
    sideB: {
      label: "Cloudflare Tunnel",
      diagram: "cloudflared --[outbound-only]--> Cloudflare edge <-- Client (via Access policy)",
      points: [
        "cloudflared initiates an outbound-only connection — no inbound listener on the origin network at all",
        "Traffic then flows both directions over that already-established connection",
        "Typically paired with Access for per-application, identity-based policy rather than broad network access",
        "Multiple cloudflared replicas can run for redundancy",
      ],
    },
    explanation:
      "The core architectural difference is who initiates the connection. A VPN needs something listening for inbound connections; Cloudflare Tunnel's cloudflared always dials out, so there's no inbound port to scan, misconfigure, or leave open. Paired with Access, it also naturally supports per-application policy instead of the 'you're on the VPN, you're inside the network' model.",
    officialSources: [
      { title: "Cloudflare Tunnel", url: "https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/", sourceType: "cloudflare-documentation" },
    ],
  },
  {
    slug: "access-vs-gateway",
    title: "Cloudflare Access vs Cloudflare Gateway",
    prompt: "Same platform (Cloudflare One), opposite traffic direction.",
    sideA: {
      label: "Access",
      diagram: "User -> Identity + device posture check -> Access policy -> Application",
      points: [
        "Direction: inbound — controls who can reach a specific application",
        "Question: is this identity, on this device, allowed into this app?",
        "Scope: one application (or a defined set) at a time",
        "Analogous to replacing a VPN's 'you're in' decision with per-app identity checks",
      ],
    },
    sideB: {
      label: "Gateway",
      diagram: "User's device/network -> Gateway (DNS/HTTP/network filtering) -> Internet",
      points: [
        "Direction: outbound — controls what a user/device can reach on the internet",
        "Question: should this device be allowed to resolve/reach this destination?",
        "Scope: all outbound traffic from a protected device or network",
        "Functions like a cloud-delivered secure web gateway / DNS filter",
      ],
    },
    explanation:
      "Access answers 'who can get IN to this app' — Gateway answers 'what can this device reach OUT on the internet.' A single organization commonly runs both: Access in front of internal apps, Gateway filtering what managed devices can browse to, with WARP as the client that makes Gateway policy enforcement possible.",
    officialSources: [
      { title: "Cloudflare Zero Trust (Cloudflare One)", url: "https://developers.cloudflare.com/cloudflare-one/", sourceType: "cloudflare-documentation" },
    ],
  },
  {
    slug: "origin-cert-vs-public-ca",
    title: "Origin Certificate vs Public CA Certificate",
    prompt: "Both are TLS certificates — they secure different legs of the connection and are trusted by different parties.",
    sideA: {
      label: "Origin Certificate (Cloudflare Origin CA)",
      diagram: "Cloudflare Edge --[validates]--> Origin Certificate --[installed on]--> Origin server",
      points: [
        "Secures the Cloudflare-to-origin leg specifically",
        "Trusted by Cloudflare (enables Full Strict validation) — NOT trusted by public browsers",
        "Free, issued by Cloudflare's own Origin CA",
        "Only makes sense on an origin that's exclusively reached through Cloudflare's proxy",
      ],
    },
    sideB: {
      label: "Public CA Certificate",
      diagram: "Browser --[validates]--> Public CA cert --[installed on]--> Edge or Origin",
      points: [
        "Trusted broadly by browsers and operating systems out of the box",
        "Used for the browser-facing leg (Cloudflare's edge certificate), or on an origin that might be reached directly",
        "Issued by a public CA (e.g. Let's Encrypt) or Cloudflare's Universal SSL for the edge leg",
        "Required if there's any chance a client connects to the origin without going through Cloudflare",
      ],
    },
    explanation:
      "Using an Origin CA certificate on a server that's also reachable directly by the public is a real, common misconfiguration — browsers will show it as untrusted, because Origin CA certs are only meant to be validated by Cloudflare's edge, not by end users. If the origin might ever be reached directly, it needs a publicly trusted certificate instead.",
    officialSources: [
      { title: "SSL/TLS encryption modes", url: "https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/", sourceType: "cloudflare-documentation" },
      { title: "Cloudflare Origin CA", url: "https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/", sourceType: "cloudflare-documentation" },
    ],
  },
];

export function getMentalModel(slug: string): MentalModel | undefined {
  return MENTAL_MODELS.find((m) => m.slug === slug);
}

export interface SecurityLayerComparison {
  capability: string;
  purpose: string;
  detectionMethod: string;
  layer: string;
  configuration: string;
  typicalAction: string;
  example: string;
  limitations: string;
}

export const SECURITY_LAYERS: SecurityLayerComparison[] = [
  {
    capability: "WAF Managed Rules",
    purpose: "Detect known attack signatures across any application.",
    detectionMethod: "Vendor-maintained signature/pattern matching against request content.",
    layer: "L7 (HTTP)",
    configuration: "Enable/tune rule groups (SQLi, XSS, RCE, etc.) in the Security dashboard.",
    typicalAction: "Block, Managed Challenge, Log, Skip",
    example: "Blocking ?q=' OR 1=1--",
    limitations: "Generic — doesn't know your application's business logic; can false-positive on unusual-but-valid content.",
  },
  {
    capability: "WAF Custom Rules",
    purpose: "Enforce organization-specific access policy.",
    detectionMethod: "Explicit conditions you define (path, IP, country, header, etc.).",
    layer: "L7 (HTTP)",
    configuration: "Rules language expressions combined with and/or, per hostname or globally.",
    typicalAction: "Block, Challenge, Skip, Log, Allow",
    example: "Block /admin for all countries except HQ's.",
    limitations: "Only catches what you explicitly write — no built-in threat intelligence.",
  },
  {
    capability: "Rate Limiting",
    purpose: "Control abuse driven by request volume.",
    detectionMethod: "Counting requests per key over a time window against a threshold.",
    layer: "L7 (HTTP)",
    configuration: "Key, period, threshold, action in Rate Limiting Rules.",
    typicalAction: "Block, Managed Challenge, Log",
    example: "10 login attempts per IP per 60s → Challenge.",
    limitations: "Purely volume-based — a low-and-slow attacker can stay under threshold; doesn't inspect content or identity.",
  },
  {
    capability: "Bot Management",
    purpose: "Distinguish automated clients from humans, and good bots from bad ones.",
    detectionMethod: "TLS/HTTP fingerprinting, behavioral analysis, reputation, ML models.",
    layer: "L7 (HTTP), informed by TLS characteristics",
    configuration: "Bot Management / Bot Fight Mode settings; Custom Rules referencing bot score.",
    typicalAction: "Block, Challenge, Allow (verified bots), Log",
    example: "Scripted scraper hitting /products/* scores low → Challenge.",
    limitations: "Sophisticated automation (residential proxies, full headless browsers) can partially evade simpler signals.",
  },
  {
    capability: "DDoS Protection",
    purpose: "Absorb volumetric, protocol, and application-layer floods.",
    detectionMethod: "Anycast distribution + automated traffic analysis (L3/L4); overlaps with Rate Limiting/Bot Mgmt for L7.",
    layer: "L3/L4 primarily; L7 via other products",
    configuration: "Largely automatic for L3/L4; L7 requires explicit Rate Limiting/WAF/Bot Management configuration.",
    typicalAction: "Automated mitigation (L3/L4); Challenge/Block (L7, via other products)",
    example: "SYN flood absorbed at the edge before reaching the origin.",
    limitations: "Doesn't protect DNS-only records or non-HTTP protocols without Spectrum/Magic Transit.",
  },
];

// Request Decision Engine — an educational simulation, not a reproduction of
// Cloudflare's proprietary internal detection systems. The STAGE ORDER
// mirrors Cloudflare's documented security phase order (DDoS -> Custom Rules
// -> Rate Limiting -> Managed Rules -> Bot Fight Mode — see
// developers.cloudflare.com/waf/feature-interoperability/); the specific
// thresholds and pattern-matching rules below are simplified teaching rules,
// not Cloudflare's actual proprietary detection logic. Label accordingly in
// the UI: "Conceptual request-processing model."

export interface SimRequest {
  method: "GET" | "POST";
  hostname: string;
  protocol: "HTTPS" | "HTTP";
  path: string;
  query: string;
  body: string;
  country: string;
  sourceIp: string;
  userAgent: string;
  botScore: number; // 1-99, lower = more likely automated (mirrors cf.bot_management.score)
  requestsPerMinute: number;
  proxied: boolean;
}

export type StageId =
  | "browser"
  | "dns"
  | "edge"
  | "tls"
  | "ddos"
  | "rateLimit"
  | "waf"
  | "bot"
  | "cache"
  | "origin"
  | "response";

export interface StageOutcome {
  stageId: StageId;
  decision: string;
  blocked: boolean;
  skipped?: boolean;
  detail: string;
  evidence?: string[];
  relevantLogs?: string;
}

export interface SimulationResult {
  rayId: string;
  stages: StageOutcome[];
  finalStatus: number;
  finalStatusLabel: string;
  blockedAt: StageId | null;
  cacheStatus: "HIT" | "MISS" | "DYNAMIC" | "BYPASS" | "N/A";
}

const SQLI_PATTERN = /('|--|\bor\b\s+1\s*=\s*1|union\s+select|;\s*drop\s+table)/i;
const XSS_PATTERN = /<script|onerror=|javascript:/i;
const STATIC_EXT_PATTERN = /\.(png|jpg|jpeg|gif|svg|css|js|woff2?|ico)$/i;
const AUTOMATION_UA_PATTERN = /python-requests|curl|scrapy|bot|crawler|wget|go-http-client/i;
const RESTRICTED_COUNTRIES = ["RU", "CN", "KP", "IR"];

function randomRayId(): string {
  const chars = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < 16; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${s}-DFW`;
}

export function simulateRequest(req: SimRequest): SimulationResult {
  const rayId = randomRayId();
  const stages: StageOutcome[] = [];
  let blockedAt: StageId | null = null;
  let cacheStatus: SimulationResult["cacheStatus"] = "N/A";

  const requestLine = `${req.method} ${req.hostname}${req.path}${req.query ? "?" + req.query : ""}`;

  stages.push({
    stageId: "browser",
    decision: "Request constructed",
    blocked: false,
    detail: `${requestLine} — browser prepares the request over ${req.protocol}.`,
    evidence: [`Source IP (claimed): ${req.sourceIp || "unset"}`, `User-Agent: ${req.userAgent || "unset"}`],
  });

  stages.push({
    stageId: "dns",
    decision: req.proxied ? "Resolved to Cloudflare anycast IP (proxied)" : "Resolved to origin IP directly (DNS-only)",
    blocked: false,
    detail: req.proxied
      ? "The DNS record is proxied — Cloudflare's edge IPs are returned, putting Cloudflare in the request path."
      : "The DNS record is DNS-only — the origin's real IP is returned. No Cloudflare product downstream will see this request.",
    relevantLogs: "DNS Analytics",
  });

  if (!req.proxied) {
    stages.push({
      stageId: "edge",
      decision: "Skipped — traffic bypasses Cloudflare entirely",
      blocked: false,
      skipped: true,
      detail: "Because the record is DNS-only, the browser connects directly to the origin. WAF, Bot Management, Rate Limiting, and Cache do not apply.",
    });
    stages.push({
      stageId: "origin",
      decision: "Origin receives the raw request directly",
      blocked: false,
      detail: "The origin sees the visitor's real IP as the TCP source (no CF-Connecting-IP needed) and must handle security itself.",
    });
    stages.push({
      stageId: "response",
      decision: "200 OK (assuming the origin app allows it)",
      blocked: false,
      detail: "Response returns directly from the origin to the browser, uninspected by Cloudflare.",
    });
    return {
      rayId,
      stages,
      finalStatus: 200,
      finalStatusLabel: "OK (origin-handled, uninspected)",
      blockedAt: null,
      cacheStatus: "N/A",
    };
  }

  stages.push({
    stageId: "edge",
    decision: "Connection accepted at nearest Cloudflare data center",
    blocked: false,
    detail: "Anycast routing sends the connection to the nearest healthy Cloudflare location.",
    evidence: [`Visitor country (CF-IPCountry): ${req.country || "unset"}`],
  });

  stages.push({
    stageId: "tls",
    decision: req.protocol === "HTTPS" ? "TLS handshake completed" : "No TLS — connection is plaintext HTTP",
    blocked: false,
    detail:
      req.protocol === "HTTPS"
        ? "Browser-to-edge TLS is terminated here. (Edge-to-origin TLS behavior depends on SSL/TLS mode — see the TLS Lab.)"
        : "The visitor connected over plain HTTP. Cloudflare will still process the request unless the zone is configured to force HTTPS — see the SSL/TLS module.",
  });

  const highVolume = req.requestsPerMinute > 1000;
  if (highVolume) {
    stages.push({
      stageId: "ddos",
      decision: "Mitigated — volumetric pattern detected",
      blocked: true,
      detail:
        "Request volume from this source is far beyond a single client's plausible legitimate rate. L3/L4/L7 DDoS mitigation is always-on and network-wide, evaluated before product-level rules like Custom Rules or Rate Limiting.",
      evidence: [`Observed rate: ${req.requestsPerMinute}/min`],
      relevantLogs: "Security Events (DDoS mitigation active)",
    });
    blockedAt = "ddos";
  } else {
    stages.push({
      stageId: "ddos",
      decision: "No volumetric attack pattern detected",
      blocked: false,
      detail:
        "Always-on network-layer analysis found nothing unusual at this scale. This simulator focuses mainly on the product-level (L7) controls below — Rate Limiting, WAF, and Bot Management — since that's where most application-layer decisions are actually made.",
    });
  }

  // Cloudflare's fixed phase order is: L7 DDoS -> Custom Rules -> Rate Limiting ->
  // Managed Rules -> (Super) Bot Fight Mode. See:
  // developers.cloudflare.com/waf/feature-interoperability/
  if (!blockedAt && req.requestsPerMinute > 100) {
    stages.push({
      stageId: "rateLimit",
      decision: `BLOCK — ${req.requestsPerMinute}/min exceeds the 100/min threshold for this key`,
      blocked: true,
      detail: "This client has exceeded the configured request threshold for this path within the current window. Rate Limiting runs before the Managed Rules phase, so this can block a request before signature checks even run.",
      evidence: [`Requests: ${req.requestsPerMinute}/min`, "Threshold: 100/min", `Key: ip.src (${req.sourceIp || "unset"})`],
      relevantLogs: "Security Events, filtered to Rate Limiting rule matches",
    });
    blockedAt = "rateLimit";
  } else if (!blockedAt) {
    stages.push({
      stageId: "rateLimit",
      decision: `Under threshold — ${req.requestsPerMinute}/min < 100/min — Allow`,
      blocked: false,
      detail: "Request volume from this client is within configured limits.",
    });
  } else {
    stages.push({
      stageId: "rateLimit",
      decision: "Skipped — request was blocked upstream",
      blocked: false,
      skipped: true,
      detail: "No rate-limit counting is meaningfully evaluated once an earlier phase has already blocked the request.",
    });
  }

  const fullTarget = `${req.path}${req.query ? "?" + req.query : ""} ${req.body}`;
  const sqli = SQLI_PATTERN.test(fullTarget);
  const xss = XSS_PATTERN.test(fullTarget);
  const geoBlockPath = req.path.toLowerCase().startsWith("/admin");
  const geoBlockCountry = RESTRICTED_COUNTRIES.includes(req.country.toUpperCase());

  if (!blockedAt) {
    if (geoBlockPath && geoBlockCountry) {
      stages.push({
        stageId: "waf",
        decision: `BLOCK — Custom Rule matched (geo-restricted path)`,
        blocked: true,
        detail: `Custom Rules run before Managed Rules in the phase order. This request matched an organization-defined policy: http.request.uri.path eq "/admin" and ip.geoip.country in {"${req.country.toUpperCase()}"} — a business rule, not a generic attack signature.`,
        evidence: [`Path: ${req.path}`, `Country: ${req.country.toUpperCase()}`],
        relevantLogs: "Security Events, filtered to Custom Rules",
      });
      blockedAt = "waf";
    } else if (sqli || xss) {
      stages.push({
        stageId: "waf",
        decision: `BLOCK — Managed Rule matched (${sqli ? "SQL Injection" : "Cross-Site Scripting"})`,
        blocked: true,
        detail: "The request content matched a known attack signature in the Cloudflare Managed Ruleset. The request is blocked here — Bot Fight Mode, Cache, and the origin never see it.",
        evidence: [`Matched content: ${req.query || req.body || req.path}`],
        relevantLogs: "Security Events, filtered to Managed Rules",
      });
      blockedAt = "waf";
    } else {
      stages.push({
        stageId: "waf",
        decision: "No Managed or Custom Rule matched — Allow",
        blocked: false,
        detail: "Request content doesn't match any known attack signature or configured policy rule.",
      });
    }
  } else {
    stages.push({
      stageId: "waf",
      decision: "Skipped — request was blocked upstream",
      blocked: false,
      skipped: true,
      detail: "No rule evaluation occurs once an earlier phase has already blocked or challenged the request.",
    });
  }

  if (!blockedAt) {
    const uaLooksAutomated = AUTOMATION_UA_PATTERN.test(req.userAgent);
    let botDecision: string;
    let botBlocked = false;
    let classification: string;
    if (req.botScore < 10) {
      classification = "Automated (high confidence)";
      botDecision = "BLOCK — bot score in the definitively-automated range";
      botBlocked = true;
      blockedAt = "bot";
    } else if (req.botScore < 30) {
      classification = "Likely automated";
      botDecision = "Managed Challenge issued — bot score in the likely-automated range";
      botBlocked = true;
      blockedAt = "bot";
    } else {
      classification = "Likely human";
      botDecision = "Allow — bot score consistent with a normal browser";
    }
    stages.push({
      stageId: "bot",
      decision: botDecision,
      blocked: botBlocked,
      detail: botBlocked
        ? "Fingerprinting (TLS/HTTP characteristics) and behavioral signals drive this score — not the User-Agent header, which the client fully controls and can misrepresent."
        : "Client fingerprint and behavior are consistent with a normal browser. (Per-request scores like this require the Bot Management Enterprise add-on — Bot Fight Mode/Super Bot Fight Mode don't expose one.)",
      evidence: [
        `Bot score: ${req.botScore}/99`,
        `Classification: ${classification}`,
        `User-Agent claims: ${req.userAgent || "unset"}${uaLooksAutomated ? " (self-identifies as automated)" : ""}`,
      ],
      relevantLogs: "Bot Analytics",
    });
  } else {
    stages.push({
      stageId: "bot",
      decision: "Skipped — request was blocked upstream",
      blocked: false,
      skipped: true,
      detail: "No bot evaluation occurs once an earlier phase has already blocked or challenged the request.",
    });
  }

  if (!blockedAt) {
    const cacheable = req.method === "GET" && STATIC_EXT_PATTERN.test(req.path);
    if (cacheable) {
      cacheStatus = "HIT";
      stages.push({
        stageId: "cache",
        decision: "Cache HIT — served from edge",
        blocked: false,
        detail: "A valid cached copy exists for this cache key (scheme + host + path + query by default). The origin is not contacted for this request.",
        relevantLogs: "cf-cache-status response header",
      });
      stages.push({
        stageId: "origin",
        decision: "Skipped — served from cache",
        blocked: false,
        detail: "Because of the cache HIT, the origin never receives this request.",
      });
    } else {
      cacheStatus = req.method === "GET" ? "MISS" : "BYPASS";
      stages.push({
        stageId: "cache",
        decision: req.method === "GET" ? "Cache MISS — not cached or no valid copy" : "Bypass — non-GET requests aren't cached",
        blocked: false,
        detail: req.method === "GET"
          ? "This path isn't eligible for caching by default (e.g. HTML without a Cache Rule), or no cached copy currently exists."
          : "POST requests are not cached; this request always reaches the origin.",
        relevantLogs: "cf-cache-status response header",
      });
      stages.push({
        stageId: "origin",
        decision: "Forwarded to origin",
        blocked: false,
        detail: `Cloudflare opens its own connection to the origin and forwards the request. The origin sees Cloudflare's IP as the TCP source; CF-Connecting-IP carries the real client IP (${req.sourceIp || "unset"}).`,
        evidence: [`CF-Connecting-IP: ${req.sourceIp || "unset"}`, `CF-IPCountry: ${req.country || "unset"}`, `Host: ${req.hostname}`],
        relevantLogs: "Origin access logs (if configured to read CF-Connecting-IP)",
      });
    }
  } else {
    stages.push({
      stageId: "cache",
      decision: "Skipped — request was blocked upstream",
      blocked: false,
      skipped: true,
      detail: "No cache lookup occurs once a security product has already blocked or challenged the request.",
    });
    stages.push({
      stageId: "origin",
      decision: "Never reached",
      blocked: false,
      skipped: true,
      detail: "The origin has no visibility into this request at all.",
    });
  }

  let finalStatus = 200;
  let finalStatusLabel = "OK";
  if (blockedAt === "ddos") {
    finalStatus = 403;
    finalStatusLabel = "Forbidden (DDoS Mitigation)";
  } else if (blockedAt === "rateLimit") {
    finalStatus = 429;
    finalStatusLabel = "Too Many Requests (Rate Limit)";
  } else if (blockedAt === "waf") {
    finalStatus = 403;
    finalStatusLabel = "Forbidden (WAF Rule)";
  } else if (blockedAt === "bot") {
    finalStatus = 403;
    finalStatusLabel = "Managed Challenge (Bot Management)";
  }

  stages.push({
    stageId: "response",
    decision: blockedAt ? `${finalStatus} returned to browser` : `${finalStatus} OK returned to browser`,
    blocked: !!blockedAt,
    detail: blockedAt
      ? "Cloudflare generates the block/challenge response directly — the origin was never involved."
      : "The response (from cache or origin) is returned to the browser, optionally stored in cache for future requests.",
  });

  return { rayId, stages, finalStatus, finalStatusLabel, blockedAt, cacheStatus };
}

export interface SimRequest {
  method: "GET" | "POST";
  path: string;
  query: string;
  body: string;
  botLike: boolean;
  highRate: boolean;
  proxied: boolean;
}

export type StageId =
  | "browser"
  | "dns"
  | "edge"
  | "tls"
  | "waf"
  | "bot"
  | "rateLimit"
  | "cache"
  | "origin"
  | "response";

export interface StageOutcome {
  stageId: StageId;
  decision: string;
  blocked: boolean;
  skipped?: boolean;
  detail: string;
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

  stages.push({
    stageId: "browser",
    decision: "Request constructed",
    blocked: false,
    detail: `${req.method} ${req.path}${req.query ? "?" + req.query : ""} — browser prepares the request.`,
  });

  stages.push({
    stageId: "dns",
    decision: req.proxied ? "Resolved to Cloudflare anycast IP (proxied)" : "Resolved to origin IP directly (DNS-only)",
    blocked: false,
    detail: req.proxied
      ? "The DNS record is proxied — Cloudflare's edge IPs are returned, putting Cloudflare in the request path."
      : "The DNS record is DNS-only — the origin's real IP is returned. No Cloudflare product downstream will see this request.",
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
  });

  stages.push({
    stageId: "tls",
    decision: "TLS handshake completed",
    blocked: false,
    detail: "Browser-to-edge TLS is terminated here. (Edge-to-origin TLS behavior depends on SSL/TLS mode — see the TLS Lab.)",
  });

  const fullTarget = `${req.path}${req.query ? "?" + req.query : ""} ${req.body}`;
  const sqli = SQLI_PATTERN.test(fullTarget);
  const xss = XSS_PATTERN.test(fullTarget);

  if (sqli || xss) {
    stages.push({
      stageId: "waf",
      decision: `BLOCK — Managed Rule matched (${sqli ? "SQL Injection" : "Cross-Site Scripting"})`,
      blocked: true,
      detail: `The request content matched a known attack signature in the Cloudflare Managed Ruleset. The request is blocked here — Bot Management, Rate Limiting, Cache, and the origin never see it.`,
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

  if (!blockedAt) {
    if (req.botLike) {
      stages.push({
        stageId: "bot",
        decision: "Managed Challenge issued (low bot score)",
        blocked: true,
        detail: "Fingerprinting and behavioral signals suggest this client is automated. Since no verified-bot allowlist matched, a challenge is issued instead of an outright block.",
      });
      blockedAt = "bot";
    } else {
      stages.push({
        stageId: "bot",
        decision: "Bot score high — treated as human/legitimate",
        blocked: false,
        detail: "Client fingerprint and behavior are consistent with a normal browser.",
      });
    }
  }

  if (!blockedAt) {
    if (req.highRate) {
      stages.push({
        stageId: "rateLimit",
        decision: "BLOCK — threshold exceeded for this key",
        blocked: true,
        detail: "This client has exceeded the configured request threshold for this path within the current window.",
      });
      blockedAt = "rateLimit";
    } else {
      stages.push({
        stageId: "rateLimit",
        decision: "Under threshold — Allow",
        blocked: false,
        detail: "Request volume from this client is within configured limits.",
      });
    }
  }

  if (!blockedAt) {
    const cacheable = req.method === "GET" && STATIC_EXT_PATTERN.test(req.path);
    if (cacheable) {
      cacheStatus = "HIT";
      stages.push({
        stageId: "cache",
        decision: "Cache HIT — served from edge",
        blocked: false,
        detail: "A valid cached copy exists for this cache key. The origin is not contacted for this request.",
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
      });
      stages.push({
        stageId: "origin",
        decision: "Forwarded to origin",
        blocked: false,
        detail: "Cloudflare opens its own connection to the origin (or reuses a pooled one) and forwards the request, adding CF-Connecting-IP and related headers.",
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
  if (blockedAt === "waf") {
    finalStatus = 403;
    finalStatusLabel = "Forbidden (WAF Managed Rule)";
  } else if (blockedAt === "bot") {
    finalStatus = 403;
    finalStatusLabel = "Managed Challenge (Bot Management)";
  } else if (blockedAt === "rateLimit") {
    finalStatus = 429;
    finalStatusLabel = "Too Many Requests (Rate Limit)";
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

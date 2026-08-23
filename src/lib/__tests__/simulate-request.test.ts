import { describe, it, expect } from "vitest";
import { simulateRequest, type SimRequest } from "../simulate-request";

const BASE: SimRequest = {
  method: "GET",
  hostname: "app.example.com",
  protocol: "HTTPS",
  path: "/",
  query: "",
  body: "",
  country: "US",
  sourceIp: "203.0.113.50",
  userAgent: "Mozilla/5.0 Chrome/120.0",
  botScore: 85,
  requestsPerMinute: 4,
  proxied: true,
};

describe("simulateRequest", () => {
  it("allows a normal request all the way to the origin", () => {
    const r = simulateRequest(BASE);
    expect(r.blockedAt).toBeNull();
    expect(r.finalStatus).toBe(200);
  });

  it("bypasses every Cloudflare product when DNS-only", () => {
    const r = simulateRequest({ ...BASE, proxied: false });
    expect(r.blockedAt).toBeNull();
    expect(r.cacheStatus).toBe("N/A");
    const stageIds = r.stages.map((s) => s.stageId);
    expect(stageIds).not.toContain("waf");
    expect(stageIds).not.toContain("rateLimit");
  });

  it("blocks a SQL injection attempt at the WAF stage", () => {
    const r = simulateRequest({ ...BASE, path: "/search", query: "q=' OR 1=1--" });
    expect(r.blockedAt).toBe("waf");
    expect(r.finalStatus).toBe(403);
  });

  it("blocks an XSS attempt at the WAF stage", () => {
    const r = simulateRequest({ ...BASE, path: "/comment", query: "text=<script>alert(1)</script>" });
    expect(r.blockedAt).toBe("waf");
  });

  it("blocks a geo-restricted admin path via a Custom Rule before Managed Rules", () => {
    const r = simulateRequest({ ...BASE, path: "/admin", country: "RU" });
    expect(r.blockedAt).toBe("waf");
    const wafStage = r.stages.find((s) => s.stageId === "waf");
    expect(wafStage?.decision).toMatch(/Custom Rule/);
  });

  it("does not block /admin for a non-restricted country", () => {
    const r = simulateRequest({ ...BASE, path: "/admin", country: "US" });
    expect(r.blockedAt).toBeNull();
  });

  it("blocks at Rate Limiting before it ever reaches the WAF stage for a high-rate malicious request", () => {
    // Cloudflare's documented phase order is Custom Rules -> Rate Limiting -> Managed
    // Rules, so a request that would ALSO match a WAF signature should still be
    // stopped at Rate Limiting first if the rate is over threshold.
    const r = simulateRequest({
      ...BASE,
      path: "/search",
      query: "q=' OR 1=1--",
      requestsPerMinute: 150,
    });
    expect(r.blockedAt).toBe("rateLimit");
    expect(r.finalStatus).toBe(429);
    const wafStage = r.stages.find((s) => s.stageId === "waf");
    expect(wafStage?.skipped).toBe(true);
  });

  it("mitigates a volumetric flood at the DDoS stage, skipping Rate Limiting", () => {
    const r = simulateRequest({ ...BASE, requestsPerMinute: 5000 });
    expect(r.blockedAt).toBe("ddos");
    const rateLimitStage = r.stages.find((s) => s.stageId === "rateLimit");
    expect(rateLimitStage?.skipped).toBe(true);
  });

  it("challenges a low bot score", () => {
    const r = simulateRequest({ ...BASE, botScore: 5 });
    expect(r.blockedAt).toBe("bot");
    expect(r.finalStatus).toBe(403);
  });

  it("allows a high bot score through", () => {
    const r = simulateRequest({ ...BASE, botScore: 90 });
    expect(r.blockedAt).toBeNull();
  });

  it("reports a cache HIT for a static asset", () => {
    const r = simulateRequest({ ...BASE, path: "/images/logo.png" });
    expect(r.cacheStatus).toBe("HIT");
    const originStage = r.stages.find((s) => s.stageId === "origin");
    expect(originStage?.decision).toMatch(/Skipped/);
  });

  it("reports a cache MISS for a normal HTML GET", () => {
    const r = simulateRequest({ ...BASE, path: "/dashboard" });
    expect(r.cacheStatus).toBe("MISS");
  });

  it("bypasses cache for POST requests", () => {
    const r = simulateRequest({ ...BASE, method: "POST", path: "/api/submit" });
    expect(r.cacheStatus).toBe("BYPASS");
  });

  it("skips cache and origin entirely once blocked upstream", () => {
    const r = simulateRequest({ ...BASE, botScore: 2 });
    const cacheStage = r.stages.find((s) => s.stageId === "cache");
    const originStage = r.stages.find((s) => s.stageId === "origin");
    expect(cacheStage?.skipped).toBe(true);
    expect(originStage?.skipped).toBe(true);
  });

  it("generates a unique Ray ID per simulation", () => {
    const a = simulateRequest(BASE);
    const b = simulateRequest(BASE);
    expect(a.rayId).not.toBe(b.rayId);
    expect(a.rayId).toMatch(/-DFW$/);
  });
});

import { describe, it, expect } from "vitest";
import { buildForwardedHeaders, computeOriginLog } from "../origin-inspector";

describe("buildForwardedHeaders", () => {
  it("is deterministic for the same inputs (no Math.random/Date.now — see the hydration bugfix)", () => {
    const a = buildForwardedHeaders("198.51.100.23", "GB", "app.example.com", true);
    const b = buildForwardedHeaders("198.51.100.23", "GB", "app.example.com", true);
    expect(a).toEqual(b);
  });

  it("includes CF-Connecting-IP set to the visitor IP", () => {
    const headers = buildForwardedHeaders("198.51.100.23", "GB", "app.example.com", true);
    const cfConnectingIp = headers.find((h) => h.name === "CF-Connecting-IP");
    expect(cfConnectingIp?.value).toBe("198.51.100.23");
  });

  it("reflects http vs https in X-Forwarded-Proto", () => {
    const httpHeaders = buildForwardedHeaders("198.51.100.23", "GB", "app.example.com", false);
    const proto = httpHeaders.find((h) => h.name === "X-Forwarded-Proto");
    expect(proto?.value).toBe("http");
  });
});

describe("computeOriginLog", () => {
  it("logs the real visitor IP when the origin trusts forwarded headers", () => {
    const log = computeOriginLog("198.51.100.23", "104.16.132.229", true);
    expect(log.sourceIp).toBe("198.51.100.23");
    expect(log.isCorrect).toBe(true);
  });

  it("logs Cloudflare's edge IP when the origin does not trust forwarded headers", () => {
    const log = computeOriginLog("198.51.100.23", "104.16.132.229", false);
    expect(log.sourceIp).toBe("104.16.132.229");
    expect(log.isCorrect).toBe(false);
  });
});

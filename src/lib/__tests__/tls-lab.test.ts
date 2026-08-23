import { describe, it, expect } from "vitest";
import { evaluateTls } from "../tls-lab";

describe("evaluateTls", () => {
  it("Off is insecure regardless of origin certificate state", () => {
    const r = evaluateTls("off", "valid");
    expect(r.status).toBe("insecure");
  });

  it("Flexible is insecure — the origin leg is always plain HTTP", () => {
    const r = evaluateTls("flexible", "valid");
    expect(r.status).toBe("insecure");
    expect(r.originLeg).toMatch(/HTTP/);
    expect(r.originLeg).not.toMatch(/HTTPS/);
  });

  it("Full accepts an invalid (self-signed) origin certificate without validating it", () => {
    const r = evaluateTls("full", "invalid");
    expect(r.status).toBe("ok");
  });

  it("Full fails with 525 if the origin has no HTTPS listener at all", () => {
    const r = evaluateTls("full", "none");
    expect(r.status).toBe("error");
    expect(r.errorCode).toBe(525);
  });

  it("Full (Strict) rejects an invalid origin certificate with a 526", () => {
    const r = evaluateTls("full-strict", "invalid");
    expect(r.status).toBe("error");
    expect(r.errorCode).toBe(526);
  });

  it("Full (Strict) succeeds with a valid, trusted origin certificate", () => {
    const r = evaluateTls("full-strict", "valid");
    expect(r.status).toBe("ok");
    expect(r.errorCode).toBeUndefined();
  });

  it("Full (Strict) fails with 525 before it ever gets to certificate validation if there's no HTTPS listener", () => {
    const r = evaluateTls("full-strict", "none");
    expect(r.errorCode).toBe(525);
  });
});

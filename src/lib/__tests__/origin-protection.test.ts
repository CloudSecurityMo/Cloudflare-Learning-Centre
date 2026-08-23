import { describe, it, expect } from "vitest";
import { evaluateOriginProtection, type OriginProtectionConfig } from "../origin-protection";

const BASE: OriginProtectionConfig = {
  staleDnsRecord: false,
  firewallRestrictedToCloudflare: false,
  authenticatedOriginPulls: false,
  tunnelInUse: false,
};

describe("evaluateOriginProtection", () => {
  it("is bypassable when the IP is discoverable and the firewall is wide open", () => {
    const r = evaluateOriginProtection({ ...BASE, staleDnsRecord: true });
    expect(r.bypassable).toBe(true);
  });

  it("is protected (by obscurity only) when the firewall is open but nothing leaks the IP", () => {
    const r = evaluateOriginProtection({ ...BASE, staleDnsRecord: false });
    expect(r.bypassable).toBe(false);
    expect(r.connectable).toBe(true);
    expect(r.headline).toMatch(/obscurity/i);
  });

  it("is protected when the firewall is restricted, even if the IP leaks", () => {
    const r = evaluateOriginProtection({ ...BASE, staleDnsRecord: true, firewallRestrictedToCloudflare: true });
    expect(r.bypassable).toBe(false);
    expect(r.connectable).toBe(false);
  });

  it("is protected when Authenticated Origin Pulls is enabled, even with an open firewall and leaked IP", () => {
    const r = evaluateOriginProtection({ ...BASE, staleDnsRecord: true, authenticatedOriginPulls: true });
    expect(r.bypassable).toBe(false);
  });

  it("is always protected when Cloudflare Tunnel is in use, regardless of every other toggle", () => {
    const r = evaluateOriginProtection({
      staleDnsRecord: true,
      firewallRestrictedToCloudflare: false,
      authenticatedOriginPulls: false,
      tunnelInUse: true,
    });
    expect(r.bypassable).toBe(false);
    expect(r.connectable).toBe(false);
    expect(r.headline).toMatch(/no inbound port/i);
  });
});

export interface OriginProtectionConfig {
  staleDnsRecord: boolean; // a DNS-only record still resolves to the origin IP
  firewallRestrictedToCloudflare: boolean; // origin firewall only allows Cloudflare's published IP ranges
  authenticatedOriginPulls: boolean; // mTLS — origin requires a valid Cloudflare client cert
  tunnelInUse: boolean; // Cloudflare Tunnel — no public inbound port at all
}

export interface OriginProtectionResult {
  discoverable: boolean;
  connectable: boolean;
  bypassable: boolean;
  headline: string;
  explanation: string;
}

export function evaluateOriginProtection(cfg: OriginProtectionConfig): OriginProtectionResult {
  const inboundPortOpen = !cfg.tunnelInUse;
  const connectable = inboundPortOpen && !cfg.firewallRestrictedToCloudflare && !cfg.authenticatedOriginPulls;
  const discoverable = cfg.staleDnsRecord;
  const bypassable = discoverable && connectable;

  if (cfg.tunnelInUse) {
    return {
      discoverable,
      connectable: false,
      bypassable: false,
      headline: "Origin protected — no inbound port exists",
      explanation:
        "Cloudflare Tunnel means the origin never has an inbound-listening port at all. There is nothing for an attacker to connect to directly, regardless of whether the IP (or the fact that a Tunnel connector exists somewhere) is discoverable.",
    };
  }

  if (bypassable) {
    return {
      discoverable,
      connectable,
      bypassable,
      headline: "Origin bypassable — Cloudflare can be routed around entirely",
      explanation:
        "The origin IP is discoverable (a stale DNS-only record leaks it) AND the origin firewall accepts connections from anyone. An attacker who finds the IP connects directly, skipping every Cloudflare control — WAF, Bot Management, Rate Limiting, DDoS mitigation — entirely.",
    };
  }

  if (connectable && !discoverable) {
    return {
      discoverable,
      connectable,
      bypassable: false,
      headline: "Origin protected today — but only by obscurity",
      explanation:
        "The firewall would accept a direct connection from anyone who found the IP, but nothing currently leaks it. This is fragile: IPs get discovered eventually — via Certificate Transparency logs, email headers, old DNS records, or misconfiguration — obscurity is not a real access control. Restrict the firewall to Cloudflare's IP ranges, or add Authenticated Origin Pulls, to close this properly.",
    };
  }

  return {
    discoverable,
    connectable: false,
    bypassable: false,
    headline: "Origin protected",
    explanation: cfg.firewallRestrictedToCloudflare
      ? "The firewall only accepts connections from Cloudflare's published IP ranges. Even if the origin IP is discovered, a direct connection attempt is dropped before it reaches the application."
      : "Authenticated Origin Pulls requires a valid Cloudflare client certificate for every connection. Even if the origin IP is discovered and the firewall is open, a direct connection without that certificate is rejected at the TLS layer.",
  };
}

// Shared "click a component, get a deep explanation" registry used by the
// homepage hero architecture, the Deployment Models diagrams, and the
// Request Lifecycle Simulator. Each entry answers the five core questions:
// what is it, where does it sit, what problem does it solve, what happens
// to a request, what happens if it's misconfigured.

export interface ArchitectureNodeDetail {
  slug: string;
  label: string;
  category: "network" | "dns" | "security" | "compute" | "origin" | "zerotrust";
  whereItSits: string;
  sees: string;
  protects: string;
  doesNotProtect: string;
  configuredBy: string;
  logs: string;
  commonMistakes: string[];
  exampleAttack?: string;
  exampleLegit?: string;
  learnMoreSlug?: string; // slug into LEARN_TOPICS
}

export const NODE_DETAILS: Record<string, ArchitectureNodeDetail> = {
  internet: {
    slug: "internet",
    label: "Internet / Browser",
    category: "network",
    whereItSits: "The visitor's device, before any DNS resolution or connection begins.",
    sees: "Nothing yet — this is the request's origin point.",
    protects: "N/A",
    doesNotProtect: "N/A",
    configuredBy: "N/A — outside your control.",
    logs: "Browser devtools / client-side telemetry only.",
    commonMistakes: ["Assuming all clients are browsers — many are scripts, bots, or other services."],
  },
  dns: {
    slug: "dns",
    label: "DNS Resolution",
    category: "dns",
    whereItSits: "Before any connection to Cloudflare or the origin — resolves the hostname to an IP.",
    sees: "Only the query name and type (e.g. A record for example.com). No HTTP content.",
    protects: "DNSSEC protects response integrity. CAA records restrict certificate issuance.",
    doesNotProtect: "DNS resolution alone provides no protection against L7 attacks, malware, or bad requests — that requires the record to be proxied.",
    configuredBy: "DNS records in the Cloudflare dashboard (or API/Terraform); nameserver delegation at the registrar.",
    logs: "DNS Analytics (query volume, response codes, query types).",
    commonMistakes: [
      "Leaving a record DNS-only and assuming it's still protected by WAF/Bot Management.",
      "Not enabling DNSSEC, leaving responses unauthenticated end-to-end.",
    ],
    learnMoreSlug: "dns",
  },
  "edge-tls": {
    slug: "edge-tls",
    label: "TLS Termination",
    category: "security",
    whereItSits: "The first thing that happens at Cloudflare's edge once a proxied connection arrives — before any content inspection.",
    sees: "The TLS handshake: SNI, cipher suite negotiation, client certificate if mTLS is used.",
    protects: "Encrypts browser-to-edge traffic; can enforce minimum TLS version and strong cipher suites.",
    doesNotProtect: "Does not by itself validate or encrypt the edge-to-origin leg — that depends on the SSL/TLS mode (Full Strict recommended).",
    configuredBy: "SSL/TLS mode, minimum TLS version, and edge certificates in the dashboard.",
    logs: "SSL/TLS-related fields in HTTP request logs; certificate/handshake errors surface as 525/526.",
    commonMistakes: ["Using Flexible mode for sensitive traffic, leaving the origin leg unencrypted."],
    learnMoreSlug: "ssl-tls",
  },
  waf: {
    slug: "waf",
    label: "WAF",
    category: "security",
    whereItSits: "After TLS termination, before the request reaches cache or origin — only for proxied hostnames.",
    sees: "Full HTTP request: method, path, query string, headers, cookies, and body.",
    protects: "Known attack signatures (Managed Rules: SQLi, XSS, RCE, path traversal) and organization-defined policy (Custom Rules).",
    doesNotProtect: "Business-logic flaws, authorization bugs, or anything in traffic that never reaches Cloudflare (DNS-only records).",
    configuredBy: "WAF Managed Rules and Custom Rules in the Security section of the dashboard.",
    logs: "Security Events — shows the matched rule, action taken, and request details, correlated by Ray ID.",
    commonMistakes: [
      "Blocking globally without first running new rules in Log mode.",
      "Writing Custom Rule exceptions broader than the specific false positive.",
    ],
    exampleAttack: "GET /search?q=' OR 1=1--  →  matched by SQLi Managed Rule  →  403 Block",
    exampleLegit: "POST /api/comments { text: \"please SELECT the best option\" }  →  benign, but can false-positive on broad signatures",
    learnMoreSlug: "waf",
  },
  "rate-limiting": {
    slug: "rate-limiting",
    label: "Rate Limiting",
    category: "security",
    whereItSits: "After WAF Managed/Custom Rules, evaluating request volume over time by a chosen key (IP, session, header).",
    sees: "Request count per key within a rolling time window — not the content of any single request.",
    protects: "Credential stuffing, brute force, and L7 volumetric abuse on specific endpoints.",
    doesNotProtect: "A single low-and-slow client staying under threshold; content-based attacks (that's the WAF's job).",
    configuredBy: "Rate Limiting Rules in the Security section — key, period, threshold, action.",
    logs: "Security Events, filtered to Rate Limiting rule matches.",
    commonMistakes: ["Counting by IP alone behind NAT/CGNAT, penalizing many real users for one heavy client."],
    learnMoreSlug: "rate-limiting",
  },
  "bot-management": {
    slug: "bot-management",
    label: "Bot Management",
    category: "security",
    whereItSits: "Evaluates client authenticity via fingerprinting/behavior, typically after WAF and rate limiting in the phase order.",
    sees: "TLS/HTTP fingerprint characteristics, request timing/behavior patterns, IP/network reputation.",
    protects: "Scraping, credential stuffing at scale, inventory hoarding, unwanted automation — while allowing verified good bots.",
    doesNotProtect: "A sufficiently sophisticated headless-browser + residential-proxy setup can evade simpler signals; defense in depth still matters.",
    configuredBy: "Bot Management / Bot Fight Mode settings and Custom Rules referencing cf.bot_management.score.",
    logs: "Bot Analytics — score distribution and traffic classification over time.",
    commonMistakes: ["Blocking purely on User-Agent, which is trivially spoofed and also risks blocking honest verified bots."],
    learnMoreSlug: "bot-management",
  },
  ddos: {
    slug: "ddos",
    label: "DDoS Mitigation",
    category: "security",
    whereItSits: "Always-on at the network edge for L3/L4; overlaps with rate limiting/bot management for L7.",
    sees: "Traffic volume and shape across Cloudflare's anycast network in aggregate.",
    protects: "Volumetric floods, protocol attacks (SYN floods), and (via Rate Limiting/Bot Mgmt) application-layer floods.",
    doesNotProtect: "DNS-only records (bypasses the edge); non-HTTP protocols without Spectrum/Magic Transit.",
    configuredBy: "Largely automatic for L3/L4; L7 requires explicit Rate Limiting/Bot Management/WAF configuration.",
    logs: "DDoS-specific events in Security Analytics during active mitigation.",
    commonMistakes: ["Assuming 'DDoS protection is on' covers L7 automatically — it requires the other security products configured."],
    learnMoreSlug: "ddos",
  },
  cdn: {
    slug: "cdn",
    label: "Cache / CDN",
    category: "security",
    whereItSits: "After security checks pass, before (or instead of) contacting the origin.",
    sees: "The full request, used to compute a cache key (scheme + host + path + query by default).",
    protects: "Reduces origin load and exposure to repeated identical requests; not a security control per se, but reduces attack surface hitting the origin.",
    doesNotProtect: "Does not inspect for malicious content — that's the WAF's role, evaluated before caching.",
    configuredBy: "Cache Rules, Cache-Control headers from origin, Page Rules (legacy).",
    logs: "cf-cache-status header per response; Cache Analytics.",
    commonMistakes: ["Expecting HTML to be cached by default without an explicit Cache Rule."],
    learnMoreSlug: "cdn",
  },
  origin: {
    slug: "origin",
    label: "Origin",
    category: "origin",
    whereItSits: "The actual application infrastructure, reached only after Cloudflare forwards a request (on a cache MISS or for non-cacheable content).",
    sees: "Whatever Cloudflare forwards — by default the TCP source IP will be Cloudflare's, with the real client IP carried in CF-Connecting-IP.",
    protects: "N/A — this is what's being protected, not a control itself. Origin-side firewalling to Cloudflare IP ranges (or Tunnel) protects it from direct exposure.",
    doesNotProtect: "An origin with an open, unrestricted firewall can be reached directly if its IP is discovered, bypassing every edge control.",
    configuredBy: "Origin server/firewall configuration, real-IP header handling, origin certificate for Full (Strict).",
    logs: "Origin application/access logs — must be configured to use CF-Connecting-IP for accurate client IPs.",
    commonMistakes: [
      "Not restricting the origin firewall to Cloudflare's IP ranges.",
      "Reading the raw TCP source IP instead of CF-Connecting-IP for logging/rate limiting.",
    ],
    learnMoreSlug: "proxying",
  },
  "zt-access": {
    slug: "zt-access",
    label: "Cloudflare Access",
    category: "zerotrust",
    whereItSits: "In front of an application (public or fully private), evaluated after identity/device checks and before the app is reached.",
    sees: "Authenticated identity, device posture signals, and the requested application/path.",
    protects: "Unauthorized access to internal or sensitive applications, independent of network location.",
    doesNotProtect: "Does not by itself remove inbound network exposure — pair with Tunnel for a fully private app.",
    configuredBy: "Access applications and policies in Cloudflare Zero Trust, tied to an identity provider.",
    logs: "Access authentication logs — who was allowed/denied, and why.",
    commonMistakes: ["Assuming Access alone hides the app's existence — pairing with Tunnel removes public DNS/IP exposure entirely."],
    learnMoreSlug: "zero-trust",
  },
  tunnel: {
    slug: "tunnel",
    label: "Cloudflare Tunnel",
    category: "zerotrust",
    whereItSits: "Between Cloudflare's edge and a private origin network — an outbound-only connector (cloudflared).",
    sees: "Proxied traffic destined for the Tunnel's configured hostname/ingress rules.",
    protects: "Removes the need for any inbound-open port on the origin network entirely.",
    doesNotProtect: "Does not add authentication by itself — pair with Access for identity-based policy.",
    configuredBy: "cloudflared connector configuration and Tunnel routes/ingress rules.",
    logs: "cloudflared connector logs; Tunnel status in the dashboard.",
    commonMistakes: ["Running a single connector replica with no redundancy in production."],
    learnMoreSlug: "tunnel",
  },
  "origin-aws": {
    slug: "origin-aws",
    label: "AWS Origin",
    category: "origin",
    whereItSits: "Behind Cloudflare, typically an ALB fronting EC2/ECS/EKS.",
    sees: "Forwarded requests from Cloudflare's edge IP ranges.",
    protects: "N/A — protect it by restricting ALB security groups to Cloudflare's published IP ranges.",
    doesNotProtect: "An ALB with a security group open to 0.0.0.0/0 can be reached directly, bypassing Cloudflare.",
    configuredBy: "AWS security groups, ALB listener/certificate configuration.",
    logs: "ALB access logs, CloudWatch, VPC Flow Logs.",
    commonMistakes: ["Leaving the ALB security group open to the internet instead of scoping to Cloudflare IP ranges."],
  },
  "origin-azure": {
    slug: "origin-azure",
    label: "Azure Origin",
    category: "origin",
    whereItSits: "Behind Cloudflare, typically an Application Gateway fronting App Service/AKS/VMs.",
    sees: "Forwarded requests from Cloudflare's edge IP ranges.",
    protects: "N/A — protect it by restricting NSG rules to Cloudflare's published IP ranges.",
    doesNotProtect: "An Application Gateway with an open NSG can be reached directly, bypassing Cloudflare.",
    configuredBy: "Azure NSG rules, Application Gateway listener/certificate configuration.",
    logs: "Application Gateway diagnostic logs, Azure Monitor.",
    commonMistakes: ["Running both Azure's WAF and Cloudflare's WAF with drifting, duplicated rule sets."],
  },
  "origin-k8s": {
    slug: "origin-k8s",
    label: "Kubernetes Origin",
    category: "origin",
    whereItSits: "Behind Cloudflare, typically an Ingress controller routing to Services and Pods.",
    sees: "Forwarded requests from Cloudflare's edge IP ranges, or via a Tunnel connector running in-cluster.",
    protects: "N/A — protect it by restricting the Ingress LoadBalancer to Cloudflare's IP ranges, or removing public exposure via Tunnel.",
    doesNotProtect: "A public LoadBalancer Service with no source IP restriction bypasses Cloudflare entirely.",
    configuredBy: "Ingress resource, Service type, NetworkPolicy, or a cloudflared Deployment for Tunnel-based access.",
    logs: "Ingress controller access logs, cluster-level observability stack.",
    commonMistakes: ["Exposing a NodePort/LoadBalancer Service directly without any source restriction."],
  },
  "origin-onprem": {
    slug: "origin-onprem",
    label: "On-Prem Origin",
    category: "origin",
    whereItSits: "Behind Cloudflare, either via a firewalled public IP or (recommended) a Cloudflare Tunnel connector.",
    sees: "Forwarded requests from Cloudflare's edge IP ranges, or via the outbound Tunnel connection.",
    protects: "N/A — Tunnel removes inbound exposure entirely; a firewalled public IP is the weaker alternative.",
    doesNotProtect: "A public IP with a stale or misconfigured firewall rule exposes the origin directly.",
    configuredBy: "On-prem firewall rules, or cloudflared connector configuration for Tunnel-based access.",
    logs: "On-prem firewall/server logs; cloudflared connector logs if using Tunnel.",
    commonMistakes: ["Relying solely on firewall rules that can drift out of sync with Cloudflare's published IP ranges, instead of migrating to Tunnel."],
  },
};

export function getNodeDetail(slug: string): ArchitectureNodeDetail | undefined {
  return NODE_DETAILS[slug];
}

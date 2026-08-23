import type { ScenarioContent } from "../types";

export const SCENARIOS: ScenarioContent[] = [
  {
    slug: "small-business-website",
    title: "Small business website",
    summary: "A marketing site on shared hosting, mostly static content, low traffic.",
    requirement:
      "The owner wants faster page loads, basic protection from spam bots, and doesn't want to manage certificates.",
    diagram: "User -> Cloudflare (Proxied, Full Strict, Auto Cache) -> Shared Hosting Origin",
    considerations: [
      "Proxied DNS for CDN caching and free Universal SSL — minimal ongoing management",
      "Bot Fight Mode (or Bot Management on higher plans) for basic automated-traffic filtering",
      "Cache Rules for static assets; HTML likely left dynamic unless the site is fully static",
      "No need for Load Balancing or Tunnel at this scale",
    ],
    recommended:
      "Proxied DNS, Full (Strict) SSL, default Managed Rules in Log-then-Block after a review period, basic Cache Rules, Bot Fight Mode enabled.",
  },
  {
    slug: "enterprise-saas",
    title: "Enterprise SaaS application",
    summary: "A multi-tenant web app with a public marketing site and an authenticated app subdomain.",
    requirement:
      "Needs strong bot/credential-stuffing protection on login, API rate limiting, WAF tuned to avoid false positives on complex JSON payloads, and SOC2-relevant logging.",
    diagram: "User -> Cloudflare (WAF + Bot Mgmt + Rate Limiting) -> app.example.com -> Origin (multi-region)",
    considerations: [
      "Separate Custom Rules/rate limits for the login and password-reset endpoints",
      "Bot Management to catch credential stuffing beyond simple rate limiting",
      "API schema validation on the JSON API surface to reduce WAF false positives",
      "Logpush to a SIEM for retention and audit requirements",
      "Load Balancing across regions for availability",
    ],
    recommended:
      "Full (Strict) SSL, Managed + Custom Rules with schema-aware API protection, targeted rate limiting on auth endpoints, Bot Management, Logpush to SIEM, multi-region Load Balancing.",
  },
  {
    slug: "public-api",
    title: "Public API",
    summary: "A versioned REST/GraphQL API consumed by third-party developers.",
    requirement: "Needs per-API-key rate limiting, schema validation, and protection from scraping/abuse without blocking legitimate high-volume partners.",
    diagram: "Developer clients -> Cloudflare (Schema validation + per-key rate limiting) -> API Origin",
    considerations: [
      "Rate limiting keyed by API key/header rather than IP, for fairness across shared-IP clients",
      "API Shield-style schema validation instead of relying solely on generic WAF signatures",
      "API discovery to catch undocumented/zombie endpoints",
      "Custom Rules to allowlist known high-volume, trusted partners",
    ],
    recommended: "Per-key rate limiting, schema validation as the primary control, Managed Rules as a backstop, allowlisted trusted partners via Custom Rules.",
  },
  {
    slug: "ecommerce-platform",
    title: "E-commerce platform",
    summary: "Public storefront with checkout, inventory, and seasonal traffic spikes.",
    requirement: "Needs to survive flash-sale traffic spikes, stop inventory-scraping/hoarding bots, and keep checkout fast and reliable.",
    diagram: "User -> Cloudflare (CDN + Bot Mgmt + Rate Limiting) -> Origin (checkout + catalog services)",
    considerations: [
      "Aggressive caching on catalog/product pages, bypass on cart/checkout",
      "Bot Management to detect scraping/hoarding bots hitting product and cart-add endpoints",
      "Rate limiting on checkout and cart APIs to prevent abuse without blocking real shoppers",
      "Load Balancing/failover for availability during peak sales",
    ],
    recommended: "Cache Rules tuned per path (cache catalog, bypass checkout), Bot Management, rate limiting on cart/checkout, Load Balancing with health checks.",
  },
  {
    slug: "banking-application",
    title: "Banking application",
    summary: "A regulated financial services application with strict compliance requirements.",
    requirement: "Requires end-to-end encryption, strict WAF posture, detailed audit logging, and often Zero Trust for internal admin tooling.",
    diagram: "User -> Cloudflare (Full Strict + strict WAF) -> Origin | Internal admin -> Access + Tunnel -> Internal tools",
    considerations: [
      "Full (Strict) SSL only — Flexible/Full are not appropriate for sensitive data in transit",
      "Managed Rules in Block mode with minimal, carefully justified exceptions",
      "Comprehensive Logpush to a SIEM for compliance/audit trails",
      "Internal admin interfaces moved behind Access + Tunnel rather than public DNS",
    ],
    recommended: "Full (Strict) SSL, strict Managed + Custom Rules, comprehensive Logpush, Zero Trust (Access + Tunnel) for all internal/admin surfaces.",
  },
  {
    slug: "aws-hosted-application",
    title: "AWS-hosted application",
    summary: "A workload behind an AWS ALB, on EC2/ECS/EKS.",
    requirement: "Wants Cloudflare's edge security/CDN in front of AWS without duplicating controls already provided by AWS-native tools.",
    diagram: "Internet -> Cloudflare -> AWS ALB -> EC2 / ECS / EKS",
    considerations: [
      "Cloudflare terminates public TLS and applies WAF/Bot/DDoS before traffic ever reaches AWS",
      "ALB security groups restricted to Cloudflare's published IP ranges to prevent bypass",
      "Decide ownership split: Cloudflare WAF vs AWS WAF — avoid maintaining duplicate, drifting rule sets",
    ],
    recommended: "Proxied DNS to the ALB, Full (Strict) SSL with an ACM or Cloudflare Origin CA cert on the ALB, security group locked to Cloudflare IP ranges, single source of truth for WAF policy.",
  },
  {
    slug: "azure-hosted-application",
    title: "Azure-hosted application",
    summary: "A workload behind Azure Application Gateway, on App Service/AKS/VMs.",
    requirement: "Same goal as the AWS case — front an Azure workload with Cloudflare's edge security and CDN.",
    diagram: "Internet -> Cloudflare -> Azure Application Gateway -> App Service / AKS / VM",
    considerations: [
      "NSG rules on the Application Gateway restricted to Cloudflare's IP ranges",
      "Decide whether Azure's own WAF (on App Gateway/Front Door) runs alongside or is disabled in favor of Cloudflare's",
      "Origin certificate on the Application Gateway matching Full (Strict) requirements",
    ],
    recommended: "Proxied DNS to the Application Gateway, Full (Strict) SSL, NSG locked to Cloudflare IP ranges, single WAF source of truth to avoid rule drift.",
  },
  {
    slug: "kubernetes-application",
    title: "Kubernetes application",
    summary: "A containerized app exposed via an Ingress controller.",
    requirement: "Wants edge security/CDN in front of the cluster and, for internal-only services, no public ingress at all.",
    diagram: "Internet -> Cloudflare -> WAF -> Ingress Controller -> Kubernetes Service -> Pods",
    considerations: [
      "Public services: Cloudflare proxied in front of the Ingress LoadBalancer/NodePort",
      "Internal-only services: Cloudflare Tunnel connector running as a cluster deployment, removing any public-facing Ingress entirely",
      "Ingress/Service should trust Cloudflare's headers for real client IP if the app does IP-based logic",
    ],
    recommended: "Proxied DNS to the Ingress for public services; cloudflared Tunnel deployment + Access for internal-only services, avoiding public LoadBalancer exposure altogether.",
  },
  {
    slug: "hybrid-datacenter",
    title: "Hybrid datacenter",
    summary: "A mix of on-prem and cloud infrastructure serving the same application or organization.",
    requirement: "Consistent security policy and a single edge regardless of which backend actually serves a given request.",
    diagram: "Internet -> Cloudflare -> Load Balancing -> [On-Prem Pool | Cloud Pool]",
    considerations: [
      "Load Balancing pools spanning on-prem and cloud origins, with health checks driving failover",
      "Tunnel for any on-prem origin that shouldn't have a publicly routable IP",
      "Consistent WAF/Bot/Rate Limiting policy applied once at the edge, regardless of which pool serves the request",
    ],
    recommended: "Cloudflare Load Balancing across on-prem and cloud pools, Tunnel for on-prem connectivity where inbound exposure should be eliminated, single edge policy layer.",
  },
  {
    slug: "internal-employee-application",
    title: "Internal employee application",
    summary: "An internal tool (e.g. an admin dashboard) that should never be reachable by the public internet.",
    requirement: "Employees need access from anywhere without a traditional VPN; the app must never be publicly discoverable.",
    diagram: "Employee -> Identity Provider -> Device Posture -> Cloudflare Access -> Tunnel -> Internal App",
    considerations: [
      "No public DNS record for the app at all — reachable only through the Zero Trust path",
      "Access policy scoped to the specific identity group/device posture required",
      "Tunnel eliminates the need for any inbound firewall rule on the internal network",
    ],
    recommended: "Cloudflare Tunnel + Access, identity-provider-backed policy, no public proxied DNS record for the application.",
  },
  {
    slug: "bot-attack",
    title: "Public website under bot attack",
    summary: "A public site suddenly seeing a large volume of automated traffic hitting specific endpoints.",
    requirement: "Distinguish and mitigate the automated traffic without blocking real users, and understand root cause before over-reacting.",
    diagram: "Attack traffic + real users -> Cloudflare (Bot Mgmt + Rate Limiting + WAF) -> Origin",
    considerations: [
      "Check Bot Analytics for score distribution before choosing an action",
      "Prefer Managed/JS Challenge over outright Block for borderline traffic to limit false positives",
      "Add targeted rate limiting on the specific hit endpoints rather than a blanket site-wide rule",
      "Investigate whether this is credential stuffing, scraping, or an L7 DDoS pattern — the right response differs",
    ],
    recommended: "Bot Management with graduated response (Challenge before Block), endpoint-specific rate limiting, root-cause investigation via Security Events before broad blocking.",
  },
];

export function getScenario(slug: string): ScenarioContent | undefined {
  return SCENARIOS.find((s) => s.slug === slug);
}

export interface FlowNode {
  id: string;
  label: string;
  detailSlug?: string; // key into NODE_DETAILS
  x: number;
  y: number;
  variant?: "default" | "brand" | "muted";
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface DeploymentModel {
  id: string;
  letter: string;
  title: string;
  summary: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  dnsFlow: string;
  tlsFlow: string;
  httpFlow: string;
  inspectionPoints: string[];
  sourceIp: string;
  headers: string;
  originExposure: string;
  failurePoints: string[];
}

export const DEPLOYMENT_MODELS: DeploymentModel[] = [
  {
    id: "standard-proxied",
    letter: "A",
    title: "Standard proxied application",
    summary: "The default, recommended pattern: DNS proxied through Cloudflare, full security stack applied, origin hidden behind the edge.",
    nodes: [
      { id: "user", label: "User", x: 0, y: 0 },
      { id: "dns", label: "Cloudflare DNS", detailSlug: "dns", x: 0, y: 100 },
      { id: "edge", label: "Cloudflare Edge\n(WAF · CDN · TLS · Bot Mgmt)", detailSlug: "waf", x: 0, y: 220, variant: "brand" },
      { id: "origin", label: "Origin", detailSlug: "origin", x: 0, y: 360 },
    ],
    edges: [
      { id: "e1", source: "user", target: "dns" },
      { id: "e2", source: "dns", target: "edge" },
      { id: "e3", source: "edge", target: "origin" },
    ],
    dnsFlow: "User's resolver queries Cloudflare's authoritative nameservers, which return Cloudflare's anycast edge IPs (proxied record).",
    tlsFlow: "Browser negotiates TLS with Cloudflare's edge certificate. A second, independent TLS (or plain HTTP, depending on mode) connection runs from edge to origin.",
    httpFlow: "Full HTTP request passes through Cloudflare's fixed security phase order (Custom Rules -> Rate Limiting -> Managed Rules -> Bot Fight Mode) before being served from cache or forwarded to origin.",
    inspectionPoints: ["TLS termination", "WAF Custom Rules", "Rate Limiting", "WAF Managed Rules", "Bot Fight Mode", "Cache eligibility check"],
    sourceIp: "Origin sees Cloudflare's IP as the TCP source; real client IP is in CF-Connecting-IP.",
    headers: "CF-Connecting-IP, CF-Ray, CF-IPCountry, X-Forwarded-For added by Cloudflare.",
    originExposure: "Origin IP is not returned in DNS answers, but must still be firewalled to Cloudflare's IP ranges to prevent direct-access bypass.",
    failurePoints: ["Origin firewall too permissive", "Origin not trusting CF-Connecting-IP", "SSL/TLS mode misconfigured for the origin's actual cert"],
  },
  {
    id: "dns-only",
    letter: "B",
    title: "DNS-only",
    summary: "Cloudflare answers DNS queries but is not in the request path at all — no security, caching, or edge TLS applies.",
    nodes: [
      { id: "user", label: "User", x: 0, y: 0 },
      { id: "dns", label: "DNS (Cloudflare, not proxied)", detailSlug: "dns", x: 0, y: 120 },
      { id: "origin", label: "Origin", detailSlug: "origin", x: 0, y: 260 },
    ],
    edges: [
      { id: "e1", source: "user", target: "dns" },
      { id: "e2", source: "dns", target: "origin", label: "direct connection" },
    ],
    dnsFlow: "Cloudflare answers with the origin's real IP address — exactly like any other DNS host.",
    tlsFlow: "TLS (if any) is negotiated directly between the browser and the origin, using the origin's own certificate.",
    httpFlow: "The full HTTP request goes straight to the origin. Cloudflare never sees it.",
    inspectionPoints: ["None — no Cloudflare product in the request path"],
    sourceIp: "Origin sees the visitor's real IP directly; no header manipulation involved.",
    headers: "No Cloudflare headers are added.",
    originExposure: "Origin IP is fully exposed via the DNS answer itself.",
    failurePoints: ["Assuming WAF/Bot Management/DDoS protection applies when it doesn't", "Origin's own TLS/security posture is the only protection"],
  },
  {
    id: "tunnel",
    letter: "C",
    title: "Cloudflare Tunnel",
    summary: "No inbound port on the origin at all — cloudflared makes an outbound connection that carries traffic back in.",
    nodes: [
      { id: "user", label: "User", x: 0, y: 0 },
      { id: "cf", label: "Cloudflare Edge", detailSlug: "waf", x: 0, y: 110, variant: "brand" },
      { id: "tunnel", label: "Cloudflare Tunnel", detailSlug: "tunnel", x: 0, y: 230 },
      { id: "connector", label: "cloudflared connector", x: 0, y: 340 },
      { id: "origin", label: "Private Origin", detailSlug: "origin", x: 0, y: 450 },
    ],
    edges: [
      { id: "e1", source: "user", target: "cf" },
      { id: "e2", source: "cf", target: "tunnel" },
      { id: "e3", source: "tunnel", target: "connector", label: "outbound-initiated" },
      { id: "e4", source: "connector", target: "origin" },
    ],
    dnsFlow: "DNS resolves to Cloudflare's edge IPs, routing to the Tunnel by hostname — no public IP for the origin exists at all.",
    tlsFlow: "Browser-to-edge TLS as usual. Edge-to-connector traffic runs over the Tunnel's own encrypted, outbound-initiated connection.",
    httpFlow: "WAF/Bot Management/etc. apply at the edge exactly as in the standard model, then the request rides the existing Tunnel connection down to cloudflared, which forwards it locally.",
    inspectionPoints: ["Full edge security stack, same as standard proxied", "Optionally: Access policy in front of the Tunnel hostname"],
    sourceIp: "Same CF-Connecting-IP mechanism as standard proxying.",
    headers: "Standard Cloudflare headers, unchanged by Tunnel.",
    originExposure: "No inbound port exists on the origin network — nothing to scan or discover from the outside.",
    failurePoints: ["cloudflared process stopped", "No redundant connector replica", "Local ingress config pointing at the wrong address/port"],
  },
  {
    id: "aws",
    letter: "D",
    title: "AWS-hosted application",
    summary: "Cloudflare in front of an AWS ALB, fronting EC2, ECS, or EKS compute.",
    nodes: [
      { id: "user", label: "Internet", x: 0, y: 0 },
      { id: "cf", label: "Cloudflare", detailSlug: "waf", x: 0, y: 110, variant: "brand" },
      { id: "alb", label: "AWS ALB", x: 0, y: 230 },
      { id: "compute", label: "EC2 / ECS / EKS", detailSlug: "origin-aws", x: 0, y: 350 },
    ],
    edges: [
      { id: "e1", source: "user", target: "cf" },
      { id: "e2", source: "cf", target: "alb" },
      { id: "e3", source: "alb", target: "compute" },
    ],
    dnsFlow: "CNAME/A record proxied through Cloudflare, pointing at the ALB's DNS name or a static IP set.",
    tlsFlow: "Full (Strict) recommended: ACM or Origin CA certificate on the ALB listener, validated by Cloudflare.",
    httpFlow: "WAF/Bot Management/Rate Limiting apply at Cloudflare's edge before the ALB ever sees traffic.",
    inspectionPoints: ["Cloudflare edge stack", "ALB listener rules", "Optionally AWS WAF on the ALB (decide single source of truth)"],
    sourceIp: "ALB access logs will show Cloudflare's IP unless X-Forwarded-For is used to recover the real client IP.",
    headers: "Standard Cloudflare headers; ALB adds its own X-Forwarded-For entry in the chain.",
    originExposure: "ALB security group must be restricted to Cloudflare's published IP ranges to prevent direct-access bypass.",
    failurePoints: ["ALB security group open to 0.0.0.0/0", "Duplicated/conflicting WAF rules between Cloudflare and AWS WAF"],
  },
  {
    id: "azure",
    letter: "E",
    title: "Azure-hosted application",
    summary: "Cloudflare in front of Azure Application Gateway, fronting App Service, AKS, or VMs.",
    nodes: [
      { id: "user", label: "Internet", x: 0, y: 0 },
      { id: "cf", label: "Cloudflare", detailSlug: "waf", x: 0, y: 110, variant: "brand" },
      { id: "agw", label: "Application Gateway", x: 0, y: 230 },
      { id: "compute", label: "App Service / AKS / VM", detailSlug: "origin-azure", x: 0, y: 350 },
    ],
    edges: [
      { id: "e1", source: "user", target: "cf" },
      { id: "e2", source: "cf", target: "agw" },
      { id: "e3", source: "agw", target: "compute" },
    ],
    dnsFlow: "Proxied record pointing at the Application Gateway's public IP or FQDN.",
    tlsFlow: "Full (Strict) recommended: a valid certificate on the Application Gateway listener, validated by Cloudflare.",
    httpFlow: "Edge security stack applies before traffic reaches the Application Gateway.",
    inspectionPoints: ["Cloudflare edge stack", "Application Gateway routing rules", "Optionally Azure/Front Door WAF (decide single source of truth)"],
    sourceIp: "Application Gateway logs show Cloudflare's IP as source unless forwarded headers are used.",
    headers: "Standard Cloudflare headers passed through to the Application Gateway and beyond.",
    originExposure: "NSG rules on the Application Gateway must be restricted to Cloudflare's published IP ranges.",
    failurePoints: ["NSG open to the internet", "Certificate mismatch between Cloudflare's expectation and the Application Gateway's listener"],
  },
  {
    id: "kubernetes",
    letter: "F",
    title: "Kubernetes application",
    summary: "Cloudflare in front of a cluster's Ingress controller, or via Tunnel for fully private services.",
    nodes: [
      { id: "user", label: "Internet", x: 0, y: 0 },
      { id: "cf", label: "Cloudflare", detailSlug: "waf", x: 0, y: 110, variant: "brand" },
      { id: "ingress", label: "Ingress Controller", x: 0, y: 230 },
      { id: "svc", label: "Kubernetes Service", x: 0, y: 340 },
      { id: "pods", label: "Pods", detailSlug: "origin-k8s", x: 0, y: 450 },
    ],
    edges: [
      { id: "e1", source: "user", target: "cf" },
      { id: "e2", source: "cf", target: "ingress" },
      { id: "e3", source: "ingress", target: "svc" },
      { id: "e4", source: "svc", target: "pods" },
    ],
    dnsFlow: "Proxied record pointing at the Ingress controller's LoadBalancer IP, or a Tunnel hostname if the service is fully private.",
    tlsFlow: "Full (Strict) recommended, with a certificate on the Ingress resource (e.g. via cert-manager) validated by Cloudflare.",
    httpFlow: "Edge stack applies before the Ingress controller routes to the correct Service and Pods.",
    inspectionPoints: ["Cloudflare edge stack", "Ingress routing/annotations", "NetworkPolicy at the cluster level"],
    sourceIp: "Ingress access logs show Cloudflare's IP unless X-Forwarded-For / real-IP annotations are configured.",
    headers: "Standard Cloudflare headers; the Ingress controller typically has its own real-IP configuration to propagate them.",
    originExposure: "A public LoadBalancer/NodePort Service without source restriction bypasses Cloudflare — restrict to Cloudflare IP ranges, or use Tunnel for no public exposure at all.",
    failurePoints: ["Public Service with no source IP restriction", "Missing real-IP annotation causing origin IP-based logic to break"],
  },
];

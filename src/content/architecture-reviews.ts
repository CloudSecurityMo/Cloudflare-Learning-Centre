export interface ReviewConcern {
  id: string;
  text: string;
  valid: boolean;
  explanation: string;
}

export interface ArchitectureReview {
  id: string;
  title: string;
  diagram: string;
  context: string;
  concerns: ReviewConcern[];
}

export const ARCHITECTURE_REVIEWS: ArchitectureReview[] = [
  {
    id: "aws-alb",
    title: "AWS-hosted application behind Cloudflare",
    diagram: "Internet\n   |\nCloudflare\n   |\nAWS ALB\n   |\nEC2",
    context:
      "A team has put Cloudflare in front of an AWS Application Load Balancer fronting a fleet of EC2 instances. No further detail is given about firewall rules, TLS mode, or WAF configuration — that's exactly what needs reviewing.",
    concerns: [
      {
        id: "sg-open",
        text: "The ALB's security group might allow inbound traffic from 0.0.0.0/0 instead of only Cloudflare's published IP ranges",
        valid: true,
        explanation: "If true, anyone who discovers the ALB's DNS name or IP can bypass Cloudflare entirely — WAF, Bot Management, Rate Limiting, and DDoS mitigation all become irrelevant for that traffic.",
      },
      {
        id: "tls-mode-unclear",
        text: "The SSL/TLS mode isn't specified — if it's Flexible, the Cloudflare-to-ALB leg is unencrypted",
        valid: true,
        explanation: "Flexible mode leaves the second leg as plain HTTP. For anything beyond a static site, Full (Strict) with a validated origin certificate on the ALB listener is the appropriate baseline.",
      },
      {
        id: "waf-unclear",
        text: "It's not stated whether WAF Managed Rules are actually enabled on this zone",
        valid: true,
        explanation: "Cloudflare being 'in front of' a workload doesn't mean WAF is configured — proxying alone doesn't add any rule enforcement. This needs explicit verification, not assumption.",
      },
      {
        id: "duplicate-waf",
        text: "Running both Cloudflare WAF and AWS WAF on the ALB without a clear single source of truth risks rule drift between the two",
        valid: true,
        explanation: "This is a real, common operational risk: two independently-maintained rule sets covering the same traffic tend to diverge over time, creating gaps or redundant maintenance burden.",
      },
      {
        id: "alb-vs-nlb",
        text: "An Application Load Balancer (ALB) was used instead of a Network Load Balancer (NLB)",
        valid: false,
        explanation: "This isn't a concern — ALB is the correct choice for HTTP(S) traffic (L7 routing, host/path-based rules). NLB is for raw TCP/UDP at L4, which isn't what this architecture needs.",
      },
      {
        id: "no-cdn-mentioned",
        text: "The diagram doesn't explicitly show a CDN cache layer",
        valid: false,
        explanation: "Caching is a performance optimization, not a security or architectural correctness concern by itself — its absence isn't inherently a problem unless the workload specifically needs it, which isn't stated here.",
      },
    ],
  },
  {
    id: "dns-only-prod",
    title: "Production site with a DNS-only record",
    diagram: "Internet\n   |\nDNS (Cloudflare, NOT proxied)\n   |\nOrigin",
    context:
      "A production application's DNS record in Cloudflare is set to DNS-only (grey cloud). The team believes they have 'Cloudflare protection' because the domain uses Cloudflare nameservers.",
    concerns: [
      {
        id: "no-waf-bot-ddos",
        text: "WAF, Bot Management, Rate Limiting, and DDoS mitigation are all inactive for this hostname",
        valid: true,
        explanation: "These products only ever see proxied traffic. A DNS-only record means Cloudflare is acting purely as a DNS host — none of the security products apply, regardless of what's configured at the account level.",
      },
      {
        id: "origin-ip-public",
        text: "The origin's real IP is directly exposed in the DNS answer",
        valid: true,
        explanation: "Anyone can query the record and get the origin IP directly — there's no IP-hiding benefit at all with DNS-only.",
      },
      {
        id: "misplaced-confidence",
        text: "The team's belief that 'using Cloudflare nameservers' means they're protected is the root problem, not a technical misconfiguration",
        valid: true,
        explanation: "This is the most important finding: 'Cloudflare is my DNS provider' and 'Cloudflare is protecting my traffic' are different claims. The fix isn't just flipping the toggle — it's correcting the mental model that led here.",
      },
      {
        id: "dnssec-missing",
        text: "DNSSEC isn't mentioned as enabled",
        valid: false,
        explanation: "DNSSEC protects the integrity of DNS responses — it's a real, separate consideration, but it's not what's causing this architecture's actual exposure, and enabling it wouldn't change the fact that Cloudflare isn't inspecting this traffic.",
      },
      {
        id: "nameserver-count",
        text: "Only using Cloudflare's default two nameservers instead of more",
        valid: false,
        explanation: "This isn't a real concern — Cloudflare's standard delegation model uses two assigned nameservers, and that's expected, not a gap.",
      },
    ],
  },
];

import type { TopicContent } from "../types";

export const fundamentals: TopicContent = {
  slug: "fundamentals",
  category: "learn",
  title: "Cloudflare Fundamentals",
  shortTitle: "Fundamentals",
  description:
    "What Cloudflare actually is — and the critical distinction between Cloudflare as a DNS provider, a reverse proxy, and an application security layer.",
  difficulty: "Beginner",
  minutes: 12,
  objectives: [
    "Describe Cloudflare as a global anycast network, not a single server",
    "Separate Cloudflare's four roles: DNS host, reverse proxy, CDN/security edge, Zero Trust platform",
    "Explain why 'orange-clouding' a DNS record is the switch that turns DNS hosting into a reverse proxy",
    "Identify which Cloudflare capabilities require proxying and which work regardless of proxy status",
  ],
  concepts: [
    {
      heading: "Cloudflare is a network, not a server",
      body: "Cloudflare operates an anycast network of data centers in 330+ cities. The same IP address (e.g. an anycast Cloudflare edge IP) is announced from every location; BGP routes each client to the nearest healthy data center. This is why Cloudflare can absorb volumetric attacks and terminate TLS close to the visitor — there is no single choke point.",
    },
    {
      heading: "Four roles, one platform",
      body: "It helps to mentally separate what Cloudflare is doing at any given layer:\n\n1. Authoritative DNS host — answers queries for your zone's records.\n2. Reverse proxy / CDN — sits between the visitor and your origin, terminating TLS, caching, and inspecting HTTP traffic (only for proxied records).\n3. Application security layer — WAF, Bot Management, DDoS mitigation, rate limiting (only sees traffic that is proxied).\n4. Zero Trust platform — Access, Gateway, WARP, Tunnel — a separate product surface for controlling access to internal apps and outbound traffic, largely independent of your public DNS zone.",
      diagram:
        "                 +-----------------------------+\n" +
        "                 |         CLOUDFLARE           |\n" +
        "                 |                               |\n" +
        "  DNS queries -->|  1. Authoritative DNS         |\n" +
        "  HTTP(S) ------>|  2. Reverse Proxy / CDN       |\n" +
        "                 |  3. WAF / Bot Mgmt / DDoS     |\n" +
        "  Private apps ->|  4. Zero Trust (Access/GW)    |\n" +
        "                 +-----------------------------+",
    },
    {
      heading: "The critical distinction: DNS vs reverse proxy",
      body: "Every DNS record in a Cloudflare zone can be 'DNS only' (grey cloud) or 'Proxied' (orange cloud). DNS-only means Cloudflare answers the DNS query with your origin's real IP and does nothing else — the visitor connects directly to your origin. Proxied means Cloudflare answers with its own anycast IP, terminates the connection, and only then decides whether to forward it to your origin. This single toggle is the boundary between 'Cloudflare knows your domain exists' and 'Cloudflare is in the request path.' See the DNS module for the full walkthrough.",
    },
    {
      heading: "Why this distinction matters for security",
      body: "WAF, Bot Management, rate limiting rules, and the CDN cache only ever see traffic for proxied (orange-cloud) hostnames. A record left DNS-only is invisible to those controls — traffic goes straight to the origin. This is one of the most common real-world misconfigurations: teams enable WAF rules at the account level and assume every hostname is protected, without checking that each relevant DNS record is actually proxied.",
    },
    {
      heading: "What happens when you type https://example.com (conceptual model)",
      body: "This ties the whole networking stack together — most of these steps are general web/networking behavior, not Cloudflare-specific:\n\n1. Browser checks its DNS cache; if empty, it asks a recursive resolver for example.com's A/AAAA record.\n2. The resolver walks the DNS hierarchy (root -> .com TLD -> Cloudflare's authoritative nameservers) and returns an IP — Cloudflare's anycast edge IP if proxied, the origin's IP if DNS-only.\n3. The browser opens a TCP (or QUIC, for HTTP/3) connection to that IP. Anycast routing (BGP) sends it to the nearest healthy Cloudflare data center.\n4. A TLS handshake follows: the browser and edge negotiate a protocol version and cipher suite, and ALPN during that handshake indicates whether HTTP/1.1, HTTP/2, or HTTP/3 will be used; SNI tells the edge which hostname's certificate to present, since many hostnames can share one IP.\n5. Once TLS is established, the browser sends the HTTP request. If proxied, this is where Cloudflare-specific processing happens: DDoS checks, Custom Rules, Rate Limiting, Managed Rules, Bot Fight Mode, then a cache lookup.\n6. On a cache MISS, Cloudflare opens its own connection to the origin (a separate TLS handshake, per the SSL/TLS mode) and forwards the request.\n7. The origin's response travels back through Cloudflare (optionally cached for next time) and down to the browser, which renders it.",
      diagram:
        "Browser -> DNS -> IP -> TCP/QUIC -> TLS (SNI + ALPN) -> HTTP request\n" +
        "                                                          |\n" +
        "                                          (if proxied) Cloudflare security + cache\n" +
        "                                                          |\n" +
        "                                                        Origin -> Response -> Browser",
    },
  ],
  examples: [
    {
      title: "Same zone, two records, two realities",
      body: "www.example.com (proxied) gets CDN caching, WAF inspection, and a Cloudflare-issued edge certificate. ftp.example.com (DNS only) in the same zone gets none of that — Cloudflare is purely acting as an authoritative DNS host for it, exactly like any other DNS provider.",
    },
  ],
  commonMistakes: [
    "Assuming account-wide WAF/Bot rules protect every hostname — they only apply to proxied records.",
    "Confusing 'using Cloudflare for DNS' with 'traffic goes through Cloudflare' — they are independent unless the record is proxied.",
    "Not realizing Zero Trust products (Access, Gateway, Tunnel) can be used with zero public DNS records proxied at all.",
  ],
  quiz: [
    {
      id: "fund-1",
      question:
        "A DNS record is set to 'DNS only' (grey cloud). Which of the following will inspect HTTP requests to that hostname?",
      options: [
        "Cloudflare WAF managed rules",
        "Cloudflare Bot Management",
        "Cloudflare rate limiting rules",
        "None of the above — Cloudflare is not in the request path",
      ],
      correctIndex: 3,
      explanation:
        "DNS-only records are answered with the origin's real IP. The browser connects directly to the origin, so no Cloudflare HTTP-layer product (WAF, Bot Management, rate limiting, cache) ever sees the request.",
    },
    {
      id: "fund-2",
      question: "Which statement best describes Cloudflare's network architecture?",
      options: [
        "A single large data center with high bandwidth",
        "An anycast network where the same IP is announced from many locations and BGP routes clients to the nearest one",
        "A DNS-only service with no data plane",
        "A set of regional load balancers behind one origin",
      ],
      correctIndex: 1,
      explanation:
        "Cloudflare's edge uses anycast: the same IP is advertised from hundreds of cities, and internet routing (BGP) naturally sends each client to a nearby data center.",
    },
  ],
  relatedTopics: ["dns", "proxying", "waf"],
  mentalModelSlugs: ["dns-vs-proxy"],
  architectHref: "/labs/architecture-designer",
  lastVerified: "2026-08-23",
  officialSources: [
    { title: "How Cloudflare works", url: "https://developers.cloudflare.com/fundamentals/concepts/how-cloudflare-works/", sourceType: "cloudflare-documentation" },
    { title: "Accounts and zones", url: "https://developers.cloudflare.com/fundamentals/concepts/accounts-and-zones/", sourceType: "cloudflare-documentation" },
  ],
};

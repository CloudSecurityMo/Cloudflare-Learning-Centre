import type { TopicContent } from "../types";

export const proxying: TopicContent = {
  slug: "proxying",
  category: "learn",
  title: "Proxying & Reverse Proxy Architecture",
  description:
    "How orange-cloud proxying actually works: connection termination, header injection, origin IP exposure, and what a reverse proxy sees versus what it doesn't.",
  difficulty: "Intermediate",
  minutes: 15,
  objectives: [
    "Explain the two-connection model of a reverse proxy",
    "List the headers Cloudflare adds so origins can recover the real client IP",
    "Identify what a proxy sees at L3/L4 vs L7",
    "Explain why origin IP exposure remains a risk even when proxied",
  ],
  concepts: [
    {
      heading: "Two connections, not one",
      body: "When a hostname is proxied, the browser never talks to your origin directly. There are two independent connections: Browser <-> Cloudflare edge, and Cloudflare edge <-> your origin. Cloudflare terminates TLS on the first connection, inspects/processes the HTTP request, and then makes its own request to your origin (over a connection it manages, potentially reusing keep-alive connections from its pool). This is exactly what a reverse proxy is: a server-side intermediary the client doesn't know exists.",
    },
    {
      heading: "What the origin sees vs what the client sent",
      body: "Because Cloudflare originates the second connection, your origin's access logs will show Cloudflare's IP as the source IP by default, not the visitor's. Cloudflare adds headers so the origin can recover the real client details:\n\nCF-Connecting-IP — the visitor's real IP address.\nX-Forwarded-For — standard proxy chain header, includes CF-Connecting-IP.\nCF-IPCountry — the visitor's country as detected by Cloudflare's geolocation.\nCF-Ray — a unique ID for the request, essential for correlating with Cloudflare support/logs.\nCF-Visitor — indicates the scheme (http/https) the visitor used to Cloudflare.\n\nOrigin web servers/load balancers must be configured to trust and use these headers (e.g. via mod_remoteip / real_ip modules) — otherwise every log line and IP-based control at the origin will be wrong.",
    },
    {
      heading: "What a reverse proxy can and can't see",
      body: "For proxied HTTP(S) traffic, Cloudflare has full L7 visibility: method, path, headers, query string, cookies, and (if not encrypted at the app layer) body. This is what lets WAF, Bot Management, and cache rules operate on request content. What Cloudflare's core proxy does NOT natively see is non-HTTP(S) TCP/UDP traffic (that requires the separate Spectrum product) or the application's internal logic/data layer beyond what's observable in the request/response.",
    },
    {
      heading: "Origin IP exposure is a separate problem from proxying",
      body: "Proxying hides your origin IP from the DNS response, but it does not guarantee the IP is unreachable. Common leak vectors: a DNS-only record for a subdomain on the same origin (e.g. direct.example.com pointing at the same server), historical DNS records indexed before you enabled Cloudflare, TLS certificates issued for the origin's real hostname (searchable via Certificate Transparency logs), email headers leaking the origin's mail server IP, or misconfigured origin servers responding to any Host header on port 80/443. Real origin protection requires firewalling the origin to only accept connections from Cloudflare's published IP ranges (or using Cloudflare Tunnel to remove inbound exposure entirely) — see the Origin Protection Lab.",
    },
    {
      heading: "Authenticated Origin Pulls",
      body: "IP-range firewalling has a gap: it trusts the source IP alone, and anyone who discovers a way to spoof or route through that range (or simply finds the IP before you lock the firewall down) can impersonate Cloudflare. Authenticated Origin Pulls closes this gap with mutual TLS — the origin is configured to require and validate a client certificate that only Cloudflare's edge presents, so the origin can cryptographically confirm a request actually came from Cloudflare rather than merely arriving from a Cloudflare-looking IP. It's a complement to IP allowlisting, not a replacement — the two address different failure modes (spoofed/rogue source vs. an IP range that becomes stale or is misconfigured).",
    },
  ],
  examples: [
    {
      title: "Origin log without real-IP handling",
      body: "203.0.113.44 - - [23/Aug/2026:10:04:12] \"GET /login HTTP/1.1\" 200 -\n\nThat 203.0.113.44 is a Cloudflare edge IP, not the visitor. Every request will appear to originate from Cloudflare's IP ranges unless CF-Connecting-IP is used to rewrite the log format.",
    },
  ],
  commonMistakes: [
    "Rate limiting or IP-blocking at the origin using the connecting IP without restoring the real client IP from CF-Connecting-IP first — every visitor looks like it's coming from Cloudflare.",
    "Leaving the origin's firewall open to 0.0.0.0/0 on port 443 — allowing anyone who discovers the origin IP to bypass Cloudflare entirely.",
    "Assuming 'proxied' means the origin IP is secret — it reduces exposure, it does not guarantee it.",
  ],
  troubleshooting: [
    {
      symptom: "Origin receives the wrong client IP",
      causes: [
        "Origin web server/app is reading the TCP source IP instead of CF-Connecting-IP / X-Forwarded-For",
        "A load balancer or intermediate proxy between Cloudflare and the origin is not forwarding/preserving the headers",
        "Application code hardcodes req.socket.remoteAddress instead of parsing forwarded headers",
      ],
      investigation: [
        "Curl the origin directly (bypassing Cloudflare) with a manual CF-Connecting-IP header and check what the app logs",
        "Check whether the web server has a 'real IP' / 'forwarded IP' module enabled and configured with Cloudflare's IP ranges as trusted",
        "Verify no intermediate proxy strips headers before they reach the app",
      ],
      remediation: [
        "Enable and configure the appropriate real-IP module (e.g. ngx_http_realip_module, mod_remoteip) with Cloudflare's published IP ranges as trusted",
        "Update application code to read X-Forwarded-For / CF-Connecting-IP when behind a known, trusted proxy",
      ],
    },
  ],
  quiz: [
    {
      id: "proxy-1",
      question: "Why does an origin server's access log show a Cloudflare IP instead of the visitor's IP by default?",
      options: [
        "Cloudflare anonymizes all visitor traffic by design and never reveals it",
        "The origin only ever sees the second connection (Cloudflare-to-origin); the visitor's real IP must be read from a header like CF-Connecting-IP",
        "This only happens when DNSSEC is enabled",
        "It's a bug in Cloudflare's proxy",
      ],
      correctIndex: 1,
      explanation:
        "A reverse proxy terminates the client connection and opens its own connection to the origin. The origin's TCP source IP is Cloudflare's; the real client IP is carried in application-layer headers.",
    },
    {
      id: "proxy-2",
      question: "Enabling the orange cloud on a DNS record guarantees the origin IP can never be discovered. True or false?",
      options: ["True", "False"],
      correctIndex: 1,
      explanation:
        "False. Proxying hides the IP from that specific DNS answer, but leaks are possible via other DNS-only records, historical DNS data, certificate transparency logs, or a misconfigured origin firewall that accepts traffic from anyone.",
    },
  ],
  relatedTopics: ["dns", "fundamentals", "ssl-tls"],
  docs: [
    { label: "Cloudflare HTTP headers — Cloudflare Docs", url: "https://developers.cloudflare.com/fundamentals/reference/http-headers/" },
    { label: "Authenticated Origin Pulls — Cloudflare Docs", url: "https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/" },
    { label: "Protect your origin server — Cloudflare Docs", url: "https://developers.cloudflare.com/fundamentals/security/protect-your-origin-server/" },
  ],
};

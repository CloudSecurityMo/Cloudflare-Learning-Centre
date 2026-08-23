export interface Incident {
  id: string;
  title: string;
  symptom: string;
  architecture: string;
  evidence: string[];
  likelyCauses: string[];
  investigation: string[];
  remediation: string[];
  explanation: string;
}

export const INCIDENTS: Incident[] = [
  {
    id: "522",
    title: "Website returns 522",
    symptom: "Visitors intermittently or consistently see 'Error 522: Connection timed out'.",
    architecture: "Browser -> Cloudflare Edge -> [TCP connect attempt] -> Origin",
    evidence: [
      "Ray ID present on the error page (confirms it's a Cloudflare-generated error, not an origin 5xx)",
      "Origin monitoring shows the server process running, but Cloudflare still can't connect",
      "Recent change to origin security groups/firewall rules",
    ],
    likelyCauses: [
      "Origin server is down, overloaded, or unresponsive at the TCP layer",
      "Origin firewall/security group no longer allows Cloudflare's published IP ranges",
      "Network routing issue between Cloudflare's edge and the origin's network",
    ],
    investigation: [
      "Check origin server health/CPU/process status directly",
      "Diff recent firewall/security-group changes against Cloudflare's current published IP ranges",
      "Attempt a direct TCP connection to the origin from an external host to isolate edge-vs-origin",
    ],
    remediation: [
      "Restore origin availability if it's down",
      "Update firewall/security group rules to allow Cloudflare's IP ranges",
      "Consider Cloudflare Tunnel to remove the dependency on IP-based firewall allowlists entirely",
    ],
    explanation:
      "522 specifically means Cloudflare could not even establish a TCP connection to the origin within its timeout — it is never a Cloudflare-side outage on its own. The investigation should start at the origin's reachability, not Cloudflare's status.",
  },
  {
    id: "525",
    title: "Website returns 525",
    symptom: "Visitors see 'Error 525: SSL handshake failed'.",
    architecture: "Browser -> Cloudflare Edge -> [TLS handshake attempt] -> Origin",
    evidence: [
      "TCP connection to the origin succeeds, but TLS negotiation fails",
      "Origin web server logs show handshake/protocol errors around the same timestamps",
    ],
    likelyCauses: [
      "Origin doesn't support a TLS version or cipher suite Cloudflare requires",
      "SSL/TLS mode expects HTTPS on the origin but the origin is only listening on plain HTTP",
      "A misconfigured reverse proxy in front of the origin is terminating TLS incorrectly",
    ],
    investigation: [
      "Attempt a direct TLS handshake to the origin on port 443 from an external host and inspect the negotiated protocol/cipher (or the failure reason)",
      "Check the origin web server's TLS configuration for supported protocol versions",
      "Confirm the SSL/TLS mode setting matches what the origin actually serves",
    ],
    remediation: [
      "Update the origin's TLS configuration to support modern, mutually compatible protocols/ciphers",
      "Confirm the origin is actually serving HTTPS if Full or Full (Strict) mode is selected",
    ],
    explanation:
      "525 is specifically a handshake failure, distinct from 522 (can't even connect) and 526 (connected and handshook, but the certificate itself is untrusted/invalid). The three form a natural diagnostic ladder: connectivity -> handshake -> certificate validity.",
  },
  {
    id: "526",
    title: "Website returns 526",
    symptom: "Visitors see 'Error 526: Invalid SSL certificate'.",
    architecture: "Browser -> Cloudflare Edge -> [TLS handshake succeeds] -> Origin certificate fails validation",
    evidence: [
      "SSL/TLS mode is set to Full (Strict)",
      "Origin certificate is self-signed, expired, or missing intermediate certificates",
    ],
    likelyCauses: [
      "Origin certificate expired",
      "Self-signed certificate with no relationship to a CA Cloudflare trusts",
      "Certificate hostname doesn't match the SNI Cloudflare is connecting with",
      "Missing intermediate certificate in the served chain",
    ],
    investigation: [
      "Check certificate expiry and issuer directly against the origin",
      "Verify the certificate's subject/SAN matches the hostname used",
      "Test the full chain with an SSL diagnostic tool to catch a missing intermediate",
    ],
    remediation: [
      "Renew the certificate, or issue a free Cloudflare Origin CA certificate for the origin",
      "Serve the complete chain including intermediates",
      "Switch to Full (not Strict) only as a temporary diagnostic step, never as a long-term fix",
    ],
    explanation:
      "526 means the TLS handshake itself succeeded but Cloudflare, under Full (Strict) mode, refused to trust the certificate presented. This is a deliberate security control, not a bug — Full (Strict) exists precisely to prevent the edge from talking to an unverifiable origin.",
  },
  {
    id: "false-positive-403",
    title: "Legitimate users receive 403",
    symptom: "Real customers report being blocked while trying to use the site normally.",
    architecture: "Browser -> Cloudflare WAF (Managed/Custom Rules) -> Origin (never reached)",
    evidence: [
      "Block page shows a Ray ID",
      "Security Events log shows a matched Managed or Custom Rule for the exact request",
      "Pattern correlates with a recent ruleset update or new Custom Rule deployment",
    ],
    likelyCauses: [
      "A Managed Rule false-positived on legitimate content (e.g. a comment containing SQL-like keywords)",
      "A Custom Rule's condition is broader than intended",
      "A geo/IP-reputation rule caught a legitimate user on a flagged network (e.g. a corporate VPN or CGNAT range)",
    ],
    investigation: [
      "Get the Ray ID from the affected user and look it up directly in Security Events",
      "Identify exactly which field (path, header, body, query param) triggered the match",
      "Check whether the rule/ruleset was recently changed",
    ],
    remediation: [
      "Add a narrowly scoped Custom Rule exception (Skip) limited to the specific false-positive pattern",
      "Report persistent Managed Rule false positives to Cloudflare",
      "Avoid disabling the entire ruleset as a blunt fix",
    ],
    explanation:
      "This is the classic WAF tuning problem: the rule is functioning as designed (a pattern matched), but the request was benign. The fix is precision, not disabling protection — over-broad exceptions recreate the exposure the rule existed to close.",
  },
  {
    id: "origin-ip-exposed",
    title: "Origin IP is exposed",
    symptom: "Security review or an external scan reveals the real origin IP, despite the hostname being proxied.",
    architecture: "Browser -> [should be] Cloudflare Edge -> Origin, but origin is directly reachable",
    evidence: [
      "A DNS-only record (e.g. a staging or direct-access subdomain) resolves to the same IP as the proxied production hostname",
      "Certificate Transparency logs show a certificate issued for the origin's real hostname",
      "The origin's firewall accepts connections from any source IP, not just Cloudflare's ranges",
    ],
    likelyCauses: [
      "A forgotten DNS-only record pointing at the same origin server",
      "Historical DNS records indexed before Cloudflare was enabled",
      "Origin firewall never restricted to Cloudflare's published IP ranges",
      "Email headers or other out-of-band leaks revealing the mail/origin server IP",
    ],
    investigation: [
      "Audit every DNS record in the zone (and any historical DNS data) for anything pointing at the same origin IP with proxying disabled",
      "Search Certificate Transparency logs for certificates issued for the domain and its subdomains",
      "Check the origin firewall's current allowed source ranges",
    ],
    remediation: [
      "Proxy or remove any unnecessary direct-access DNS records",
      "Restrict the origin firewall to only Cloudflare's published IP ranges (or migrate to Cloudflare Tunnel to remove inbound exposure entirely)",
      "Rotate the origin IP if it has been meaningfully compromised/publicized",
    ],
    explanation:
      "Proxying a hostname only controls what that specific DNS answer reveals. Origin IP exposure is a broader operational-hygiene problem spanning every record in the zone, historical data outside your control, and firewall configuration — it requires deliberate origin hardening, not just enabling the orange cloud.",
  },
  {
    id: "dns-resolves-incorrectly",
    title: "Cloudflare DNS resolves incorrectly",
    symptom: "Users report the domain resolving to the wrong IP, an old site, or failing to resolve at all.",
    architecture: "Browser -> Recursive Resolver (cached/stale) -> [should be] Cloudflare Authoritative NS",
    evidence: [
      "Querying Cloudflare's authoritative nameservers directly returns the correct, current answer",
      "Querying a public resolver (1.1.1.1, 8.8.8.8) returns a different, stale answer",
      "The record was changed recently, within the previous TTL window",
    ],
    likelyCauses: [
      "A resolver is still serving a cached answer within its TTL",
      "NS delegation at the registrar still points to a previous DNS provider",
      "The record was edited on the wrong zone or with an unintended value",
    ],
    investigation: [
      "Compare the authoritative answer (queried directly against Cloudflare's nameservers) with what public resolvers currently return",
      "Verify the registrar's NS records match the nameservers Cloudflare assigned",
      "Check the record's TTL and how recently it changed",
    ],
    remediation: [
      "If delegation and record data are correct, wait out the previous TTL window",
      "Fix NS delegation at the registrar if it's still pointing elsewhere",
      "Lower TTL ahead of future planned changes to reduce staleness windows",
    ],
    explanation:
      "'DNS is wrong' almost always decomposes into one of two separate facts: either the authoritative answer itself is wrong (a configuration mistake), or the authoritative answer is right but a resolver is still serving a cached, stale value. Querying the authoritative nameservers directly is the fastest way to tell these apart.",
  },
  {
    id: "not-caching",
    title: "Application is not being cached",
    symptom: "Origin load stays high and cf-cache-status shows DYNAMIC/MISS even for content expected to be cached.",
    architecture: "Browser -> Cloudflare (cache eligibility check) -> Origin (every request)",
    evidence: [
      "cf-cache-status header on responses",
      "Origin response headers include Cache-Control: no-store/private or a Set-Cookie",
      "Content type is HTML with no Cache Rule configured",
    ],
    likelyCauses: [
      "HTML isn't cached by default without an explicit Cache Rule",
      "Origin sends headers that prevent caching (no-store, private, Set-Cookie)",
      "An existing Cache/Page Rule explicitly bypasses cache for the matched path",
    ],
    investigation: [
      "Inspect the cf-cache-status response header and the origin's actual Cache-Control/Set-Cookie headers",
      "Review Cache Rules for a Bypass action matching the affected path",
    ],
    remediation: [
      "Add a Cache Rule explicitly setting eligibility and TTL for the content type",
      "Adjust origin response headers to permit caching where appropriate",
      "Remove unnecessary Set-Cookie headers on otherwise-cacheable static responses",
    ],
    explanation:
      "Caching is opt-in for anything Cloudflare doesn't recognize as a standard static asset by extension. The fix is almost always either an explicit Cache Rule or correcting origin response headers that are inadvertently marking content as non-cacheable.",
  },
  {
    id: "waf-blocks-legit-api",
    title: "WAF blocks legitimate API requests",
    symptom: "A partner integration or internal service reports failed API calls with 403 responses.",
    architecture: "API client -> Cloudflare WAF -> API Origin (never reached)",
    evidence: [
      "Security Events show a Managed Rule match on a JSON request body",
      "The blocked request is well-formed per the API's own schema, just structurally unusual (e.g. deeply nested JSON, a field containing SQL-like text)",
    ],
    likelyCauses: [
      "A generic Managed Rule signature false-positives on valid-but-unusual JSON payload content",
      "No schema validation is in place to positively define what a valid request looks like",
    ],
    investigation: [
      "Identify the exact matched rule and field via Security Events / the request's Ray ID",
      "Confirm the request is genuinely valid per the API's own schema/contract",
    ],
    remediation: [
      "Add a narrowly scoped Custom Rule exception for the specific endpoint/field pattern",
      "Move toward schema-based (positive security model) validation for the API surface so structurally valid requests aren't subject to generic signature false positives",
    ],
    explanation:
      "APIs are especially prone to WAF false positives because structured data (JSON/GraphQL) can innocently resemble attack patterns. This is the core argument for API-specific, schema-aware protection layered alongside — not instead of — the general WAF.",
  },
  {
    id: "bots-overwhelming",
    title: "Bots are overwhelming the application",
    symptom: "Origin CPU/database load spikes, correlating with a surge in automated-looking traffic.",
    architecture: "Automated clients + real users -> Cloudflare -> Origin (elevated load)",
    evidence: [
      "Bot Analytics shows a spike in low-scoring traffic",
      "Traffic pattern is highly regular (fixed intervals, sequential pagination, no session/cookie retention)",
      "Concentrated on a small number of expensive endpoints (search, full catalog listing)",
    ],
    likelyCauses: [
      "A scraper harvesting content at high frequency",
      "Credential stuffing or account enumeration against an auth endpoint",
      "A misbehaving legitimate integration retrying too aggressively",
    ],
    investigation: [
      "Review Bot Analytics score distribution and the specific endpoints affected",
      "Check whether the source matches a known verified bot (in which case it may be wanted, just needing rate limiting rather than blocking)",
    ],
    remediation: [
      "Apply a graduated response: Managed/JS Challenge before an outright Block, to limit false positives against real users on hardened browsers",
      "Add endpoint-specific rate limiting on the hit endpoints",
      "Allowlist any verified, wanted bot identified during investigation",
    ],
    explanation:
      "The instinct to 'just block it' is understandable but risky without first confirming the traffic is actually unwanted — Bot Management's job is to make that distinction with evidence (score, behavior) rather than assumption, and a graduated response limits the blast radius of being wrong.",
  },
  {
    id: "wrong-client-ip",
    title: "Origin receives the wrong client IP",
    symptom: "Origin access logs, rate limiting, or geo-based logic at the application layer all show Cloudflare's IPs instead of real visitor IPs.",
    architecture: "Browser -> Cloudflare (adds CF-Connecting-IP) -> Origin (reads raw TCP source IP instead)",
    evidence: [
      "Origin logs show a narrow range of IPs consistent with Cloudflare's published ranges, not diverse visitor IPs",
      "Application IP-based logic (rate limiting, geo-blocking, fraud scoring) behaves as if every visitor comes from the same small set of addresses",
    ],
    likelyCauses: [
      "Origin web server/app reads the raw TCP source IP instead of the CF-Connecting-IP / X-Forwarded-For header",
      "An intermediate proxy/load balancer between Cloudflare and the origin isn't forwarding the headers through",
    ],
    investigation: [
      "Curl the origin directly with a manually set CF-Connecting-IP header and confirm what the application actually logs/uses",
      "Check whether a 'real IP' module (e.g. ngx_http_realip_module, mod_remoteip) is enabled and configured with Cloudflare's IP ranges as trusted",
    ],
    remediation: [
      "Enable and correctly configure the appropriate real-IP module with Cloudflare's published IP ranges as trusted",
      "Update application code to read forwarded-IP headers when running behind a known, trusted proxy",
    ],
    explanation:
      "This is a direct consequence of the reverse-proxy two-connection model: the origin's TCP-level view of 'who connected' is always Cloudflare, never the visitor. Any origin-side logic keyed on IP must explicitly recover the real IP from a forwarded header, or every visitor is functionally indistinguishable.",
  },
];

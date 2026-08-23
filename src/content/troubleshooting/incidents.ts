export interface Hypothesis {
  text: string;
  correct: boolean;
  feedback: string;
}

export interface TradeoffOption {
  action: string;
  consequence: string;
  recommended: boolean;
}

export interface Incident {
  id: string;
  title: string;
  symptom: string;
  architecture: string;
  evidence: string[];
  hypotheses: Hypothesis[];
  likelyCauses: string[];
  investigation: string[];
  remediation: string[];
  tradeoffs?: TradeoffOption[];
  explanation: string;
}

export const INCIDENTS: Incident[] = [
  {
    id: "sqli-reaches-origin",
    title: "A SQL injection payload reached the origin",
    symptom: "Post-incident review shows a SQL injection attempt was processed by the application — the WAF never saw it.",
    architecture: "Browser -> [should be] Cloudflare Edge (WAF) -> Origin — but the origin log shows the raw attack",
    evidence: [
      "The origin's application log shows the raw ' OR 1=1-- payload in a request",
      "Security Events in the Cloudflare dashboard show no matching block for that timestamp/path",
      "The hostname the request hit resolves in DNS, but its proxy status hasn't been checked yet",
    ],
    hypotheses: [
      {
        text: "Check whether the hostname the request hit is actually proxied (orange-cloud) in DNS",
        correct: true,
        feedback: "Right instinct — if the WAF never logged the request at all (not even an Allow), the most common explanation is that Cloudflare was never in the request path for that hostname.",
      },
      {
        text: "Assume the WAF Managed Ruleset has a gap and file a bug report immediately",
        correct: false,
        feedback: "Possible in theory, but the WAF logging nothing at all for this request — not even an 'Allow' Security Event — is a stronger signal that Cloudflare never saw the request, not that it saw it and missed it.",
      },
      {
        text: "Restart the origin application server",
        correct: false,
        feedback: "This doesn't address a security path question at all and won't tell you why the request wasn't inspected.",
      },
    ],
    likelyCauses: [
      "The hostname is DNS-only (grey cloud) — Cloudflare never saw the request",
      "The request hit a different, unproxied hostname on the same origin (e.g. a forgotten direct-access subdomain)",
      "A WAF Custom Rule with a Skip action unintentionally bypasses Managed Rules for this path",
    ],
    investigation: [
      "Check the proxy status of the exact hostname the request hit",
      "Search Security Events for the request's Ray ID — if it doesn't exist at all, Cloudflare never processed the request",
      "Review Custom Rules for a Skip action scoped broader than intended",
    ],
    remediation: [
      "Proxy the hostname if it was DNS-only, or remove/redirect the unproxied direct-access subdomain",
      "Narrow any overly broad Skip rule to the specific traffic it was meant for",
      "Audit the full zone for any other unproxied hostnames pointing at the same origin",
    ],
    explanation:
      "The WAF can only ever act on traffic Cloudflare actually receives. When an attack 'gets through,' the very first question is always 'did Cloudflare see this request at all?' before asking 'did the WAF fail to catch it?' — those require completely different fixes.",
  },
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
    hypotheses: [
      {
        text: "Diff recent firewall/security-group changes against Cloudflare's current published IP ranges",
        correct: true,
        feedback: "Right first move — origin monitoring already shows the server is up, so the fastest path to a diagnosis is checking what changed on the network path, and firewall rule drift is the single most common cause.",
      },
      {
        text: "Assume Cloudflare's network is down and wait",
        correct: false,
        feedback: "522 is Cloudflare reporting that it couldn't reach the origin — the opposite implication of a Cloudflare-side outage. Check Cloudflare's status page only after ruling out the origin side.",
      },
      {
        text: "Increase the origin's connection timeout setting",
        correct: false,
        feedback: "This doesn't help if the connection can never be established in the first place — a timeout increase only matters for slow-but-eventually-successful connections, not blocked ones.",
      },
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
    hypotheses: [
      {
        text: "Attempt a direct TLS handshake to the origin on port 443 and inspect the negotiated protocol/cipher or failure reason",
        correct: true,
        feedback: "Correct — since TCP already succeeds, the handshake itself is the point of failure, and reproducing it directly is the fastest way to see exactly what's rejected and why.",
      },
      {
        text: "Check the SSL/TLS mode is set to Full (Strict) and stop there",
        correct: false,
        feedback: "The mode setting matters, but knowing the mode alone doesn't tell you why the handshake failed — you still need to see what protocol/cipher the origin is actually offering.",
      },
      {
        text: "Purge the cache",
        correct: false,
        feedback: "Caching is unrelated to the TLS handshake between the edge and the origin.",
      },
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
    hypotheses: [
      {
        text: "Check the origin certificate's expiry, issuer, and whether the served chain includes intermediates",
        correct: true,
        feedback: "Correct — 526 means the handshake succeeded but validation failed, so the certificate itself (expiry, trust chain, hostname match) is exactly where the problem lives.",
      },
      {
        text: "Switch SSL/TLS mode to Off",
        correct: false,
        feedback: "This would remove encryption entirely rather than fix the underlying certificate problem — a drastic overcorrection, not a diagnosis.",
      },
      {
        text: "Restart the origin web server",
        correct: false,
        feedback: "A restart doesn't fix an expired, self-signed, or incomplete certificate chain.",
      },
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
    hypotheses: [
      {
        text: "Get the Ray ID from the affected user and look it up directly in Security Events",
        correct: true,
        feedback: "Correct — the Ray ID is the fastest path from a vague user report to the exact rule and field that matched, avoiding a slow search by approximate time/IP.",
      },
      {
        text: "Disable the WAF ruleset immediately to restore access",
        correct: false,
        feedback: "This 'fixes' the false positive by removing protection for everyone — a real fix should be scoped to the specific false-positive pattern, not a blanket rollback.",
      },
      {
        text: "Tell the user to clear their browser cache",
        correct: false,
        feedback: "A WAF block is a server-side decision made per-request; nothing client-side about cache state changes whether a rule matches.",
      },
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
    tradeoffs: [
      {
        action: "Disable the WAF ruleset entirely",
        consequence: "Restores access instantly, but removes protection against every attack the ruleset was catching — for every visitor, not just the false-positive case.",
        recommended: false,
      },
      {
        action: "Allow the customer's entire IP address",
        consequence: "Fixes this one customer, but IP-based exceptions are broad, don't scale, and leave that IP unprotected for everything, not just this false positive.",
        recommended: false,
      },
      {
        action: "Add a narrowly scoped Custom Rule exception (Skip) for the specific field/path pattern",
        consequence: "Takes a few minutes longer to identify the precise match, but closes only the specific gap that caused the false positive — protection stays intact everywhere else.",
        recommended: true,
      },
      {
        action: "Do nothing and tell the customer to try again later",
        consequence: "The false positive will keep recurring for every legitimate request matching the same pattern, and erodes trust with real customers.",
        recommended: false,
      },
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
    hypotheses: [
      {
        text: "Audit every DNS record in the zone for anything pointing at the same origin IP with proxying disabled",
        correct: true,
        feedback: "Correct starting point — a leftover DNS-only record on the same origin is the single most common and most fixable cause, and it's the fastest thing to check.",
      },
      {
        text: "Immediately rotate the origin IP as the first step",
        correct: false,
        feedback: "Rotating the IP without first finding and fixing the leak just delays the same exposure — the new IP will leak again from the same unaddressed root cause (a stale record, an open firewall, etc.).",
      },
      {
        text: "Enable Under Attack Mode",
        correct: false,
        feedback: "Under Attack Mode adds friction for visitors going through Cloudflare — it does nothing for traffic that reaches the origin directly, bypassing Cloudflare entirely.",
      },
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
    hypotheses: [
      {
        text: "Query Cloudflare's authoritative nameservers directly and compare against a public resolver",
        correct: true,
        feedback: "Correct — this single comparison immediately tells you whether the authoritative data itself is wrong (a config mistake) or just stale in caches (a propagation/TTL issue), which need completely different fixes.",
      },
      {
        text: "Assume it's propagation and wait 48 hours without checking anything",
        correct: false,
        feedback: "'Just wait' is only the right answer if the authoritative answer is already correct — if the record itself is misconfigured, waiting fixes nothing.",
      },
      {
        text: "Delete and recreate the DNS record",
        correct: false,
        feedback: "This doesn't diagnose anything and risks introducing a new mistake before you've confirmed what's actually wrong.",
      },
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
    hypotheses: [
      {
        text: "Inspect the cf-cache-status header and the origin's actual Cache-Control/Set-Cookie headers together",
        correct: true,
        feedback: "Correct — cf-cache-status tells you what Cloudflare decided, and the origin's headers tell you why; you need both to know whether the fix belongs in a Cache Rule or in the origin's response.",
      },
      {
        text: "Assume Cloudflare's cache is broken and open a support ticket",
        correct: false,
        feedback: "The overwhelmingly common cause is expected default behavior (HTML not cached by default, or origin headers blocking it) — worth ruling out before assuming a platform bug.",
      },
      {
        text: "Set every response to Cache Everything without checking what's actually being served",
        correct: false,
        feedback: "This risks caching per-user or sensitive content (e.g. pages with session data) before you've even confirmed why the current content isn't cacheable.",
      },
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
    hypotheses: [
      {
        text: "Identify the exact matched rule and field via Security Events / the request's Ray ID, and confirm the request is genuinely schema-valid",
        correct: true,
        feedback: "Correct — you need to know precisely what triggered the match before deciding whether it's a true false positive or a request that's actually malformed.",
      },
      {
        text: "Whitelist the partner's API key from all security checks",
        correct: false,
        feedback: "This removes protection for that integration entirely, including from genuine attacks — too broad for a single false-positive pattern.",
      },
      {
        text: "Ask the partner to stop sending that field",
        correct: false,
        feedback: "Possible eventually, but only after confirming the field is actually optional and that this is really a false positive, not a real integration bug.",
      },
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
    tradeoffs: [
      {
        action: "Disable WAF for the entire API hostname",
        consequence: "Unblocks the partner instantly, but removes attack-signature protection for every client of the API, not just this one integration.",
        recommended: false,
      },
      {
        action: "Allow the partner's IP/API key through everything",
        consequence: "Fixes this integration but creates a standing blind spot specific to that credential — if it's ever compromised, it inherits the same blanket bypass.",
        recommended: false,
      },
      {
        action: "Add a narrowly scoped Custom Rule exception for the specific endpoint/field pattern",
        consequence: "Requires identifying the exact match first, but keeps the WAF fully active everywhere else — the fix is as small as the problem.",
        recommended: true,
      },
      {
        action: "Adopt schema validation (API Shield) for the endpoint going forward",
        consequence: "More setup work, but replaces signature-guessing with a positive model — a well-formed request per the schema is never a false positive again.",
        recommended: true,
      },
    ],
    explanation:
      "APIs are especially prone to WAF false positives because structured data (JSON/GraphQL) can innocently resemble attack patterns. This is the core argument for API-specific, schema-aware protection layered alongside — not instead of — the general WAF.",
  },
  {
    id: "bots-overwhelming",
    title: "Bots are overwhelming the application",
    symptom: "Origin CPU/database load spikes, correlating with a surge in automated-looking traffic on /login.",
    architecture: "Automated clients + real users -> Cloudflare -> Origin (elevated load)",
    evidence: [
      "Bot Analytics shows a spike in low-scoring traffic",
      "Traffic pattern is highly regular (fixed intervals, sequential pagination, no session/cookie retention)",
      "Concentrated on a small number of expensive endpoints (login, search, full catalog listing)",
    ],
    hypotheses: [
      {
        text: "Review Bot Analytics score distribution for the affected endpoints before choosing a response",
        correct: true,
        feedback: "Correct — confirming the traffic is actually low-scoring (vs. e.g. a legitimate integration retrying aggressively) is the evidence-based first step before deciding how hard to respond.",
      },
      {
        text: "Immediately block every IP seen hitting /login in the last hour",
        correct: false,
        feedback: "IP-based blocking after the fact is blunt, doesn't scale against IP rotation, and risks blocking legitimate users who share those IPs (NAT/CGNAT) without confirming they're actually bots.",
      },
      {
        text: "Turn off the /login endpoint temporarily",
        correct: false,
        feedback: "This 'solves' the load problem by denying access to legitimate users too — a worse outcome than the original incident for a problem Bot Management and Rate Limiting can address without full downtime.",
      },
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
    hypotheses: [
      {
        text: "Curl the origin directly with a manually set CF-Connecting-IP header and check what the application actually logs",
        correct: true,
        feedback: "Correct — this isolates whether the application is reading the forwarded header at all, which is the actual point of failure in this class of issue.",
      },
      {
        text: "Assume Cloudflare stopped sending the header and contact support",
        correct: false,
        feedback: "CF-Connecting-IP is added on every proxied request by design — the far more common cause is the origin simply not configured to read it.",
      },
      {
        text: "Rewrite all application IP logic to hardcode Cloudflare's ranges as 'trusted users'",
        correct: false,
        feedback: "This treats the symptom as the cause — Cloudflare's IPs being in the logs isn't the problem to fix; not reading CF-Connecting-IP is.",
      },
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

import type { TopicContent } from "../types";

export const waf: TopicContent = {
  slug: "waf",
  category: "learn",
  title: "WAF (Web Application Firewall)",
  description:
    "Managed rules vs custom rules, where the WAF sits in the request path, what it protects (and what it doesn't), and how to reason about false positives.",
  difficulty: "Intermediate",
  minutes: 20,
  objectives: [
    "Explain where the WAF sits relative to DNS, TLS, and the origin",
    "Distinguish Managed Rules from Custom Rules",
    "Describe the evaluation order of firewall/security rule phases",
    "Recognize common WAF misconfigurations that block legitimate traffic",
  ],
  concepts: [
    {
      heading: "Where the WAF sits",
      body: "The WAF only evaluates traffic for proxied (orange-cloud) hostnames, after TLS termination and before the request is sent to (or served from cache in front of) the origin. It operates entirely at L7 — it parses the HTTP request (method, path, query string, headers, cookies, body) and evaluates rules against that content. It has no visibility into DNS-only traffic, and no visibility into application-layer behavior after the request reaches your origin (e.g. it can't see what your app does with a valid, well-formed request).",
      diagram:
        "Browser -> TLS terminate -> DDoS (L7) -> WAF Custom Rules -> Rate Limiting -> WAF Managed Rules -> Bot Fight Mode -> Cache -> Origin",
    },
    {
      heading: "Managed Rules",
      body: "Cloudflare-maintained rule sets (e.g. the Cloudflare Managed Ruleset, OWASP Core Ruleset) that detect known attack signatures: SQL injection, XSS, remote code execution, path traversal, known CVEs, and more. They're updated by Cloudflare as new threats emerge, so you get protection without hand-writing detection logic. Each rule/rule group can be set to Block, Managed Challenge, JS Challenge, Log, or Skip, and rulesets can be tuned with sensitivity/paranoia-style overrides on some plans.",
    },
    {
      heading: "Custom Rules",
      body: "Organization-defined logic using Cloudflare's rules language (similar in spirit to Wireshark/Suricata-style filter expressions). You write conditions against fields like http.request.uri.path, ip.geoip.country, http.request.method, and combine them with and/or. Custom Rules are how you encode business-specific logic the generic Managed Rules can't know: 'block everyone except our office IP from /admin', 'challenge traffic from countries we don't operate in', 'allow our health-check monitor to bypass everything'.",
    },
    {
      heading: "Managed vs Custom — not interchangeable",
      body: "Managed Rules answer 'is this request a known attack pattern?' — they're broad, signature-based, and don't know anything about your specific application. Custom Rules answer 'does this request violate a policy I define?' — they're narrow and business-aware but only catch what you explicitly write. Neither replaces the other: Managed Rules catch attacks you didn't anticipate; Custom Rules enforce access policy Managed Rules have no concept of. Rate Limiting and Bot Management are separate systems again — see their own modules.",
    },
    {
      heading: "Evaluation order matters",
      body: "Cloudflare evaluates security products in a fixed phase order: L7 DDoS protection, then Custom Rules, then Rate Limiting Rules, then Managed Rules, then (Super) Bot Fight Mode — account-level rulesets run before zone-level ones within each phase. A rule that takes a terminating action (Block, Managed Challenge) stops the request from reaching later phases entirely. Note that Custom Rules run before Managed Rules and before Rate Limiting, which is why a Custom Rule with a 'Skip' action can deliberately bypass all of them for specific traffic (e.g. a trusted webhook source) — powerful, but also a common source of accidental gaps if scoped too broadly. Bot Management's score (where available) is generated early enough to be referenced inside Custom Rule expressions, rather than sitting in its own late-stage phase.",
    },
  ],
  examples: [
    {
      title: "A blocked SQL injection attempt",
      request: "GET /search?q=' OR 1=1--",
      body: "The Cloudflare Managed Ruleset's SQL injection detection matches the query string pattern, and the rule action is Block. The visitor receives an HTTP 403 with a Cloudflare block page (or a custom error page if configured); the request never reaches the origin. A Security Event is logged with the matching rule ID and rule message.",
    },
    {
      title: "A legitimate request that looks suspicious",
      request: "POST /api/comments  body: { \"text\": \"SELECT the best option below\" }",
      body: "A comment containing the word SELECT in plain English can trip an overly broad SQLi signature. This is the classic false positive: the Managed Rule is doing its job (pattern matched), but the request is benign. The fix is typically a targeted Custom Rule exception (Skip) scoped tightly to the specific path/parameter, not disabling the whole ruleset.",
    },
  ],
  commonMistakes: [
    "Setting a Managed Rule group to Block globally without first running it in Log mode to see what it would have matched.",
    "Writing a Custom Rule with a Skip action that's broader than intended (e.g. skipping all security products for an entire path instead of a specific parameter).",
    "Assuming the WAF protects against business-logic flaws (e.g. an insecure direct object reference) — it can't reason about your application's authorization logic.",
    "Forgetting the WAF only sees proxied traffic — leaving a related hostname DNS-only means it's completely unprotected.",
  ],
  troubleshooting: [
    {
      symptom: "Legitimate users receive HTTP 403",
      causes: [
        "A Managed Rule matched a false positive in the URL, body, or headers",
        "A Custom Rule's condition is broader than intended",
        "The visitor's IP/ASN/country is caught by a geo or reputation-based rule",
        "A security level or challenge setting is misconfigured for a legitimate automation/monitor",
      ],
      investigation: [
        "Check Security Events / Firewall Events for the specific Ray ID and see which rule matched",
        "Reproduce the request and inspect exactly which field (path, header, body) triggered the match",
        "Check whether the rule was recently changed or a new Managed Ruleset version was deployed",
      ],
      remediation: [
        "Add a narrowly scoped Custom Rule exception (Skip) for the specific legitimate pattern",
        "Report the false positive to Cloudflare if it's a Managed Rule issue",
        "Avoid disabling the entire ruleset — prefer the narrowest possible exception",
      ],
    },
  ],
  quiz: [
    {
      id: "waf-1",
      question: "What is the key difference between Managed Rules and Custom Rules?",
      options: [
        "Managed Rules are free and Custom Rules always cost extra",
        "Managed Rules detect known attack signatures maintained by Cloudflare; Custom Rules enforce organization-specific policy you define",
        "Custom Rules only work on Enterprise plans",
        "There is no functional difference",
      ],
      correctIndex: 1,
      explanation:
        "Managed Rules are broad, vendor-maintained attack-signature detection. Custom Rules are narrow, business-defined policy logic (e.g. 'block this path for these countries'). You typically need both.",
    },
    {
      id: "waf-2",
      question: "A comment submission containing the word 'SELECT' is blocked by a SQL injection rule. What's the best fix?",
      options: [
        "Disable the entire Managed Ruleset",
        "Add a narrowly scoped Custom Rule exception for the specific field/path, keeping the rest of the ruleset active",
        "Switch the hostname to DNS-only",
        "Ignore it — false positives can't be fixed",
      ],
      correctIndex: 1,
      explanation:
        "The correct remediation is minimizing the blast radius of the exception — scope it to exactly the field and path that triggers the false positive, not disabling protection broadly.",
    },
  ],
  relatedTopics: ["rate-limiting", "bot-management", "ddos", "proxying"],
  docs: [
    { label: "WAF — Cloudflare Docs", url: "https://developers.cloudflare.com/waf/" },
    { label: "WAF Custom Rules", url: "https://developers.cloudflare.com/waf/custom-rules/" },
    { label: "Security feature execution order — Cloudflare Docs", url: "https://developers.cloudflare.com/waf/feature-interoperability/" },
  ],
};

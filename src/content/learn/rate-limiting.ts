import type { TopicContent } from "../types";

export const rateLimiting: TopicContent = {
  slug: "rate-limiting",
  category: "learn",
  title: "Rate Limiting",
  description:
    "Traffic-volume based protection: counting requests per key over a time window and acting when a threshold is crossed.",
  difficulty: "Intermediate",
  minutes: 12,
  objectives: [
    "Explain the counting model: key, window, threshold, action",
    "Distinguish rate limiting from WAF signature matching and Bot Management scoring",
    "Design a rate limiting rule for a login endpoint",
  ],
  concepts: [
    {
      heading: "The counting model",
      body: "A rate limiting rule defines: a matching condition (which requests to count, e.g. path eq \"/api/login\"), a characteristic/key to count by (e.g. per IP, per session cookie, per header value), a period (e.g. 60 seconds), a threshold (e.g. 20 requests), and an action once the threshold is exceeded within the window (Block, Managed Challenge, Log). It's purely about volume over time — it doesn't inspect request content the way WAF signatures do, and it doesn't assess client authenticity the way Bot Management does.",
    },
    {
      heading: "Why rate limiting is not a bot filter",
      body: "A single, low-and-slow bot can stay under any reasonable threshold while a legitimate user having a bad day (retrying a flaky mobile connection) can trigger it. Rate limiting is best used for endpoints where volume itself is the risk signal — login attempts, password resets, expensive search/API calls, checkout submission — rather than as a general-purpose bot control. It pairs well with Bot Management: rate-limit by volume, and factor in bot score to reduce false positives on high-volume-but-legitimate integrations.",
    },
    {
      heading: "Choosing the right key",
      body: "Per-IP counting is the default but breaks down behind NAT/CGNAT (many real users share one IP) and is trivially evaded by IP rotation. Per-session or per-authenticated-user counting is more precise for logged-in flows. Per-header counting (e.g. an API key) is appropriate for API rate limiting where you want per-client fairness rather than per-network-address fairness. Note this is plan-gated: Free/Pro can only count by IP; custom counting keys (headers, cookies, query params, JA3/JA4 fingerprint, and more) require Business or Enterprise.",
    },
    {
      heading: "Counters are approximate, not exact",
      body: "Rate limiting is not designed to let through a precise number of requests. Counting happens across a distributed edge with a propagation delay of up to a few seconds, so a burst can briefly exceed the configured threshold before enforcement catches up. Treat the threshold as 'roughly N per period,' not a hard cap — for a genuinely hard limit, enforce it at the application layer too.",
    },
  ],
  examples: [
    {
      title: "Protecting a login endpoint",
      body: "IF http.request.uri.path eq \"/api/login\" AND http.request.method eq \"POST\"\nCOUNT BY ip.src\nPERIOD 60s  THRESHOLD 10\nTHEN Managed Challenge\n\nThis slows down credential-stuffing attempts (which need high request volume to be effective) without outright blocking every login, since a Managed Challenge only impacts clients that fail to demonstrate they're a normal browser.",
    },
  ],
  commonMistakes: [
    "Setting the threshold so low that legitimate retry behavior (mobile networks, SPA double-submits) triggers false positives.",
    "Counting by IP alone for an endpoint used heavily behind corporate NAT, penalizing many real users for one heavy user's traffic.",
    "Relying on rate limiting alone to stop credential stuffing — pair it with Bot Management and, ideally, MFA.",
  ],
  quiz: [
    {
      id: "rl-1",
      question: "Why might per-IP rate limiting unfairly affect legitimate users?",
      options: [
        "IPs never change so this is never a problem",
        "Many real users can share one public IP behind NAT/CGNAT or a corporate proxy, so one heavy user can trigger the limit for everyone sharing that IP",
        "Rate limiting can't be keyed by IP",
        "It only applies to POST requests",
      ],
      correctIndex: 1,
      explanation:
        "Shared-IP scenarios (corporate networks, CGNAT, mobile carriers) mean per-IP counting can penalize a whole group of users for one member's traffic. Session- or account-based keys avoid this for authenticated flows.",
    },
  ],
  relatedTopics: ["waf", "bot-management", "ddos"],
  mentalModelSlugs: ["bot-vs-rate-limit"],
  applyLabHref: "/labs/waf-lab",
  architectHref: "/labs/troubleshooting",
  lastVerified: "2026-08-23",
  officialSources: [{ title: "Rate limiting rules", url: "https://developers.cloudflare.com/waf/rate-limiting-rules/", sourceType: "cloudflare-documentation" }],
};

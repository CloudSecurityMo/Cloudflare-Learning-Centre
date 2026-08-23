import type { TopicContent } from "../types";

export const botManagement: TopicContent = {
  slug: "bot-management",
  category: "learn",
  title: "Bot Management",
  description:
    "How Cloudflare distinguishes human traffic from automated traffic — bot scores, fingerprinting, behavioral signals, and mitigation trade-offs.",
  difficulty: "Advanced",
  minutes: 16,
  objectives: [
    "Explain how a bot score is derived from multiple signal types",
    "Distinguish verified good bots from unwanted automated traffic",
    "Reason about the trade-offs between Block, Challenge, and Allow for borderline traffic",
  ],
  concepts: [
    {
      heading: "Not all bots are bad",
      body: "Search engine crawlers, uptime monitors, and legitimate API integrations are bots too. Cloudflare maintains a verified bot list (validated via reverse DNS/IP ownership, e.g. Googlebot) so these can be reliably allowed. The hard problem is unwanted automation: scrapers, credential-stuffing tools, inventory hoarders, and AI training crawlers that don't identify themselves honestly.",
    },
    {
      heading: "Three tiers, not one product",
      body: "Bot Fight Mode (Free, all plans) is a single toggle that challenges detected bot traffic domain-wide, with no configuration. Super Bot Fight Mode (Pro/Business) adds per-category actions (challenge/block specific kinds of known bots) and static-resource protection, but still doesn't expose a per-request score you can build logic on. Bot Management (Enterprise add-on) is the tier that actually generates a queryable 1-99 bot score (cf.bot_management.score) per request, usable in Custom Rule expressions for endpoint-specific handling — this is the tier the rest of this module assumes.",
    },
    {
      heading: "How a bot score is built (conceptually)",
      body: "Cloudflare Bot Management combines several signal categories into that 1-99 score (lower = more likely automated):\n\nFingerprinting — TLS/HTTP client characteristics (JA3/JA4-style signatures, header order, HTTP/2 frame behavior) that reveal the actual client software, regardless of what the User-Agent header claims.\nBehavioral analysis — request timing, navigation patterns, mouse/keyboard signals where available, and consistency with how humans actually browse.\nReputation — IP and network-level history of automated abuse (e.g. known data-center/proxy ranges, prior malicious activity).\nMachine learning models — trained on traffic patterns across Cloudflare's network to catch novel automation that doesn't match a known signature.",
    },
    {
      heading: "Why simple User-Agent filtering fails",
      body: "A scraper can trivially set its User-Agent to mimic Chrome on Windows. This is why bot detection leans on signals the client can't easily fake consistently: the actual TLS handshake fingerprint, the order and casing of HTTP headers, and behavioral timing — mismatches between 'claims to be Chrome' and 'behaves like a script' are the real signal.",
    },
    {
      heading: "Residential proxies and headless browsers raise the bar",
      body: "Sophisticated scraping increasingly routes through residential IP proxy networks (defeating IP reputation) and drives full headless browsers like Playwright/Puppeteer (defeating naive fingerprinting, since a real browser engine produces a real TLS/JS fingerprint). This is why modern bot management leans more on behavioral consistency over time and network-wide pattern detection rather than any single signal.",
    },
  ],
  examples: [
    {
      title: "Scenario: an AI scraper hitting /products/*",
      body: "Request pattern: sequential, predictable pagination (?page=1, ?page=2...), consistent low-second intervals, no referrer, no cookies retained between requests, TLS fingerprint not matching a mainstream browser release. Bot score: low (e.g. 1-10). Origin impact: elevated database load on a catalog endpoint not designed for high-frequency full-catalog reads.\n\nMitigation options:\nBlock — stops it outright, but risks false positives if the score is borderline and you're wrong about the source.\nManaged/JS Challenge — filters out non-browser clients while letting real browsers (including a human using a script-blocked browser) through with minimal friction.\nRate Limit — caps the damage without an outright identity judgment; useful when you're not fully confident in the bot score.\nAllow + Monitor — appropriate if this is a bot you want (e.g. a legitimate price-comparison partner) — verify via the verified bot list or a Custom Rule allowlist instead of guessing from score alone.",
    },
  ],
  commonMistakes: [
    "Blocking purely on User-Agent string, which is trivially spoofed and also risks blocking legitimate verified bots (search engines) that identify honestly.",
    "Setting a single global bot rule with 'Block' and no monitoring period, risking false positives against real users on privacy-hardened browsers or corporate proxies.",
    "Not distinguishing 'automated' from 'malicious' — some automation (uptime checks, RSS readers, legitimate integrations) is automated but benign.",
    "Assuming a per-request bot score is available to write Custom Rules against on every plan — it's a Bot Management (Enterprise) feature; Bot Fight Mode and Super Bot Fight Mode don't expose one.",
  ],
  quiz: [
    {
      id: "bot-1",
      question: "Why is TLS/HTTP fingerprinting more reliable than reading the User-Agent header?",
      options: [
        "It isn't more reliable, they're equivalent",
        "The User-Agent is an arbitrary string the client sets and can freely lie about; the TLS handshake and HTTP behavior reflect the actual client software",
        "TLS fingerprinting only works on HTTP, not HTTPS",
        "Fingerprinting requires the client's cooperation",
      ],
      correctIndex: 1,
      explanation:
        "A script can claim to be any browser via User-Agent, but the underlying TLS library/handshake characteristics and HTTP/2 behavior are much harder to convincingly fake as a specific real browser.",
    },
    {
      id: "bot-2",
      question: "A team on the Pro plan wants to write a Custom Rule that blocks requests with cf.bot_management.score < 10. Will this work?",
      options: [
        "Yes, bot scores are available on every plan",
        "No — the per-request bot score is a Bot Management (Enterprise add-on) feature; Pro only has Super Bot Fight Mode, which doesn't expose a queryable score",
        "Yes, but only for GET requests",
        "No, because Custom Rules can never reference bot signals",
      ],
      correctIndex: 1,
      explanation:
        "Bot Fight Mode (Free) and Super Bot Fight Mode (Pro/Business) challenge or block known bot categories with fixed behavior, but don't expose a per-request score. Writing Custom Rule logic against a bot score requires the Bot Management Enterprise add-on.",
    },
  ],
  relatedTopics: ["waf", "rate-limiting", "ddos"],
  mentalModelSlugs: ["bot-vs-rate-limit"],
  applyLabHref: "/labs/bot-lab",
  architectHref: "/labs/architecture-designer",
  lastVerified: "2026-08-23",
  officialSources: [
    { title: "Bot Management overview", url: "https://developers.cloudflare.com/bots/", sourceType: "cloudflare-documentation" },
    { title: "Bot solutions comparison by plan", url: "https://developers.cloudflare.com/bots/plans/", sourceType: "cloudflare-documentation" },
    { title: "cf.bot_management.score field reference", url: "https://developers.cloudflare.com/ruleset-engine/rules-language/fields/reference/cf.bot_management.score", sourceType: "cloudflare-documentation" },
  ],
};

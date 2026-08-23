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
      heading: "How a bot score is built (conceptually)",
      body: "Cloudflare Bot Management (and the lighter-weight Bot Fight Mode on lower plans) combines several signal categories into a 1-99 score (lower = more likely automated):\n\nFingerprinting — TLS/HTTP client characteristics (JA3/JA4-style signatures, header order, HTTP/2 frame behavior) that reveal the actual client software, regardless of what the User-Agent header claims.\nBehavioral analysis — request timing, navigation patterns, mouse/keyboard signals where available, and consistency with how humans actually browse.\nReputation — IP and network-level history of automated abuse (e.g. known data-center/proxy ranges, prior malicious activity).\nMachine learning models — trained on traffic patterns across Cloudflare's network to catch novel automation that doesn't match a known signature.",
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
  ],
  relatedTopics: ["waf", "rate-limiting", "ddos"],
  docs: [{ label: "Bot Management — Cloudflare Docs", url: "https://developers.cloudflare.com/bots/" }],
};

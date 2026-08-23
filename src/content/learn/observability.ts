import type { TopicContent } from "../types";

export const observability: TopicContent = {
  slug: "observability",
  category: "learn",
  title: "Security Analytics & Observability",
  description:
    "What each analytics dataset actually answers — Security Events, HTTP logs, DNS analytics, Bot analytics — and how to pick the right one for an investigation.",
  difficulty: "Intermediate",
  minutes: 12,
  objectives: [
    "Match a troubleshooting question to the right analytics dataset",
    "Understand Ray IDs as the correlation key across datasets",
  ],
  concepts: [
    {
      heading: "Datasets answer different questions",
      body: "Security Events — 'what did the WAF/Bot Management/rate limiting do, and why?' Shows matched rule, action taken, and the request's key attributes.\nHTTP request logs — 'what happened to every request, regardless of security action?' The full traffic log, needed for questions Security Events alone can't answer (e.g. overall traffic volume, cache hit ratio, response codes).\nDNS analytics — 'what queries is my zone receiving, and how are they being answered?' Query volume, response codes, query types.\nBot analytics — 'how much of my traffic is automated, and what's its score distribution?'",
    },
    {
      heading: "Ray ID as the correlation key",
      body: "Every request that hits Cloudflare's edge is assigned a unique Ray ID (visible in the CF-Ray response header). It's the thread that lets you tie together a single request's WAF decision, cache status, and origin response across different views/logs — indispensable when investigating one specific blocked or slow request rather than an aggregate trend.",
    },
  ],
  examples: [
    {
      title: "Investigating a specific false positive",
      body: "A user reports being blocked. Ask them for the Ray ID shown on the block page, then look it up directly in Security Events to see exactly which rule matched and why — far faster than searching aggregate logs by approximate timestamp and IP.",
    },
  ],
  commonMistakes: [
    "Searching HTTP logs for a security decision (Security Events is the right dataset) or vice versa.",
    "Not asking users for the Ray ID on a block page, forcing a slower investigation by approximate time/IP.",
  ],
  quiz: [
    {
      id: "obs-1",
      question: "A user is blocked and shares their Ray ID. What is the fastest way to investigate?",
      options: [
        "Search DNS analytics for the IP",
        "Look up the Ray ID directly in Security Events to see the exact rule match and action",
        "Ray IDs cannot be used for investigation",
        "Purge the cache and ask them to retry",
      ],
      correctIndex: 1,
      explanation:
        "The Ray ID uniquely identifies that single request across Cloudflare's systems, letting you jump straight to the specific security decision instead of searching by approximate time/IP.",
    },
  ],
  relatedTopics: ["logging", "waf"],
  docs: [{ label: "Security Analytics — Cloudflare Docs", url: "https://developers.cloudflare.com/waf/analytics/security-analytics/" }],
};

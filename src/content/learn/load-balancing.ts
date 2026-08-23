import type { TopicContent } from "../types";

export const loadBalancing: TopicContent = {
  slug: "load-balancing",
  category: "learn",
  title: "Load Balancing",
  description:
    "Health checks, traffic steering, and failover across multiple origins — and how it composes with proxying and DNS.",
  difficulty: "Intermediate",
  minutes: 12,
  objectives: [
    "Explain how Cloudflare Load Balancing differs from a traditional origin-side load balancer",
    "Describe health checks and failover pools",
    "Identify Cloudflare's traffic-steering policies (Standard, Geo, Dynamic, Proximity, Least Outstanding Requests)",
  ],
  concepts: [
    {
      heading: "Edge-side vs origin-side load balancing",
      body: "A traditional load balancer (e.g. an AWS ALB) sits in front of your servers and distributes traffic that already reached your infrastructure. Cloudflare Load Balancing operates at the edge, before traffic ever leaves Cloudflare's network — it decides which origin/pool a request should be sent to based on health, geography, or weighting, then proxies to that origin. This means failover can route traffic to an entirely different region or cloud provider without the client noticing, since the decision happens before the request leaves Cloudflare.",
    },
    {
      heading: "Pools and health checks",
      body: "A pool is a set of origin addresses (e.g. servers in us-east). Cloudflare actively health-checks each origin (configurable path, method, expected status/response, interval) and only routes traffic to origins currently marked healthy. If an entire pool becomes unhealthy, traffic can fail over to a backup pool.",
    },
    {
      heading: "Steering policies",
      body: "Cloudflare documents these traffic steering policies: Standard — the baseline policy, distributing traffic to healthy pools by configured weight/priority order. Geo — routes based on the geographic location the DNS query originated from, down to country-level granularity. Dynamic — adjusts distribution using real-time performance metrics and pool health. Proximity — sends visitors to the geographically nearest available pool. Least Outstanding Requests — routes to the pool currently handling the fewest active connections. Session Affinity (a separate, related setting) keeps a given client pinned to the same origin for the duration of a session, for workloads where statefulness requires it.",
    },
  ],
  examples: [
    {
      title: "Multi-region failover",
      body: "Primary pool: us-east origins. Backup pool: us-west origins. Health check: GET /healthz every 15s, expect HTTP 200. If all us-east origins fail health checks, Cloudflare automatically steers new requests to us-west — no DNS change, no client-visible interruption beyond the failover window.",
    },
  ],
  commonMistakes: [
    "Pointing the health check at a heavy endpoint (e.g. a full page render) instead of a lightweight dedicated health endpoint, causing false unhealthy states under load.",
    "Assuming load balancing alone provides DDoS protection or WAF coverage — it's a separate, complementary capability.",
  ],
  quiz: [
    {
      id: "lb-1",
      question: "How does Cloudflare Load Balancing's failover differ from a traditional origin-side load balancer?",
      options: [
        "There is no difference",
        "Cloudflare decides which origin/pool to use at the edge, before the request ever reaches your infrastructure, enabling failover across regions or providers transparently to the client",
        "It only works within a single data center",
        "It requires the client to retry manually",
      ],
      correctIndex: 1,
      explanation:
        "Because the routing decision happens at Cloudflare's edge based on active health checks, failover can span entirely different regions or cloud providers without any client-side change.",
    },
  ],
  relatedTopics: ["proxying", "cdn"],
  architectHref: "/labs/architecture-designer",
  lastVerified: "2026-08-23",
  officialSources: [
    { title: "Load Balancing overview", url: "https://developers.cloudflare.com/load-balancing/", sourceType: "cloudflare-documentation" },
    { title: "Traffic steering policies", url: "https://developers.cloudflare.com/load-balancing/understand-basics/traffic-steering/steering-policies/", sourceType: "cloudflare-documentation" },
    { title: "Session Affinity", url: "https://developers.cloudflare.com/load-balancing/understand-basics/session-affinity/", sourceType: "cloudflare-documentation" },
  ],
};

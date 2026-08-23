import type { TopicContent } from "../types";

export const workers: TopicContent = {
  slug: "workers",
  category: "learn",
  title: "Workers & Pages",
  description:
    "Running your own code at the edge — how Workers fit into the request path relative to caching, WAF, and origin, and when to use Pages instead.",
  difficulty: "Advanced",
  minutes: 14,
  objectives: [
    "Explain what a Worker is and where it executes relative to the rest of the request path",
    "Distinguish Workers (compute) from Pages (static hosting + Functions)",
    "Identify common Worker use cases in a Cloudflare architecture",
  ],
  concepts: [
    {
      heading: "What a Worker actually is",
      body: "A Cloudflare Worker is a JavaScript/WebAssembly function that runs on Cloudflare's edge, in the same data centers handling your proxied traffic, using the V8 isolate model (not a full container/VM per request — isolates start in milliseconds with far less overhead). A Worker can be attached to a route or hostname and can intercept, modify, or fully generate the HTTP response.",
    },
    {
      heading: "Where Workers sit in the request path",
      body: "For a given route, a Worker executes after TLS termination and (depending on configuration) can run before or interact with cache and origin: it can serve a response directly (no origin call at all), fetch from the origin and transform the response, call other APIs, or read/write Cloudflare storage (KV, R2, D1, Durable Objects). This makes Workers useful for things that don't fit neatly into 'WAF rule' or 'cache rule' — custom auth logic, A/B testing, request/response rewriting, building an API entirely at the edge.",
      diagram: "Browser -> TLS -> WAF/Bot/RateLimit -> Worker (route match) -> [Cache | Origin | KV/D1/R2 | direct response]",
    },
    {
      heading: "Workers vs Pages",
      body: "Pages is Cloudflare's platform for static sites and frontend frameworks with git-based deployments and built-in Pages Functions (which are Workers under the hood, scoped to a Pages project's routes) for light server-side logic (API routes, form handling). Workers is the general-purpose compute platform: standalone APIs, edge middleware in front of an existing origin, scheduled jobs (Cron Triggers), and more. For a typical case — 'I have a static frontend with a couple of API routes' — Pages with Functions is usually the simpler starting point; 'I need a standalone edge service or complex routing/middleware logic' points to Workers directly.",
    },
  ],
  examples: [
    {
      title: "Edge middleware pattern",
      body: "A Worker on /api/* checks a JWT before the request ever reaches the origin, returning 401 directly for invalid tokens — reducing origin load and centralizing auth logic at the edge rather than duplicating it across backend services.",
    },
  ],
  commonMistakes: [
    "Treating a Worker as a replacement for WAF/rate limiting when a purpose-built rule would be simpler and require no code to maintain.",
    "Not accounting for Worker execution limits (CPU time, subrequest counts) when designing logic that fans out to many origin/API calls.",
  ],
  quiz: [
    {
      id: "workers-1",
      question: "What execution model do Cloudflare Workers use?",
      options: [
        "A full virtual machine per request",
        "A traditional container per customer",
        "V8 isolates — lightweight JS execution contexts that start in milliseconds",
        "A dedicated physical server per Worker",
      ],
      correctIndex: 2,
      explanation:
        "Workers run in V8 isolates, the same lightweight sandboxing technology Chrome uses per tab — enabling very fast cold starts compared to container- or VM-based compute.",
    },
  ],
  relatedTopics: ["proxying", "cdn"],
  docs: [{ label: "Workers — Cloudflare Docs", url: "https://developers.cloudflare.com/workers/" }],
};

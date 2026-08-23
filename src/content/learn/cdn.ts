import type { TopicContent } from "../types";

export const cdn: TopicContent = {
  slug: "cdn",
  category: "learn",
  title: "CDN & Caching",
  description:
    "Edge caching, cache keys, Cache-Control, cache rules, purge, and the anatomy of a cache HIT vs MISS.",
  difficulty: "Beginner",
  minutes: 14,
  objectives: [
    "Explain what determines whether a request is cacheable",
    "Describe the cache key and how varying it changes cache behavior",
    "Trace a cache MISS through to origin and back",
    "Explain purge and stale content trade-offs",
  ],
  concepts: [
    {
      heading: "What makes a response cacheable",
      body: "By default, Cloudflare caches based on file extension for static assets (images, CSS, JS, fonts) and respects Cache-Control / Expires headers from the origin. HTML is not cached by default on most plans unless explicitly configured (Cache Rules) because dynamic pages usually shouldn't be shared across users. Cache-Control: no-store, private, or a Set-Cookie header on the response commonly prevent caching unless overridden.",
    },
    {
      heading: "The cache key",
      body: "A cache key is what Cloudflare uses to decide if two requests can share a cached response — by default, the scheme + hostname + path + query string. Two requests with different query strings are, by default, different cache entries (unless you strip/ignore certain params). Cache Rules let you customize the cache key (e.g. ignore marketing query params like utm_source so they don't fragment the cache, or vary by a specific header/cookie for legitimate per-segment caching).",
    },
    {
      heading: "HIT vs MISS",
      body: "Cache HIT: Cloudflare's edge already holds a valid cached copy for this cache key and serves it directly — the origin is never contacted, and response time is dramatically lower.\nCache MISS: no valid cached copy exists (or it expired). Cloudflare forwards the request to the origin, receives the response, stores it (if cacheable) for the next matching request, and returns it to the client. The cf-cache-status response header shows HIT, MISS, DYNAMIC, EXPIRED, or BYPASS.",
      diagram:
        "MISS:  Browser -> Cloudflare (no cached copy) -> Origin -> Response -> Cloudflare stores + returns\n" +
        "HIT:   Browser -> Cloudflare (cached copy found) -> Response returned directly, origin untouched",
    },
    {
      heading: "Purge and staleness",
      body: "When origin content changes, a previously-cached response becomes stale until it's purged or its TTL expires. Purge options typically include purge-everything, purge by URL, and purge by cache-tag (tag responses at origin so related content can be invalidated together, e.g. all pages referencing a changed product). Aggressive TTLs reduce origin load but risk serving outdated content after a deploy if purging isn't part of the release process.",
    },
  ],
  examples: [
    {
      title: "Static asset — cache HIT",
      body: "GET /images/logo.png -> cf-cache-status: HIT, served entirely from Cloudflare's edge, origin never contacted for this request.",
    },
    {
      title: "Same asset, first request after deploy — cache MISS",
      body: "GET /images/logo.png (right after purge) -> cf-cache-status: MISS -> forwarded to origin -> origin responds with Cache-Control: max-age=86400 -> Cloudflare stores it -> subsequent requests within 24h are HITs.",
    },
  ],
  commonMistakes: [
    "Expecting HTML pages to be cached automatically without configuring a Cache Rule — most default configurations don't cache HTML.",
    "Not stripping irrelevant query parameters from the cache key, fragmenting the cache into many near-duplicate entries (e.g. ?utm_campaign=... creating a unique cache entry per ad click).",
    "Forgetting to purge after a deploy, serving stale assets until TTL expiry.",
    "Caching responses that include per-user data (e.g. a Set-Cookie session token) without a properly scoped cache key, leaking one user's cached page to another.",
  ],
  troubleshooting: [
    {
      symptom: "Application is not being cached",
      causes: [
        "Content type (e.g. HTML) isn't cached by default without a Cache Rule",
        "Origin sends Cache-Control: no-store, private, or no-cache",
        "Response includes a Set-Cookie header, which by default prevents caching",
        "A Page/Cache Rule explicitly bypasses cache for the matched path",
      ],
      investigation: [
        "Inspect the cf-cache-status response header",
        "Check the origin's actual Cache-Control/Set-Cookie headers for the response",
        "Review Cache Rules for a Bypass action matching the path",
      ],
      remediation: [
        "Add a Cache Rule explicitly setting eligibility and TTL for the content type",
        "Adjust origin headers to allow caching where appropriate",
        "Remove unnecessary Set-Cookie headers on cacheable static responses",
      ],
    },
  ],
  quiz: [
    {
      id: "cdn-1",
      question: "By default, what does the cache key include?",
      options: [
        "Only the file extension",
        "Scheme, hostname, path, and query string",
        "Only the client's IP address",
        "The full request body",
      ],
      correctIndex: 1,
      explanation:
        "The default cache key is based on scheme + host + path + query string, meaning different query strings are treated as different cached objects unless customized via Cache Rules.",
    },
  ],
  relatedTopics: ["proxying", "waf"],
  docs: [{ label: "Caching — Cloudflare Docs", url: "https://developers.cloudflare.com/cache/" }],
};

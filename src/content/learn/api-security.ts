import type { TopicContent } from "../types";

export const apiSecurity: TopicContent = {
  slug: "api-security",
  category: "learn",
  title: "API Security",
  description:
    "Schema validation, API discovery, and abuse detection — where general-purpose WAF protection stops and API-specific controls begin.",
  difficulty: "Advanced",
  minutes: 14,
  objectives: [
    "Explain why APIs need controls beyond the general WAF",
    "Describe schema validation as a positive-security-model control",
    "Explain API discovery (shadow/zombie API detection)",
  ],
  concepts: [
    {
      heading: "APIs are structured, so they can be validated positively",
      body: "General WAF Managed Rules use a negative security model: block known-bad patterns. For a well-defined API with an OpenAPI/Swagger schema, you can flip to a positive security model: define exactly what a valid request looks like (required fields, types, formats, enums) and reject anything that doesn't conform. This catches malformed and malicious requests alike, including ones that don't match any known attack signature.",
    },
    {
      heading: "API discovery",
      body: "Organizations frequently lose track of every API endpoint in production — 'shadow APIs' never documented, and 'zombie APIs' from deprecated versions still reachable. API discovery works by passively analyzing traffic through the proxy to build an inventory of observed endpoints, methods, and parameters, surfacing ones that aren't in your published schema so they can be reviewed, documented, or retired.",
    },
    {
      heading: "Abuse detection beyond rate limiting",
      body: "Simple rate limiting caps volume per key; API abuse detection looks at sequence and pattern — e.g. a client enumerating sequential IDs (/api/orders/1001, 1002, 1003...) far faster than a legitimate integration would, which is a business-logic-abuse pattern rather than a raw volume spike or a signature-matched attack.",
    },
  ],
  examples: [
    {
      title: "Schema validation rejecting a malformed request",
      body: "Endpoint expects { \"amount\": number, \"currency\": string(3) }. A request sending { \"amount\": \"'; DROP TABLE users;--\" } fails type validation (string where a number is required) and is rejected before any application code executes — independent of whether it also happens to match a SQLi signature.",
    },
  ],
  commonMistakes: [
    "Relying solely on the general WAF for a versioned, well-documented API instead of enforcing the schema directly.",
    "Not decommissioning old API versions, leaving 'zombie' endpoints reachable with weaker validation than the current version.",
  ],
  quiz: [
    {
      id: "api-1",
      question: "What is the core difference between a positive and negative security model, in the context of API protection?",
      options: [
        "Positive models block known-bad patterns; negative models allow only known-good structure",
        "Negative models block known-bad patterns (signatures); positive models (schema validation) allow only requests matching a defined valid structure and reject everything else",
        "They are the same thing with different names",
        "Positive models only apply to GET requests",
      ],
      correctIndex: 1,
      explanation:
        "Negative security (typical WAF Managed Rules) blocks what it recognizes as bad. Positive security (schema validation) defines exactly what's allowed and rejects anything that deviates — often stronger for well-structured APIs.",
    },
  ],
  relatedTopics: ["waf", "rate-limiting"],
  docs: [{ label: "API Shield — Cloudflare Docs", url: "https://developers.cloudflare.com/api-shield/" }],
};

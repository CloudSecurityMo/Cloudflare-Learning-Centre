import type { TopicContent } from "../types";

export const logging: TopicContent = {
  slug: "logging",
  category: "learn",
  title: "Logpush & SIEM Integration",
  description:
    "Getting raw request-level data out of Cloudflare and into your own SIEM/data warehouse for retention, correlation, and custom alerting.",
  difficulty: "Intermediate",
  minutes: 10,
  objectives: [
    "Explain why Logpush exists alongside the dashboard's built-in analytics",
    "Describe the conceptual pipeline from edge event to SIEM",
  ],
  concepts: [
    {
      heading: "Why push logs out at all",
      body: "Dashboard analytics are great for interactive investigation but aren't designed for long-term retention, custom correlation across other systems (application logs, cloud provider logs), or arbitrary alerting logic. Logpush exports raw log data (HTTP requests, firewall events, DNS logs, and more, depending on the dataset) continuously to a destination you control — S3, GCS, Azure Blob, Splunk, Datadog, or a generic HTTP endpoint.",
    },
    {
      heading: "Conceptual pipeline",
      body: "Cloudflare edge event -> internal logging pipeline -> Logpush job (filtered/scoped to a dataset and field set) -> your storage/SIEM -> correlation with app and infra logs, long-term retention, custom detection rules.",
      diagram:
        "Cloudflare\n" +
        "  +-- Security Events --+\n" +
        "  +-- HTTP Logs --------+---> Logpush ---> SIEM / S3 / Splunk / Datadog\n" +
        "  +-- DNS Logs ---------+",
    },
  ],
  commonMistakes: [
    "Pushing every field of every dataset without filtering, creating unnecessary storage cost and noise.",
    "Treating dashboard analytics retention as a substitute for a real SIEM/long-term retention strategy.",
  ],
  quiz: [
    {
      id: "log-1",
      question: "What problem does Logpush solve that the dashboard's built-in analytics doesn't?",
      options: [
        "It makes the WAF block more requests",
        "It exports raw log data continuously to your own storage/SIEM for long-term retention and cross-system correlation",
        "It replaces the need for Security Events entirely",
        "It only works for DNS records",
      ],
      correctIndex: 1,
      explanation:
        "Logpush is about getting data out for retention, correlation with other systems, and custom alerting — not a replacement for the interactive dashboard, but a complement to it.",
    },
  ],
  relatedTopics: ["observability"],
  docs: [{ label: "Logpush — Cloudflare Docs", url: "https://developers.cloudflare.com/logs/logpush/" }],
};

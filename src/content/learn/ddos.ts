import type { TopicContent } from "../types";

export const ddos: TopicContent = {
  slug: "ddos",
  category: "learn",
  title: "DDoS Protection",
  description:
    "Volumetric, protocol, and application-layer DDoS mitigation — and why Cloudflare's approach differs by which OSI layer the attack targets.",
  difficulty: "Intermediate",
  minutes: 14,
  objectives: [
    "Distinguish L3/L4 (network/transport) DDoS from L7 (application) DDoS",
    "Explain why anycast + always-on mitigation is central to Cloudflare's DDoS approach",
    "Identify which product handles which layer of attack",
  ],
  concepts: [
    {
      heading: "Three broad attack categories",
      body: "Volumetric attacks — flood bandwidth/capacity (e.g. UDP floods, amplification attacks) to exhaust link capacity.\nProtocol attacks — exploit weaknesses in L3/L4 protocol handling (e.g. SYN floods) to exhaust server/connection-state resources.\nApplication-layer (L7) attacks — flood the HTTP(S) layer with seemingly valid requests to exhaust application/database resources (e.g. an HTTP flood against a search endpoint).",
    },
    {
      heading: "Why anycast helps with volumetric/protocol attacks",
      body: "Because Cloudflare's network announces the same IPs from hundreds of locations, a volumetric attack's traffic is naturally spread across many data centers rather than concentrating on one link or server. Combined with always-on, automated L3/L4 mitigation profiles that analyze traffic in real time, this is what allows Cloudflare to absorb attacks that would saturate a single origin's uplink.",
    },
    {
      heading: "L7 DDoS is a different problem",
      body: "An application-layer flood consists of technically valid HTTP requests — TLS handshake completes, request is well-formed — so it can't be filtered by network-layer signatures alone. Mitigation here overlaps heavily with Rate Limiting and Bot Management: identifying abnormal request rate/patterns per client, JS/Managed Challenges to filter non-browser clients, and adaptive DDoS rulesets that look for anomalous traffic shape (e.g. a sudden spike of similar requests from many IPs).",
    },
    {
      heading: "What DDoS protection does not do",
      body: "It does not protect DNS-only (non-proxied) records — those bypass the edge entirely. It does not protect against application logic abuse that looks like normal, low-volume traffic (that's a WAF/business-logic problem). And for non-HTTP TCP/UDP services, network-layer DDoS protection requires Spectrum or Magic Transit, not the standard HTTP proxy.",
    },
  ],
  examples: [
    {
      title: "SYN flood against an origin",
      body: "Without a reverse proxy, thousands of half-open TCP connections exhaust the origin's connection table. With a proxied hostname, the TCP handshake completes at Cloudflare's edge; the origin only ever sees the smaller number of legitimate, fully-proxied connections Cloudflare chooses to forward.",
    },
    {
      title: "L7 flood against a search endpoint",
      body: "Thousands of IPs send valid GET /search?q=x requests per second. Network-layer mitigation doesn't apply (traffic looks legitimate at L3/L4). This is where a Rate Limiting rule on /search, combined with Bot Management scoring, distinguishes the flood from real users.",
    },
  ],
  commonMistakes: [
    "Believing 'DDoS protection is on' means every layer is covered — L7 protection requires explicitly configuring Rate Limiting/Bot Management/WAF, it isn't automatic in the same way L3/L4 mitigation is.",
    "Leaving an origin's real IP discoverable, allowing attackers to bypass Cloudflare's DDoS mitigation entirely by attacking the origin directly.",
    "Assuming DDoS protection applies to DNS-only records.",
  ],
  quiz: [
    {
      id: "ddos-1",
      question: "Why is an HTTP flood (L7 DDoS) harder to filter than a volumetric UDP flood?",
      options: [
        "It uses more bandwidth",
        "The individual requests are technically valid HTTP, so network-layer signature filtering doesn't distinguish them from real traffic",
        "It always originates from a single IP",
        "It can't be mitigated at all",
      ],
      correctIndex: 1,
      explanation:
        "L7 floods look like normal application traffic at the network layer. Mitigating them requires request-rate and behavioral analysis (rate limiting, bot detection), not packet-level filtering.",
    },
  ],
  relatedTopics: ["waf", "rate-limiting", "bot-management"],
  docs: [{ label: "DDoS Protection — Cloudflare Docs", url: "https://developers.cloudflare.com/ddos-protection/" }],
};

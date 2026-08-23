import type { TopicContent } from "../types";

export const dns: TopicContent = {
  slug: "dns",
  category: "learn",
  title: "DNS",
  description:
    "Record types, authoritative vs recursive resolution, nameserver delegation, TTLs, and the proxied vs DNS-only toggle that changes everything downstream.",
  difficulty: "Beginner",
  minutes: 20,
  objectives: [
    "Explain the difference between recursive resolvers and authoritative nameservers",
    "Identify the purpose of A, AAAA, CNAME, MX, TXT, NS, SRV, CAA, and PTR records",
    "Describe nameserver delegation and how a registrar hands authority to Cloudflare",
    "Explain TTL, propagation, and DNSSEC at a practical level",
    "Predict what changes when a record is toggled between Proxied and DNS-only",
  ],
  concepts: [
    {
      heading: "Recursive vs authoritative DNS",
      body: "A recursive resolver (e.g. your ISP's resolver, or 1.1.1.1) is the server your device asks. It doesn't necessarily know the answer — it walks the DNS hierarchy (root -> TLD -> authoritative nameserver) and caches the result. An authoritative nameserver is the source of truth for a zone; when you move a domain to Cloudflare, Cloudflare's nameservers become authoritative for that zone and answer queries directly from the records you configure.",
      diagram:
        "Browser --> Recursive Resolver --> Root NS --> .com TLD NS --> Cloudflare NS (authoritative)\n" +
        "                                                                     |\n" +
        "                                                             returns A/AAAA/CNAME record",
    },
    {
      heading: "Nameserver delegation",
      body: "Moving a domain to Cloudflare means updating the NS records at your registrar to point to two Cloudflare-assigned nameservers (e.g. bob.ns.cloudflare.com). The registrar's delegation is what makes Cloudflare authoritative — Cloudflare doesn't need to 'own' the domain, only to be delegated authority for it. Until delegation propagates (which depends on the TTL cached by the registry and resolvers), some resolvers may still return answers from the old provider.",
    },
    {
      heading: "Core record types",
      body: "A — maps a hostname to an IPv4 address.\nAAAA — maps a hostname to an IPv6 address.\nCNAME — aliases one hostname to another hostname (cannot coexist with other records on the same name, except under CNAME flattening at the zone apex, which Cloudflare supports).\nMX — points a domain to mail servers, with a priority value; lower priority is preferred.\nTXT — arbitrary text, commonly used for SPF, DKIM, DMARC, and domain verification.\nNS — delegates a subdomain to a different set of nameservers.\nSRV — specifies host/port for a service (e.g. SIP, XMPP).\nCAA — restricts which Certificate Authorities may issue TLS certificates for the domain.\nPTR — reverse DNS, maps an IP back to a hostname (used for mail server reputation, not typically managed in a forward zone).",
    },
    {
      heading: "TTL and propagation",
      body: "TTL (time-to-live) tells resolvers how long, in seconds, to cache a record before re-querying. A low TTL (e.g. 60s) makes changes take effect fast but increases query volume; a high TTL (e.g. 86400s / 24h) reduces load but delays how quickly changes are visible. 'Propagation' isn't a single global event — every resolver that cached the old value keeps serving it until its own TTL expires. Note: for proxied records, Cloudflare manages the effective TTL of the edge IPs itself (shown as 'Auto' in the dashboard) since it needs to be able to rotate infrastructure.",
    },
    {
      heading: "DNSSEC",
      body: "DNSSEC adds cryptographic signatures to DNS responses so resolvers can verify a record wasn't tampered with in transit. It protects DNS integrity, not confidentiality — DNS queries and responses are still visible in plaintext. Enabling DNSSEC on Cloudflare requires adding a DS record at your registrar after enabling it in the dashboard; the chain of trust runs from the TLD down to your zone.",
    },
    {
      heading: "Apex/root domain vs subdomains",
      body: "The apex (or 'root' / 'zone apex') is the bare domain — example.com, with no subdomain label. Historically, RFC 1034 discouraged CNAMEs at the apex (they can't coexist with the mandatory NS/SOA records there). Cloudflare works around this with CNAME flattening, which lets you point the apex at a target hostname while Cloudflare resolves it to an A/AAAA record on the fly at query time.",
    },
    {
      heading: "Proxied vs DNS-only — the toggle that changes everything",
      body: "Every A/AAAA/CNAME record has an orange-cloud/grey-cloud toggle.\n\nDNS-only (grey cloud): Cloudflare answers queries with your origin's real IP. The browser connects straight to your origin. No caching, no WAF, no Bot Management, no DDoS L7 mitigation, no edge TLS termination — Cloudflare is acting purely as a DNS host.\n\nProxied (orange cloud): Cloudflare answers queries with its own anycast IPs. The browser connects to Cloudflare, which terminates TLS, may cache the response, applies WAF/Bot/rate-limit rules, and then opens its own connection to your origin (proxying the request). Your origin IP is hidden from the browser's perspective — though it can still leak via other means, see the Origin Protection Lab.",
      diagram:
        "DNS only:                          Proxied:\n\n" +
        "Browser ----------> Origin          Browser --> Cloudflare Edge --> Origin\n" +
        "  (direct TLS to origin cert)          (TLS to CF cert)   (TLS/plain to origin cert)",
    },
  ],
  examples: [
    {
      title: "A typical zone",
      body: "example.com  A     203.0.113.10        (proxied)\n" +
        "www          CNAME example.com          (proxied)\n" +
        "mail         A     198.51.100.5         (DNS only — mail servers must not be proxied)\n" +
        "@            MX    10 mail.example.com\n" +
        "@            TXT   \"v=spf1 include:_spf.example.com ~all\"",
    },
  ],
  commonMistakes: [
    "Proxying MX targets or mail server A records — SMTP is not HTTP/HTTPS and Cloudflare's proxy does not support it; mail records must stay DNS-only.",
    "Assuming a lower TTL fixes a propagation problem after the fact — the old TTL was already cached by resolvers before you changed it.",
    "Forgetting to add the DS record at the registrar after enabling DNSSEC in Cloudflare, leaving DNSSEC half-configured.",
    "Expecting CNAME and other record types to coexist on the same name outside of Cloudflare's CNAME flattening at the apex.",
  ],
  troubleshooting: [
    {
      symptom: "Cloudflare DNS resolves incorrectly / users see stale content",
      causes: [
        "A resolver is still serving a cached answer within its TTL window",
        "The record was recently changed and hasn't propagated to all recursive resolvers",
        "NS delegation at the registrar still points to the old provider",
        "A CNAME or A record was edited on the wrong record/zone",
      ],
      investigation: [
        "Query Cloudflare's authoritative nameservers directly (e.g. dig @<ns>.ns.cloudflare.com example.com) to confirm what Cloudflare is actually serving",
        "Query a public resolver (1.1.1.1, 8.8.8.8) to see what's cached externally",
        "Check the TTL on the record and how recently it changed",
        "Confirm the registrar's NS records match the nameservers assigned by Cloudflare",
      ],
      remediation: [
        "Wait out the previous TTL window if delegation and record data are correct",
        "Fix NS delegation at the registrar if it hasn't been updated",
        "Lower TTL before planned future changes to reduce cache staleness",
      ],
    },
  ],
  quiz: [
    {
      id: "dns-1",
      question: "Why can't mail server A records typically be proxied through Cloudflare?",
      options: [
        "Mail servers don't use DNS",
        "Cloudflare's proxy operates on HTTP/HTTPS (and some TCP/UDP via Spectrum); standard SMTP mail delivery isn't proxied through the orange cloud",
        "MX records don't support IP addresses",
        "Proxying mail records is fine and commonly done",
      ],
      correctIndex: 1,
      explanation:
        "The orange-cloud proxy is built for HTTP(S) traffic (Spectrum extends proxying to other TCP/UDP protocols separately). Mail delivery needs to reach the real mail server IP directly, so those records are kept DNS-only.",
    },
    {
      id: "dns-2",
      question: "What does DNSSEC actually protect against?",
      options: [
        "Eavesdropping on DNS queries (confidentiality)",
        "Tampering with DNS responses in transit (integrity/authenticity)",
        "DDoS attacks against the origin server",
        "Slow DNS propagation",
      ],
      correctIndex: 1,
      explanation:
        "DNSSEC cryptographically signs records so a resolver can verify the response came from the real authoritative source and wasn't modified. It does not encrypt the query/response — DNS queries remain visible unless combined with DoH/DoT.",
    },
  ],
  relatedTopics: ["proxying", "fundamentals", "ssl-tls"],
  docs: [
    { label: "DNS Records — Cloudflare Docs", url: "https://developers.cloudflare.com/dns/manage-dns-records/reference/dns-record-types/" },
    { label: "Proxy status — Cloudflare Docs", url: "https://developers.cloudflare.com/dns/manage-dns-records/reference/proxied-dns-records/" },
  ],
};

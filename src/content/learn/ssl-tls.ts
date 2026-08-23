import type { TopicContent } from "../types";

export const sslTls: TopicContent = {
  slug: "ssl-tls",
  category: "learn",
  title: "SSL/TLS",
  description:
    "Encryption modes between browser, Cloudflare, and origin — Flexible, Full, Full (Strict) — plus origin certificates and the 526/525/522 error family.",
  difficulty: "Intermediate",
  minutes: 16,
  objectives: [
    "Explain the two independent TLS legs: browser-to-Cloudflare and Cloudflare-to-origin",
    "Distinguish Flexible, Full, and Full (Strict) SSL/TLS modes",
    "Explain what an Origin CA certificate is and why it exists",
    "Diagnose 525/526 errors from first principles",
  ],
  concepts: [
    {
      heading: "Two independent TLS legs",
      body: "Because Cloudflare is a reverse proxy, encryption is really two separate questions: (1) is the browser-to-Cloudflare connection encrypted, and (2) is the Cloudflare-to-origin connection encrypted, and if so, is the origin's certificate actually validated? The SSL/TLS mode setting controls leg 2's behavior.",
    },
    {
      heading: "The four modes",
      body: "Off — no HTTPS at all between browser and Cloudflare (rarely appropriate today).\nFlexible — browser-to-Cloudflare is HTTPS, but Cloudflare-to-origin is plain HTTP. The origin never needs a certificate. This is a trap for anything handling sensitive data: traffic is unencrypted for the second leg, and it commonly causes redirect loops if the origin app itself tries to force HTTPS.\nFull — both legs are HTTPS, but Cloudflare does not validate the origin certificate's authenticity (self-signed certs are accepted). Encrypted, but vulnerable to on-path attacks between edge and origin impersonating the origin.\nFull (Strict) — both legs are HTTPS, and Cloudflare validates the origin certificate against a trusted CA or Cloudflare's own Origin CA. This is the recommended mode for anything beyond a quick test.",
      diagram:
        "Flexible:      Browser --HTTPS--> Cloudflare --HTTP---> Origin\n" +
        "Full:          Browser --HTTPS--> Cloudflare --HTTPS(any cert)--> Origin\n" +
        "Full (Strict): Browser --HTTPS--> Cloudflare --HTTPS(validated cert)--> Origin",
    },
    {
      heading: "Origin CA certificates",
      body: "Cloudflare operates its own Origin CA that can issue free certificates specifically for securing the Cloudflare-to-origin leg. These certificates are trusted by Cloudflare (enabling Full Strict) but are NOT trusted by browsers generally — they only make sense on the origin, behind Cloudflare's proxy, never for a connection the public will hit directly. A public CA certificate (e.g. via Let's Encrypt) works too and has the advantage of being valid even if a client somehow reaches the origin directly.",
    },
    {
      heading: "Public edge certificates",
      body: "Separately, Cloudflare issues a certificate for the browser-facing leg — either a free 'Universal SSL' certificate covering the zone, or a custom/uploaded certificate for specific needs (e.g. an EV cert, or a cert covering hostnames spanning multiple accounts). This is independent from the origin certificate; each leg has its own cert.",
    },
  ],
  examples: [
    {
      title: "Scenario: Cloudflare returns HTTP 526",
      body: "526 = Invalid SSL Certificate at the origin, seen when the SSL/TLS mode is Full (Strict) and Cloudflare cannot validate the origin's certificate — expired cert, self-signed cert without an Origin CA relationship, hostname mismatch, or incomplete chain.\n\nWhy: Full (Strict) explicitly requires a valid, trusted certificate on the origin. If the origin is serving a self-signed or expired cert, validation fails and Cloudflare refuses to proxy the request rather than silently downgrading security.\n\nTroubleshooting: check the origin certificate's expiry and issuer, confirm it matches the hostname Cloudflare is connecting with (SNI), and confirm the full chain (including intermediate certs) is being served — a missing intermediate is a very common cause of an otherwise 'looks fine in a browser' cert failing strict validation.",
    },
  ],
  commonMistakes: [
    "Using Flexible SSL for an application that handles logins or sensitive data — the origin leg is plaintext.",
    "Using Full (not Strict) long-term instead of Full (Strict) — it's encrypted but doesn't stop origin impersonation.",
    "Deploying a Cloudflare Origin CA certificate on a server that's also reachable directly by the public — browsers will show it as untrusted since it's not a publicly trusted CA.",
    "Forgetting to include intermediate certificates in the origin's chain, causing intermittent Full (Strict) validation failures.",
  ],
  troubleshooting: [
    {
      symptom: "Cloudflare returns 526 (Invalid SSL Certificate)",
      causes: ["Origin certificate expired", "Self-signed cert with SSL/TLS mode set to Full (Strict)", "Hostname/SNI mismatch", "Missing intermediate certificate in the chain"],
      investigation: ["Check certificate expiry and issuer at the origin directly (bypassing Cloudflare)", "Verify SSL/TLS mode in the dashboard", "Test the full chain with an SSL diagnostic tool"],
      remediation: ["Renew/replace the certificate, or issue a Cloudflare Origin CA cert", "Ensure the full chain including intermediates is served", "Confirm the certificate covers the exact hostname used"],
    },
    {
      symptom: "Cloudflare returns 525 (SSL Handshake Failed)",
      causes: ["Origin doesn't support a TLS version/cipher Cloudflare requires", "Origin isn't listening on 443 or SSL/TLS mode expects HTTPS but origin only serves HTTP", "Origin's TLS stack rejects Cloudflare's connection"],
      investigation: ["Attempt a direct TLS handshake to the origin on 443 and inspect the negotiated protocol/cipher", "Check origin web server TLS configuration"],
      remediation: ["Update origin TLS configuration to support modern protocols/ciphers", "Confirm the origin is actually serving HTTPS on the expected port"],
    },
    {
      symptom: "Cloudflare returns 522 (Connection Timed Out)",
      causes: ["Origin server is down or unreachable", "Origin firewall is blocking Cloudflare's IP ranges", "Network path/routing issue between edge and origin"],
      investigation: ["Check origin server health/uptime directly", "Verify the origin firewall allows Cloudflare's published IP ranges", "Check for recent infrastructure/network changes"],
      remediation: ["Restore origin availability", "Update firewall rules to allow Cloudflare IP ranges", "If using Cloudflare Tunnel, verify the connector is running"],
    },
  ],
  quiz: [
    {
      id: "tls-1",
      question: "In Flexible SSL mode, what is true about the Cloudflare-to-origin connection?",
      options: [
        "It's always HTTPS with strict validation",
        "It's plain HTTP — unencrypted",
        "It doesn't exist; Flexible means no proxying",
        "It uses the browser's original certificate",
      ],
      correctIndex: 1,
      explanation:
        "Flexible only encrypts the browser-to-Cloudflare leg. The Cloudflare-to-origin leg is plain HTTP, which is a real risk for sensitive traffic and a common cause of confusion/misconfiguration.",
    },
    {
      id: "tls-2",
      question: "What does a 526 error most directly indicate?",
      options: [
        "The origin server is completely offline",
        "DNS failed to resolve",
        "Cloudflare could not validate the origin's SSL certificate under Full (Strict) mode",
        "The visitor's browser doesn't support HTTPS",
      ],
      correctIndex: 2,
      explanation:
        "526 specifically means the origin responded with a certificate that failed validation — expired, self-signed without trust, hostname mismatch, or broken chain — while Full (Strict) mode is active.",
    },
  ],
  relatedTopics: ["proxying", "dns"],
  docs: [
    { label: "SSL/TLS encryption modes — Cloudflare Docs", url: "https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/" },
    { label: "Origin CA — Cloudflare Docs", url: "https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/" },
    { label: "Troubleshooting 526 — Cloudflare Docs", url: "https://developers.cloudflare.com/ssl/troubleshooting/error-pages/" },
  ],
};

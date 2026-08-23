export interface ForwardedHeader {
  name: string;
  value: string;
  note: string;
}

export function buildForwardedHeaders(visitorIp: string, country: string, hostname: string, https: boolean): ForwardedHeader[] {
  return [
    { name: "CF-Connecting-IP", value: visitorIp, note: "The visitor's real IP address." },
    { name: "X-Forwarded-For", value: visitorIp, note: "Standard proxy chain header; includes CF-Connecting-IP." },
    { name: "X-Forwarded-Proto", value: https ? "https" : "http", note: "Protocol (HTTP or HTTPS) the visitor used to connect to Cloudflare." },
    { name: "CF-IPCountry", value: country, note: "Two-character country code of the visitor, as detected by Cloudflare." },
    { name: "CF-Ray", value: "8f3c2a1b9e6d4f01-DFW", note: "Unique per-request identifier for correlating with Cloudflare logs/support." },
    { name: "CF-Visitor", value: `{"scheme":"${https ? "https" : "http"}"}`, note: "JSON object indicating the scheme the visitor used." },
    { name: "Host", value: hostname, note: "The hostname the visitor requested." },
  ];
}

export interface OriginLogLine {
  sourceIp: string;
  isCorrect: boolean;
  explanation: string;
}

export function computeOriginLog(visitorIp: string, cloudflareEdgeIp: string, originTrustsForwardedHeaders: boolean): OriginLogLine {
  if (originTrustsForwardedHeaders) {
    return {
      sourceIp: visitorIp,
      isCorrect: true,
      explanation:
        "The origin's web server (or a real-IP module like ngx_http_realip_module / mod_remoteip) is configured to read CF-Connecting-IP and rewrite the logged client IP. Access logs, rate limiting, and geo logic at the origin all see the real visitor.",
    };
  }
  return {
    sourceIp: cloudflareEdgeIp,
    isCorrect: false,
    explanation:
      "The origin is reading the raw TCP source IP — which is always Cloudflare's edge, never the visitor's, for proxied traffic. Every request looks like it came from the same small set of Cloudflare addresses. Any origin-side IP logic (logging, rate limiting, geo-blocking) is effectively broken.",
  };
}

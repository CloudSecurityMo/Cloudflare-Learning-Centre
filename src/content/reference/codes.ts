export interface StatusCode {
  code: number;
  label: string;
  meaning: string;
  layer: "Origin" | "Cloudflare";
}

export const HTTP_STATUS_CODES: StatusCode[] = [
  { code: 200, label: "OK", meaning: "Request succeeded.", layer: "Origin" },
  { code: 301, label: "Moved Permanently", meaning: "Permanent redirect — often set by origin app or a Cloudflare redirect rule.", layer: "Origin" },
  { code: 304, label: "Not Modified", meaning: "Cached response is still valid; used with conditional requests (ETag/If-Modified-Since).", layer: "Origin" },
  { code: 400, label: "Bad Request", meaning: "Malformed request syntax.", layer: "Origin" },
  { code: 401, label: "Unauthorized", meaning: "Authentication required or failed.", layer: "Origin" },
  { code: 403, label: "Forbidden", meaning: "Request understood but refused — commonly a WAF/Custom Rule block, or origin-level authorization failure.", layer: "Cloudflare" },
  { code: 404, label: "Not Found", meaning: "Resource doesn't exist at the origin.", layer: "Origin" },
  { code: 429, label: "Too Many Requests", meaning: "Rate limit exceeded — either a Cloudflare rate limiting rule or the origin application's own limiter.", layer: "Cloudflare" },
  { code: 500, label: "Internal Server Error", meaning: "Origin application crashed or errored while handling the request.", layer: "Origin" },
  { code: 502, label: "Bad Gateway", meaning: "Origin returned an invalid/malformed response Cloudflare couldn't relay.", layer: "Cloudflare" },
  { code: 503, label: "Service Unavailable", meaning: "Origin is overloaded or explicitly refusing requests.", layer: "Origin" },
  { code: 504, label: "Gateway Timeout", meaning: "Origin accepted the connection but didn't respond in time.", layer: "Cloudflare" },
];

export interface CfErrorCode {
  code: number;
  label: string;
  meaning: string;
  commonCauses: string[];
}

export const CF_ERROR_CODES: CfErrorCode[] = [
  {
    code: 520,
    label: "Web Server Returned an Unknown Error",
    meaning: "The origin returned an empty, reset, or otherwise unparseable response.",
    commonCauses: ["Origin process crashed mid-response", "Origin web server misconfiguration", "Unexpected connection reset"],
  },
  {
    code: 521,
    label: "Web Server Is Down",
    meaning: "Cloudflare could reach the origin server's network but the web server refused the connection.",
    commonCauses: ["Web server process is stopped", "Firewall actively refusing (not just dropping) the connection"],
  },
  {
    code: 522,
    label: "Connection Timed Out",
    meaning: "Cloudflare could not establish a TCP connection to the origin within the timeout window.",
    commonCauses: ["Origin server is down/unreachable", "Origin firewall dropping Cloudflare's IP ranges", "Network routing issue"],
  },
  {
    code: 523,
    label: "Origin Is Unreachable",
    meaning: "Cloudflare could not route to the origin IP at all.",
    commonCauses: ["DNS record points to an invalid/unreachable IP", "Origin IP no longer exists"],
  },
  {
    code: 524,
    label: "A Timeout Occurred",
    meaning: "Cloudflare connected to the origin, but the origin didn't send a complete response within the timeout.",
    commonCauses: ["Slow database query or backend dependency", "Origin application hanging"],
  },
  {
    code: 525,
    label: "SSL Handshake Failed",
    meaning: "The TLS handshake between Cloudflare and the origin failed.",
    commonCauses: ["Origin doesn't support a required TLS version/cipher", "Origin isn't actually listening on HTTPS"],
  },
  {
    code: 526,
    label: "Invalid SSL Certificate",
    meaning: "Cloudflare could not validate the origin's TLS certificate under Full (Strict) mode.",
    commonCauses: ["Expired certificate", "Self-signed certificate without Origin CA trust", "Hostname mismatch", "Missing intermediate certificate"],
  },
];

export type TlsMode = "off" | "flexible" | "full" | "full-strict";
export type OriginCertState = "valid" | "invalid" | "none";

export interface TlsOutcome {
  browserLeg: string;
  originLeg: string;
  status: "ok" | "error" | "insecure";
  errorCode?: number;
  message: string;
}

export function evaluateTls(mode: TlsMode, origin: OriginCertState): TlsOutcome {
  if (mode === "off") {
    return {
      browserLeg: "HTTP (unencrypted)",
      originLeg: "N/A",
      status: "insecure",
      message: "No HTTPS at all between browser and Cloudflare. Not recommended for any traffic beyond a legacy compatibility case.",
    };
  }

  if (mode === "flexible") {
    return {
      browserLeg: "HTTPS (encrypted)",
      originLeg: "HTTP (unencrypted, origin cert irrelevant)",
      status: "insecure",
      message: "Browser sees a padlock, but the Cloudflare-to-origin leg is always plain HTTP regardless of what certificate (if any) the origin has. Risky for anything beyond a quick test.",
    };
  }

  if (mode === "full") {
    if (origin === "none") {
      return {
        browserLeg: "HTTPS (encrypted)",
        originLeg: "Handshake failed — origin has no HTTPS listener",
        status: "error",
        errorCode: 525,
        message: "Full mode still requires the origin to speak TLS. With no HTTPS listener at all, the handshake fails outright.",
      };
    }
    return {
      browserLeg: "HTTPS (encrypted)",
      originLeg: "HTTPS (encrypted, certificate NOT validated)",
      status: "ok",
      message: "Both legs are encrypted, but Cloudflare accepts any certificate the origin presents — including self-signed or expired ones. This stops passive eavesdropping but not an on-path attacker impersonating the origin. (Note: Full mode technically matches whatever protocol the visitor connected with — this lab assumes an HTTPS visitor, which is the near-universal case today.)",
    };
  }

  // full-strict
  if (origin === "none") {
    return {
      browserLeg: "HTTPS (encrypted)",
      originLeg: "Handshake failed — origin has no HTTPS listener",
      status: "error",
      errorCode: 525,
      message: "Full (Strict) requires a working TLS handshake with the origin. No HTTPS listener means the handshake never completes.",
    };
  }
  if (origin === "invalid") {
    return {
      browserLeg: "HTTPS (encrypted)",
      originLeg: "Handshake succeeded, certificate validation FAILED",
      status: "error",
      errorCode: 526,
      message: "Full (Strict) validates the origin's certificate against a trusted CA (or Cloudflare's Origin CA). A self-signed, expired, or mismatched certificate is rejected rather than silently accepted.",
    };
  }
  return {
    browserLeg: "HTTPS (encrypted)",
    originLeg: "HTTPS (encrypted, certificate validated)",
    status: "ok",
    message: "Both legs are encrypted and the origin's identity is cryptographically verified. This is the recommended mode for production traffic.",
  };
}

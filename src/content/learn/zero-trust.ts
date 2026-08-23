import type { TopicContent } from "../types";

export const zeroTrust: TopicContent = {
  slug: "zero-trust",
  category: "learn",
  title: "Zero Trust (Access, Gateway, WARP)",
  description:
    "A separate product surface from public DNS/CDN: identity-aware access to internal apps, outbound traffic policy, and device posture.",
  difficulty: "Advanced",
  minutes: 16,
  objectives: [
    "Explain the Zero Trust principle: verify explicitly, never trust by network location",
    "Distinguish Access (inbound, app-level) from Gateway (outbound, network-level)",
    "Describe how Access, identity, device posture, and Tunnel combine for a private app",
  ],
  concepts: [
    {
      heading: "Zero Trust vs traditional perimeter security",
      body: "Traditional VPN security trusts anyone who's 'inside the network.' Zero Trust instead evaluates every request against identity, device, and context — regardless of network location — before granting access. Cloudflare's Zero Trust platform (Cloudflare One) is largely independent from the public DNS/CDN/WAF products discussed elsewhere: a private internal app can use Access + Tunnel with zero public DNS records proxied at all.",
    },
    {
      heading: "Access — inbound, application-level",
      body: "Cloudflare Access sits in front of an application (internal or external) and enforces identity-based policy before a request is allowed through: 'only users in the Engineering group, from a managed device, with MFA, may reach internal.example.com.' It integrates with identity providers (Okta, Azure AD/Entra, Google Workspace, etc.) and can layer in device posture checks (WARP client, certificate presence, OS version, disk encryption status).",
      diagram: "User -> Identity Provider (auth) -> Device Posture Check -> Cloudflare Access Policy -> Application",
    },
    {
      heading: "Gateway — outbound, network-level",
      body: "Cloudflare Gateway is the inverse direction: it inspects and filters traffic leaving a user's device or network — DNS filtering, HTTP/S filtering, and network-layer policies — functioning like a cloud-delivered secure web gateway. It's what an organization uses to enforce 'block access to known-malicious domains' or 'block uploads to unsanctioned SaaS storage' for outbound user traffic.",
    },
    {
      heading: "WARP as the connector",
      body: "WARP is the client (device agent) that routes a user's traffic through Cloudflare's network so Gateway policies can be applied, and that can present device posture signals to Access policies. It's conceptually similar to a lightweight, always-on VPN client purpose-built for Zero Trust policy enforcement rather than just tunneling.",
    },
    {
      heading: "Putting it together for a private app",
      body: "A common pattern: an internal app has no public DNS record at all. Cloudflare Tunnel provides outbound-only connectivity from the app's network to Cloudflare (see the Tunnel module). Access sits in front of the Tunnel hostname, enforcing identity + device posture policy. The result: the app is reachable by name only to authorized, verified users — with no inbound port ever opened on the app's network.",
    },
  ],
  examples: [
    {
      title: "Example Access policy",
      body: "Application: internal.example.com\nPolicy: Allow — Include: Emails ending in @example.com AND Login method: Okta AND Device posture: WARP client active + OS is macOS or Windows + disk encrypted.\nEverything else: Deny (default).",
    },
  ],
  commonMistakes: [
    "Confusing Access (who can reach this app) with Gateway (what can this user/device reach on the internet) — they solve different directions of the problem.",
    "Assuming Zero Trust requires proxying public DNS records — it doesn't; Access + Tunnel can secure fully private apps with no public exposure.",
  ],
  quiz: [
    {
      id: "zt-1",
      question: "What is the fundamental difference between Access and Gateway?",
      options: [
        "Access filters outbound traffic, Gateway controls inbound access to apps",
        "Access controls inbound, identity-based access to specific applications; Gateway filters outbound traffic leaving a user's device/network",
        "They are the same product with different names",
        "Access only works with Tunnel, Gateway only works with WARP",
      ],
      correctIndex: 1,
      explanation:
        "Access is application-facing (who can reach this specific app). Gateway is network-facing (what can this user/device reach or send on the broader internet).",
    },
  ],
  relatedTopics: ["proxying", "fundamentals"],
  docs: [{ label: "Cloudflare Zero Trust — Cloudflare Docs", url: "https://developers.cloudflare.com/cloudflare-one/" }],
};

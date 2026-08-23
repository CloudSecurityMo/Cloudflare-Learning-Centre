import type { TopicContent } from "../types";

export const tunnel: TopicContent = {
  slug: "tunnel",
  category: "learn",
  title: "Cloudflare Tunnel",
  description:
    "Removing inbound exposure entirely: how cloudflared creates outbound-only connections so an origin never needs an open inbound port.",
  difficulty: "Intermediate",
  minutes: 14,
  objectives: [
    "Explain why Tunnel exists and what problem it solves versus a firewalled public IP",
    "Describe the outbound-only connection model",
    "Identify Tunnel's role relative to Access for private applications",
    "Reason about Tunnel failure scenarios",
  ],
  concepts: [
    {
      heading: "The problem: any open inbound port is an attack surface",
      body: "Even a well-firewalled origin (allowing only Cloudflare's IP ranges) still has an open inbound listening port — a target for port scanning, misconfiguration risk, and a dependency on firewall rules staying correct forever. Cloudflare Tunnel removes the open inbound port entirely: the origin makes an outbound connection to Cloudflare, and that same connection is used to carry traffic back in.",
    },
    {
      heading: "How it works",
      body: "A lightweight daemon called cloudflared runs on (or near) the origin network. It establishes outbound, encrypted connections to the Cloudflare edge — no inbound firewall rule is needed on the origin side at all, since the connection is always origin-initiated. When a request for the Tunnel's hostname arrives at Cloudflare's edge, it's routed back down the existing outbound connection to cloudflared, which forwards it to the local application.",
      diagram:
        "Internet -> Cloudflare Edge -> [existing outbound connection] -> cloudflared -> Private application\n" +
        "                                        ^\n" +
        "                          connection was initiated FROM cloudflared, not to it",
    },
    {
      heading: "Tunnel + Access for private applications",
      body: "Tunnel by itself just removes inbound exposure — it doesn't inherently add authentication. Pairing it with Cloudflare Access adds identity-based policy in front of the Tunnel hostname, so the combination is: no open inbound port (Tunnel) + only verified, authorized users can reach it (Access). This is the standard pattern for exposing an internal app without a VPN.",
    },
    {
      heading: "High availability",
      body: "Multiple cloudflared replicas can connect for the same Tunnel, giving redundancy — if one connector goes down, traffic routes through the others. This is a deliberate architectural choice distinct from origin-side load balancing: it's about connector availability, not origin traffic distribution.",
    },
  ],
  examples: [
    {
      title: "Migrating a legacy on-prem app off VPN",
      body: "Before: employees connect via full-network VPN, app reachable only inside the corporate network, IT manages VPN client + firewall rules.\nAfter: cloudflared runs on-prem, establishes an outbound Tunnel; Access policy requires SSO login + managed device; employees reach the app by hostname from anywhere, with no VPN client and no inbound firewall rule ever opened.",
    },
  ],
  commonMistakes: [
    "Assuming Tunnel alone provides authentication — it removes inbound exposure but access policy (Access) is a separate, additive layer.",
    "Running only one cloudflared replica in a production setup with no redundancy plan.",
    "Forgetting that Tunnel is for HTTP(S) and select TCP/UDP use cases — it isn't a general substitute for every network architecture.",
  ],
  troubleshooting: [
    {
      symptom: "Origin unreachable through a Tunnel",
      causes: [
        "cloudflared process is stopped or crashed",
        "cloudflared can't reach the local application (wrong local address/port in the Tunnel config)",
        "Outbound connectivity from the cloudflared host to Cloudflare's network is blocked (e.g. by a local firewall/proxy)",
        "DNS record for the Tunnel hostname was changed or removed",
      ],
      investigation: [
        "Check cloudflared process status and logs on the host",
        "Verify the Tunnel's ingress configuration matches the local application's actual address/port",
        "Test outbound connectivity from the cloudflared host",
        "Confirm the CNAME/Tunnel route in DNS still points to the correct Tunnel",
      ],
      remediation: [
        "Restart cloudflared and monitor logs for connection errors",
        "Correct the ingress rule's local service address",
        "Add a second cloudflared replica for redundancy going forward",
      ],
    },
  ],
  quiz: [
    {
      id: "tun-1",
      question: "Why does Cloudflare Tunnel improve on 'firewall the origin to only allow Cloudflare's IP ranges'?",
      options: [
        "It's faster",
        "It removes the open inbound port entirely — the connection is always origin-initiated, so there's no inbound listener to scan or misconfigure",
        "It replaces the need for TLS",
        "It only works for static websites",
      ],
      correctIndex: 1,
      explanation:
        "A firewalled public IP still has an inbound listening port, dependent on firewall rules staying correct. Tunnel's outbound-only model means there is no inbound port for an attacker to find at all.",
    },
  ],
  relatedTopics: ["zero-trust", "proxying"],
  docs: [{ label: "Cloudflare Tunnel — Cloudflare Docs", url: "https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/" }],
};

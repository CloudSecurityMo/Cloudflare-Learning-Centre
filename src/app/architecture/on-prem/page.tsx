import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { SourceVerification } from "@/components/learn/source-verification";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PATTERNS = [
  {
    title: "Expose a public-facing app running on-prem",
    diagram: "Internet -> Cloudflare (WAF, CDN, TLS) -> Cloudflare Tunnel -> cloudflared -> On-prem app",
    body:
      "The same pattern as any Tunnel deployment: cloudflared runs on-prem and dials out to Cloudflare, so there's no inbound port to open on the datacenter firewall. Public traffic gets the full edge security stack (WAF, Bot Management, caching) before it ever reaches the Tunnel connection.",
    href: "/learn/tunnel",
    linkLabel: "Cloudflare Tunnel module",
  },
  {
    title: "Give remote employees access to an internal-only on-prem app",
    diagram: "Employee -> Identity + device posture -> Cloudflare Access -> Cloudflare Tunnel -> On-prem app",
    body:
      "No public DNS record at all. Access enforces identity and device-posture policy in front of the Tunnel hostname, replacing a traditional site-to-site VPN client for this specific application.",
    href: "/learn/zero-trust",
    linkLabel: "Zero Trust module",
  },
  {
    title: "Connect an entire on-prem site to the rest of the network",
    diagram: "On-prem site <-> Cloudflare WAN (formerly Magic WAN) <-> Cloudflare edge <-> other sites/cloud",
    body:
      "A different problem from exposing one app: Cloudflare WAN (formerly Magic WAN) is a standalone WAN-as-a-Service product that connects entire sites, offices, and cloud resources through Cloudflare's network, replacing MPLS/backhaul-style site-to-site connectivity — inline security policy applies at the nearest Cloudflare location rather than a central hub.",
    href: null,
    linkLabel: null,
  },
  {
    title: "Protect an entire on-prem IP range from DDoS, not just one app",
    diagram: "Internet -> Cloudflare (BGP-announced prefix) -> GRE/IPsec tunnel -> On-prem network",
    body:
      "Magic Transit announces your own IP prefix via BGP so all traffic to that range routes through Cloudflare's network for DDoS mitigation before reaching you — a network-layer, whole-prefix control, distinct from proxying individual hostnames or applications.",
    href: "/architecture/network-flows",
    linkLabel: "Network Flows",
  },
];

export default function OnPremPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">On-Prem + Cloudflare</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Four genuinely different problems get lumped together as &quot;on-prem + Cloudflare&quot; — exposing
          one app, granting remote access, connecting a whole site, and protecting an entire IP range each
          need a different product.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {PATTERNS.map((p) => (
          <Card key={p.title}>
            <CardContent className="flex flex-col gap-3 pt-6">
              <h2 className="text-base font-semibold">{p.title}</h2>
              <AsciiDiagram className="text-xs">{p.diagram}</AsciiDiagram>
              <p className="text-sm text-muted-foreground">{p.body}</p>
              {p.href && (
                <Button asChild size="sm" variant="outline" className="w-fit gap-1.5">
                  <Link href={p.href}>
                    {p.linkLabel} <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <SourceVerification
          sources={[
            { title: "Cloudflare Tunnel", url: "https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/", sourceType: "cloudflare-documentation" },
            { title: "Cloudflare WAN (formerly Magic WAN)", url: "https://developers.cloudflare.com/magic-wan/", sourceType: "cloudflare-documentation" },
            { title: "Magic Transit overview", url: "https://developers.cloudflare.com/magic-transit/", sourceType: "cloudflare-documentation" },
          ]}
          lastVerified="2026-08-23"
        />
      </div>
    </div>
  );
}

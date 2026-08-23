import { ComingSoon } from "@/components/coming-soon";

export default function Page() {
  return (
    <ComingSoon
      title="On-Prem + Cloudflare"
      description="Detailed patterns for connecting on-premises datacenters to Cloudflare, including Magic WAN and dedicated network interconnects."
      suggestedHref="/learn/tunnel"
      suggestedLabel="See the Cloudflare Tunnel module"
    />
  );
}

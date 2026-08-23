import { ComingSoon } from "@/components/coming-soon";

export default function Page() {
  return (
    <ComingSoon
      title="Hybrid Cloud"
      description="Deep-dive reference architectures spanning multiple clouds and on-prem infrastructure behind a single Cloudflare edge."
      suggestedHref="/scenarios#hybrid-datacenter"
      suggestedLabel="See the Hybrid Datacenter scenario"
    />
  );
}

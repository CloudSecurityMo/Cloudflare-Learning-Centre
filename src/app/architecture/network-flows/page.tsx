import { ComingSoon } from "@/components/coming-soon";

export default function Page() {
  return (
    <ComingSoon
      title="Network Flows"
      description="Detailed packet-level and connection-level flow diagrams for L3/L4 traffic through Cloudflare, including Spectrum and Magic Transit paths."
      suggestedHref="/architecture/deployment-models"
      suggestedLabel="See Deployment Models instead"
    />
  );
}

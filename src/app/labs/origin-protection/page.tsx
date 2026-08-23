import { ComingSoon } from "@/components/coming-soon";

export default function Page() {
  return (
    <ComingSoon
      title="Origin Protection Lab"
      description="An interactive lab for discovering and closing origin IP exposure — simulating Certificate Transparency searches, stale DNS records, and firewall audits."
      suggestedHref="/labs/troubleshooting"
      suggestedLabel="See the 'Origin IP is exposed' incident"
    />
  );
}

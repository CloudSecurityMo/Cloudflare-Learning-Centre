import { ComingSoon } from "@/components/coming-soon";

export default function Page() {
  return (
    <ComingSoon
      title="Rate Limiting Lab"
      description="An interactive threshold-tuning lab — simulate traffic patterns and see how key/period/threshold choices affect false positives and abuse coverage."
      suggestedHref="/learn/rate-limiting"
      suggestedLabel="See the Rate Limiting module"
    />
  );
}

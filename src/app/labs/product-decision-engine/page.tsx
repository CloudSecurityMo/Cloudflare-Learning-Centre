import { ProductDecisionEngine } from "@/components/labs/product-decision-engine";

export default function ProductDecisionEnginePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Which Cloudflare Capability Do I Need?</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Given a requirement, pick the Cloudflare capability (or capabilities) that actually satisfy it.
          The goal is architectural judgement, not memorization.
        </p>
      </div>
      <ProductDecisionEngine />
    </div>
  );
}

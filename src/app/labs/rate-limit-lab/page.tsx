import { RateLimitLab } from "@/components/labs/rate-limit-lab";

export default function RateLimitLabPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Rate Limiting Lab</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Tune a threshold and period against a legitimate traffic pattern and an attack pattern, and see the
          false-positive / miss trade-off play out.
        </p>
      </div>
      <RateLimitLab />
    </div>
  );
}

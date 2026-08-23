import { OriginInspector } from "@/components/labs/origin-inspector";

export default function OriginInspectorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Origin Inspector</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          What does your origin actually receive after Cloudflare processes a request? See the headers, and
          compare a correctly configured origin against a common misconfiguration.
        </p>
      </div>
      <OriginInspector />
    </div>
  );
}

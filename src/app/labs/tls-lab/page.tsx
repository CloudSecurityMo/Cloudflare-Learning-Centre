import { TlsLab } from "@/components/labs/tls-lab";

export default function TlsLabPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">TLS Lab</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Combine an SSL/TLS mode with an origin certificate state and see exactly what happens on each leg —
          including how 525 and 526 errors actually occur.
        </p>
      </div>
      <TlsLab />
    </div>
  );
}

import { DnsLab } from "@/components/labs/dns-lab";

export default function DnsLabPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">DNS Lab</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Toggle each record between Proxied and DNS-only and see exactly what changes in the request path.
        </p>
      </div>
      <DnsLab />
    </div>
  );
}

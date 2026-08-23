import { OriginProtectionLab } from "@/components/labs/origin-protection-lab";

export default function OriginProtectionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Origin Protection Lab</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Toggle real architectural controls and see whether an attacker who finds your origin IP can still
          reach it directly, bypassing every Cloudflare product.
        </p>
      </div>
      <OriginProtectionLab />
    </div>
  );
}

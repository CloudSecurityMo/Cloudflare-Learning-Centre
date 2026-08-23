import { WafRuleBuilder } from "@/components/labs/waf-rule-builder";

export default function WafLabPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">WAF Rule Builder</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Construct a Cloudflare-style Custom Rule from fields, operators, and an action — and see the
          resulting expression exactly as it would appear in the rules language.
        </p>
      </div>
      <WafRuleBuilder />
    </div>
  );
}

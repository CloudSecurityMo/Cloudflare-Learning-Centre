import { CF_ERROR_CODES } from "@/content/reference/codes";
import { Card, CardContent } from "@/components/ui/card";

export default function ErrorCodesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Cloudflare Error Codes</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          The 520-526 family — Cloudflare-generated errors indicating a problem reaching or trusting the
          origin, distinct from a normal origin 5xx.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {CF_ERROR_CODES.map((e) => (
          <Card key={e.code}>
            <CardContent className="pt-6">
              <div className="mb-1 flex items-baseline gap-2">
                <span className="font-mono text-lg font-semibold text-status-block">{e.code}</span>
                <span className="text-sm font-semibold">{e.label}</span>
              </div>
              <p className="mb-2 text-sm text-muted-foreground">{e.meaning}</p>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Common causes
              </div>
              <ul className="mt-1 flex flex-col gap-0.5 text-sm text-muted-foreground">
                {e.commonCauses.map((c, i) => <li key={i}>• {c}</li>)}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

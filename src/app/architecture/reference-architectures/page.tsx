import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DEPLOYMENT_MODELS } from "@/content/architecture/deployment-models";
import { Card, CardContent } from "@/components/ui/card";

export default function ReferenceArchitecturesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Reference Architectures</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Curated, interactive breakdowns of the six most common Cloudflare deployment patterns. Each links
          to the full request-path diagram in Deployment Models.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {DEPLOYMENT_MODELS.map((m) => (
          <Link key={m.id} href={`/architecture/deployment-models?model=${m.id}`} className="group">
            <Card className="h-full transition-colors group-hover:border-brand/50">
              <CardContent className="flex flex-col gap-2 pt-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">Model {m.letter}</span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="text-sm font-semibold">{m.title}</div>
                <p className="text-xs text-muted-foreground">{m.summary}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

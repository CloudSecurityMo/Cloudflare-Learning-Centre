"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getNodeDetail } from "@/content/nodes";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function NodeDetailSheet({
  slug,
  open,
  onOpenChange,
}: {
  slug: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const detail = slug ? getNodeDetail(slug) : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {detail && (
          <>
            <SheetHeader>
              <SheetTitle className="text-xl">{detail.label}</SheetTitle>
              <SheetDescription>{detail.whereItSits}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-5 px-4 pb-6">
              <Field label="What it sees">{detail.sees}</Field>
              <Field label="What it protects">{detail.protects}</Field>
              <Field label="What it does NOT protect">{detail.doesNotProtect}</Field>
              <Field label="Configured by">{detail.configuredBy}</Field>
              <Field label="Logs / analytics">{detail.logs}</Field>
              {detail.commonMistakes.length > 0 && (
                <div>
                  <FieldLabel>Common mistakes</FieldLabel>
                  <ul className="mt-1 flex flex-col gap-1">
                    {detail.commonMistakes.map((m, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {m}</li>
                    ))}
                  </ul>
                </div>
              )}
              {detail.exampleAttack && (
                <div>
                  <FieldLabel>Example attack</FieldLabel>
                  <pre className="mt-1 overflow-x-auto rounded-md border border-status-block/30 bg-status-block/10 p-3 font-mono text-xs">
                    {detail.exampleAttack}
                  </pre>
                </div>
              )}
              {detail.exampleLegit && (
                <div>
                  <FieldLabel>Example legitimate request</FieldLabel>
                  <pre className="mt-1 overflow-x-auto rounded-md border border-status-allow/30 bg-status-allow/10 p-3 font-mono text-xs">
                    {detail.exampleLegit}
                  </pre>
                </div>
              )}
              {detail.learnMoreSlug && (
                <>
                  <Separator />
                  <Button asChild variant="outline" size="sm" className="w-fit gap-1.5">
                    <Link href={`/learn/${detail.learnMoreSlug}`}>
                      Full module <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <p className="mt-1 text-sm leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}

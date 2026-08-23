import Link from "next/link";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ComingSoon({
  title,
  description,
  suggestedHref,
  suggestedLabel,
}: {
  title: string;
  description: string;
  suggestedHref?: string;
  suggestedLabel?: string;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Construction className="size-5" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <p className="text-xs text-muted-foreground">
        Planned for a later development phase — see the roadmap in the project README.
      </p>
      {suggestedHref && (
        <Button asChild variant="outline" size="sm">
          <Link href={suggestedHref}>{suggestedLabel ?? "Explore related content"}</Link>
        </Button>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

export function AsciiDiagram({ children, className }: { children: string; className?: string }) {
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-[12px] leading-relaxed text-foreground/90",
        className
      )}
    >
      {children}
    </pre>
  );
}

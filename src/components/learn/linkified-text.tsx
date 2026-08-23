import Link from "next/link";
import type { TextSegment } from "@/lib/inline-links";

export function LinkifiedText({ segments }: { segments: TextSegment[] }) {
  return (
    <>
      {segments.map((seg, i) =>
        seg.href ? (
          <Link
            key={i}
            href={seg.href}
            className="underline decoration-muted-foreground/40 decoration-dotted underline-offset-2 transition-colors hover:text-brand hover:decoration-brand"
          >
            {seg.text}
          </Link>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}

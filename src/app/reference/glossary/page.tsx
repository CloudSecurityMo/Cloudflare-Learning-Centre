import { GlossaryBrowser } from "@/components/reference/glossary-browser";

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Glossary</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every technical term used across the lab, searchable and cross-linked.
        </p>
      </div>
      <GlossaryBrowser />
    </div>
  );
}

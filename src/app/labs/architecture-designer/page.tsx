import { ArchitectureDesigner } from "@/components/labs/architecture-designer";

export default function ArchitectureDesignerPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Design the Solution</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pick a requirement, configure an architecture, and see a conceptual score against what that
          requirement actually needs.
        </p>
      </div>
      <ArchitectureDesigner />
    </div>
  );
}

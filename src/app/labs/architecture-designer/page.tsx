import { ArchitectureDesigner } from "@/components/labs/architecture-designer";
import { ArchitectureReview } from "@/components/labs/architecture-review";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ArchitectureDesignerPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Architecture Designer</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Design a solution from a set of requirements, or review an existing architecture and identify its
          real concerns.
        </p>
      </div>

      <Tabs defaultValue="design">
        <TabsList className="mb-6">
          <TabsTrigger value="design">Design Mode</TabsTrigger>
          <TabsTrigger value="review">Review Mode</TabsTrigger>
        </TabsList>
        <TabsContent value="design">
          <ArchitectureDesigner />
        </TabsContent>
        <TabsContent value="review">
          <ArchitectureReview />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { ScenarioLibrary } from "@/components/scenarios/scenario-library";

export default function ScenariosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Scenario Library</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Realistic deployment scenarios. For each: how would you deploy this through Cloudflare?
        </p>
      </div>
      <ScenarioLibrary />
    </div>
  );
}

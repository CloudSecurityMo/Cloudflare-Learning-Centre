import { TroubleshootingLab } from "@/components/labs/troubleshooting-lab";

export default function TroubleshootingLabPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Troubleshooting Academy</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Ten simulated production incidents. Read the symptom and evidence, form a hypothesis, then reveal
          the diagnosis to check your reasoning.
        </p>
      </div>
      <TroubleshootingLab />
    </div>
  );
}

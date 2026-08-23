import { RequestSimulator } from "@/components/labs/request-simulator";

export default function RequestFlowSimulatorPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Request Decision Engine</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Construct a request — method, hostname, path, country, source IP, User-Agent, bot score, request
          rate — send it, and inspect exactly which control made each decision, on what evidence, and what
          logs would show it. Change any field and re-evaluate to see how the outcome changes.
        </p>
      </div>
      <RequestSimulator />
    </div>
  );
}

import { RequestSimulator } from "@/components/labs/request-simulator";

export default function RequestFlowSimulatorPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Request Lifecycle Simulator</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Build a request, send it, and watch exactly where it gets inspected, cached, challenged, or blocked —
          one stage at a time. Change the request and toggles to see how the outcome changes.
        </p>
      </div>
      <RequestSimulator />
    </div>
  );
}

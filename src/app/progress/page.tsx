import { ProgressTracker } from "@/components/progress/progress-tracker";

export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Progress Tracker</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every module, lab, and scenario in one place. Check things off as you go, or open one directly.
        </p>
      </div>
      <ProgressTracker />
    </div>
  );
}

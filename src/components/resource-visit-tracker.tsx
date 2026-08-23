"use client";

import * as React from "react";
import { useProgress } from "@/lib/progress";

// Mount on any page that's referenced as an Architect-level target (via
// architectHref) but isn't itself a lab — e.g. /architecture/deployment-models.
// Marks the page's pathname as visited so the three-level learning bar on
// any topic linking here can show the Architect level as reached.
export function ResourceVisitTracker({ path }: { path: string }) {
  const markResourceVisited = useProgress((s) => s.markResourceVisited);
  React.useEffect(() => {
    markResourceVisited(path);
  }, [markResourceVisited, path]);
  return null;
}

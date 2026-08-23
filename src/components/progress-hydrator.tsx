"use client";

import * as React from "react";
import { useProgress } from "@/lib/progress";

// persist() is configured with skipHydration: true (see lib/progress.ts) so the
// first client render matches SSR exactly. This component triggers the real
// rehydration from localStorage right after mount, once hydration is done.
export function ProgressHydrator() {
  React.useEffect(() => {
    useProgress.persist.rehydrate();
  }, []);
  return null;
}

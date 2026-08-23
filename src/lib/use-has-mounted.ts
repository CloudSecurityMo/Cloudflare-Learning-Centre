"use client";

import * as React from "react";

function noopSubscribe() {
  return () => {};
}

/**
 * True only after the component has mounted on the client. Use this to gate
 * any render output that depends on browser-only state (localStorage, the
 * current date/time, etc.) so the first client render matches SSR exactly —
 * see the write-ups in theme-toggle.tsx and lib/progress.ts for why this
 * matters (avoids React hydration mismatches).
 */
export function useHasMounted() {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

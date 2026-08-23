const DEFAULT_THRESHOLD_MONTHS = 6;

export interface FreshnessInfo {
  daysSinceVerified: number;
  stale: boolean;
}

/** Parses "YYYY-MM-DD" without timezone surprises (avoids new Date("YYYY-MM-DD") UTC-midnight footguns). */
function parseDateOnly(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const [, y, mo, d] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d));
}

/**
 * Only call this on the client, after mount (see useHasMounted) — comparing
 * against "now" during SSR would bake in the build-time date, which can
 * differ from the viewer's clock and trip a hydration mismatch right at the
 * threshold boundary.
 */
export function getFreshness(lastVerified: string | undefined, thresholdMonths = DEFAULT_THRESHOLD_MONTHS): FreshnessInfo | null {
  if (!lastVerified) return null;
  const verified = parseDateOnly(lastVerified);
  if (!verified) return null;
  const now = new Date();
  const daysSinceVerified = Math.floor((now.getTime() - verified.getTime()) / (1000 * 60 * 60 * 24));
  const thresholdDays = thresholdMonths * 30;
  return { daysSinceVerified, stale: daysSinceVerified > thresholdDays };
}

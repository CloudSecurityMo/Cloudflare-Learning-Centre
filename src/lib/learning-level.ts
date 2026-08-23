import { LABS } from "@/lib/labs";

/**
 * Resolves an Apply/Architect href to something we can actually observe
 * completion for. Lab hrefs (/labs/xxx) map to a LABS slug, checked against
 * labsCompleted. Everything else (e.g. /architecture/deployment-models,
 * optionally with a query string) is tracked as a "visited resource" keyed
 * by its pathname, shared across every topic that links to it.
 */
export type LevelTarget = { kind: "lab"; slug: string } | { kind: "resource"; path: string } | { kind: "none" };

export function resolveLevelTarget(href: string | undefined): LevelTarget {
  if (!href) return { kind: "none" };
  const path = href.split("?")[0];
  const lab = LABS.find((l) => l.href === path);
  if (lab) return { kind: "lab", slug: lab.slug };
  return { kind: "resource", path };
}

export function isLevelDone(
  target: LevelTarget,
  labsCompleted: Record<string, boolean>,
  visitedResources: Record<string, boolean>
): boolean {
  if (target.kind === "lab") return !!labsCompleted[target.slug];
  if (target.kind === "resource") return !!visitedResources[target.path];
  return false;
}

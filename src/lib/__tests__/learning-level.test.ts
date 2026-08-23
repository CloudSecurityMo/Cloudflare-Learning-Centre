import { describe, it, expect } from "vitest";
import { resolveLevelTarget, isLevelDone } from "../learning-level";
import { LABS } from "../labs";

describe("resolveLevelTarget", () => {
  it("returns 'none' for an undefined href", () => {
    expect(resolveLevelTarget(undefined)).toEqual({ kind: "none" });
  });

  it("resolves a lab href to its LABS slug", () => {
    const firstLab = LABS[0];
    expect(resolveLevelTarget(firstLab.href)).toEqual({ kind: "lab", slug: firstLab.slug });
  });

  it("strips a query string before matching a lab href", () => {
    const firstLab = LABS[0];
    expect(resolveLevelTarget(`${firstLab.href}?foo=bar`)).toEqual({ kind: "lab", slug: firstLab.slug });
  });

  it("treats a non-lab href as a tracked resource, with the query string stripped", () => {
    expect(resolveLevelTarget("/architecture/deployment-models?model=tunnel")).toEqual({
      kind: "resource",
      path: "/architecture/deployment-models",
    });
  });
});

describe("isLevelDone", () => {
  it("is false for 'none' targets", () => {
    expect(isLevelDone({ kind: "none" }, {}, {})).toBe(false);
  });

  it("reflects labsCompleted for lab targets", () => {
    const target = { kind: "lab" as const, slug: "dns-lab" };
    expect(isLevelDone(target, {}, {})).toBe(false);
    expect(isLevelDone(target, { "dns-lab": true }, {})).toBe(true);
  });

  it("reflects visitedResources for resource targets", () => {
    const target = { kind: "resource" as const, path: "/architecture/deployment-models" };
    expect(isLevelDone(target, {}, {})).toBe(false);
    expect(isLevelDone(target, {}, { "/architecture/deployment-models": true })).toBe(true);
  });
});

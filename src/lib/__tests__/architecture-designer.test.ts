import { describe, it, expect } from "vitest";
import {
  DEFAULT_SELECTIONS,
  REQUIREMENTS,
  grantedTags,
  scoreRequirement,
  type Selections,
} from "../architecture-designer";

describe("grantedTags", () => {
  it("grants nothing when DNS is DNS-only, regardless of other selections", () => {
    const selections: Selections = {
      ...DEFAULT_SELECTIONS,
      dns: "dns-only",
      tls: "full-strict",
      waf: "managed-custom",
    };
    expect(grantedTags(selections).size).toBe(0);
  });

  it("grants tags from every category once proxied", () => {
    const selections: Selections = {
      ...DEFAULT_SELECTIONS,
      dns: "proxied",
      tls: "full-strict",
      waf: "managed-custom",
      origin: "tunnel",
    };
    const tags = grantedTags(selections);
    expect(tags.has("edge-visibility")).toBe(true);
    expect(tags.has("tls-origin-validated")).toBe(true);
    expect(tags.has("waf-policy")).toBe(true);
    expect(tags.has("no-inbound-exposure")).toBe(true);
  });
});

describe("scoreRequirement", () => {
  it("scores 0% for the default (all-disabled) selections", () => {
    const requirement = REQUIREMENTS[0];
    const result = scoreRequirement(requirement, DEFAULT_SELECTIONS);
    expect(result.percent).toBe(0);
    expect(result.bypassedEdge).toBe(true);
  });

  it("scores 100% for each requirement's own ideal selections", () => {
    for (const requirement of REQUIREMENTS) {
      const result = scoreRequirement(requirement, requirement.idealSelections);
      expect(result.percent, `requirement "${requirement.id}" should score 100% against its own ideal selections`).toBe(100);
      expect(result.missing).toEqual([]);
    }
  });

  it("every requirement's idealSelections only reference option ids that actually exist", () => {
    // Guards against a category/option rename in architecture-designer.ts silently
    // breaking a requirement's idealSelections (TypeScript won't catch a typo'd
    // option id since Selections values are plain strings).
    for (const requirement of REQUIREMENTS) {
      const result = scoreRequirement(requirement, requirement.idealSelections);
      expect(result.percent).toBeGreaterThan(0);
    }
  });
});

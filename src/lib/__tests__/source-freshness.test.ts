import { describe, it, expect } from "vitest";
import { getFreshness } from "../source-freshness";

describe("getFreshness", () => {
  it("returns null when no date is given", () => {
    expect(getFreshness(undefined)).toBeNull();
  });

  it("returns null for an unparseable date", () => {
    expect(getFreshness("not-a-date")).toBeNull();
  });

  it("is not stale for a date verified today", () => {
    const today = new Date().toISOString().slice(0, 10);
    const info = getFreshness(today);
    expect(info?.stale).toBe(false);
    expect(info?.daysSinceVerified).toBe(0);
  });

  it("is stale for a date more than 6 months (default threshold) ago", () => {
    const old = new Date();
    old.setFullYear(old.getFullYear() - 1);
    const iso = old.toISOString().slice(0, 10);
    const info = getFreshness(iso);
    expect(info?.stale).toBe(true);
  });

  it("respects a custom threshold", () => {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const iso = twoMonthsAgo.toISOString().slice(0, 10);
    expect(getFreshness(iso, 1)?.stale).toBe(true);
    expect(getFreshness(iso, 6)?.stale).toBe(false);
  });
});

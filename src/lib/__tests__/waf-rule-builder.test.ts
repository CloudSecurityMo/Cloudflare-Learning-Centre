import { describe, it, expect } from "vitest";
import { buildApiCall, buildExpression, buildTerraform, type Condition } from "../waf-rule-builder";

describe("buildExpression", () => {
  it("returns an empty string with no conditions", () => {
    expect(buildExpression([], "and")).toBe("");
  });

  it("ignores conditions with an empty value", () => {
    const conditions: Condition[] = [{ id: "1", fieldKey: "path", operator: "eq", value: "" }];
    expect(buildExpression(conditions, "and")).toBe("");
  });

  it("builds a single-condition expression without parens", () => {
    const conditions: Condition[] = [{ id: "1", fieldKey: "path", operator: "eq", value: "/admin" }];
    expect(buildExpression(conditions, "and")).toBe('http.request.uri.path eq "/admin"');
  });

  it("formats a list ('in') operator as a Cloudflare set literal", () => {
    const conditions: Condition[] = [{ id: "1", fieldKey: "country", operator: "in", value: "CN, RU" }];
    expect(buildExpression(conditions, "and")).toBe('ip.geoip.country in {"CN" "RU"}');
  });

  it("formats a number field without quotes", () => {
    const conditions: Condition[] = [{ id: "1", fieldKey: "botscore", operator: "lt", value: "30" }];
    expect(buildExpression(conditions, "and")).toBe("cf.bot_management.score lt 30");
  });

  it("joins multiple conditions with the chosen combinator, parenthesized", () => {
    const conditions: Condition[] = [
      { id: "1", fieldKey: "path", operator: "eq", value: "/admin" },
      { id: "2", fieldKey: "country", operator: "in", value: "CN" },
    ];
    const expr = buildExpression(conditions, "and");
    expect(expr).toBe('(http.request.uri.path eq "/admin")\nand (ip.geoip.country in {"CN"})');
  });
});

describe("buildTerraform / buildApiCall", () => {
  it("maps the UI action label to the correct Cloudflare API action string in both outputs", () => {
    const tf = buildTerraform('http.request.uri.path eq "/admin"', "Managed Challenge");
    const api = buildApiCall('http.request.uri.path eq "/admin"', "Managed Challenge");
    expect(tf).toContain('action      = "managed_challenge"');
    expect(api).toContain('"action": "managed_challenge"');
  });

  it("falls back to a placeholder expression when none is provided", () => {
    const tf = buildTerraform("", "Block");
    expect(tf).toContain("/admin");
  });

  it("escapes embedded quotes in the API call body", () => {
    const api = buildApiCall('http.request.uri.path eq "/admin"', "Block");
    expect(api).toContain('\\"/admin\\"');
  });
});

export interface FieldDef {
  key: string;
  label: string;
  expr: string; // Cloudflare-style field expression
  kind: "string" | "list" | "number";
  placeholder: string;
}

export const FIELDS: FieldDef[] = [
  { key: "hostname", label: "Hostname", expr: "http.host", kind: "string", placeholder: "app.example.com" },
  { key: "path", label: "URI Path", expr: "http.request.uri.path", kind: "string", placeholder: "/admin" },
  { key: "method", label: "HTTP Method", expr: "http.request.method", kind: "string", placeholder: "POST" },
  { key: "country", label: "Country (geoip)", expr: "ip.geoip.country", kind: "list", placeholder: "CN, RU" },
  { key: "ip", label: "Source IP", expr: "ip.src", kind: "list", placeholder: "203.0.113.5" },
  { key: "asn", label: "ASN", expr: "ip.geoip.asnum", kind: "number", placeholder: "13335" },
  { key: "header", label: "Header value (X-Custom)", expr: "http.request.headers[\"x-custom\"][0]", kind: "string", placeholder: "internal-tool" },
  { key: "query", label: "Query string contains", expr: "http.request.uri.query", kind: "string", placeholder: "debug=true" },
  { key: "botscore", label: "Bot score (< value)", expr: "cf.bot_management.score", kind: "number", placeholder: "30" },
  { key: "httpversion", label: "HTTP Version", expr: "http.request.version", kind: "string", placeholder: "HTTP/1.1" },
  { key: "tlsversion", label: "TLS Version", expr: "cf.tls_version", kind: "string", placeholder: "TLSv1.3" },
];

export type Operator = "eq" | "ne" | "contains" | "in" | "lt" | "gt";

export const OPERATORS_FOR_KIND: Record<FieldDef["kind"], { value: Operator; label: string }[]> = {
  string: [
    { value: "eq", label: "equals" },
    { value: "ne", label: "does not equal" },
    { value: "contains", label: "contains" },
  ],
  list: [
    { value: "in", label: "in" },
  ],
  number: [
    { value: "lt", label: "less than" },
    { value: "gt", label: "greater than" },
    { value: "eq", label: "equals" },
  ],
};

export interface Condition {
  id: string;
  fieldKey: string;
  operator: Operator;
  value: string;
}

export type Action = "Block" | "Managed Challenge" | "JS Challenge" | "Interactive Challenge" | "Skip" | "Log";

export const ACTIONS: Action[] = ["Block", "Managed Challenge", "JS Challenge", "Interactive Challenge", "Skip", "Log"];

function formatValue(field: FieldDef, operator: Operator, value: string): string {
  if (operator === "in") {
    const items = value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => `"${v}"`);
    return `{${items.join(" ")}}`;
  }
  if (field.kind === "number") return value || "0";
  return `"${value}"`;
}

const OP_SYMBOL: Record<Operator, string> = {
  eq: "eq",
  ne: "ne",
  contains: "contains",
  in: "in",
  lt: "lt",
  gt: "gt",
};

export function buildExpression(conditions: Condition[], combinator: "and" | "or"): string {
  const parts = conditions
    .filter((c) => c.value.trim() !== "")
    .map((c) => {
      const field = FIELDS.find((f) => f.key === c.fieldKey);
      if (!field) return "";
      return `${field.expr} ${OP_SYMBOL[c.operator]} ${formatValue(field, c.operator, c.value)}`;
    })
    .filter(Boolean);

  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return parts.map((p) => `(${p})`).join(combinator === "and" ? "\nand " : "\nor ");
}

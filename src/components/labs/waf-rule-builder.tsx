"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  ACTIONS,
  FIELDS,
  OPERATORS_FOR_KIND,
  buildExpression,
  type Action,
  type Condition,
  type Operator,
} from "@/lib/waf-rule-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { useProgress } from "@/lib/progress";

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `cond-${idCounter}`;
}

const ACTION_TONE: Record<Action, string> = {
  Block: "text-status-block",
  "Managed Challenge": "text-status-challenge",
  "JS Challenge": "text-status-challenge",
  Skip: "text-status-log",
  Log: "text-status-log",
  Allow: "text-status-allow",
};

export function WafRuleBuilder() {
  const [conditions, setConditions] = React.useState<Condition[]>([
    { id: nextId(), fieldKey: "path", operator: "eq", value: "/admin" },
  ]);
  const [combinator, setCombinator] = React.useState<"and" | "or">("and");
  const [action, setAction] = React.useState<Action>("Block");
  const markLabComplete = useProgress((s) => s.markLabComplete);

  React.useEffect(() => {
    markLabComplete("waf-lab");
  }, [markLabComplete]);

  function addCondition() {
    setConditions((c) => [...c, { id: nextId(), fieldKey: "country", operator: "in", value: "" }]);
  }

  function removeCondition(id: string) {
    setConditions((c) => c.filter((x) => x.id !== id));
  }

  function updateCondition(id: string, patch: Partial<Condition>) {
    setConditions((c) => c.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  const expression = buildExpression(conditions, combinator);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">IF</span>
            {conditions.length > 1 && (
              <Select value={combinator} onValueChange={(v) => setCombinator(v as "and" | "or")}>
                <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="and">AND</SelectItem>
                  <SelectItem value="or">OR</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {conditions.map((cond) => {
              const field = FIELDS.find((f) => f.key === cond.fieldKey)!;
              const ops = OPERATORS_FOR_KIND[field.kind];
              return (
                <div key={cond.id} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
                  <Select
                    value={cond.fieldKey}
                    onValueChange={(v) => {
                      const nf = FIELDS.find((f) => f.key === v)!;
                      updateCondition(cond.id, { fieldKey: v, operator: OPERATORS_FOR_KIND[nf.kind][0].value });
                    }}
                  >
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FIELDS.map((f) => (
                        <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={cond.operator} onValueChange={(v) => updateCondition(cond.id, { operator: v as Operator })}>
                    <SelectTrigger className="w-32 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ops.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    value={cond.value}
                    onChange={(e) => updateCondition(cond.id, { value: e.target.value })}
                    placeholder={field.placeholder}
                    className="font-mono text-xs"
                  />

                  <button
                    type="button"
                    onClick={() => removeCondition(cond.id)}
                    className="text-muted-foreground hover:text-status-block"
                    aria-label="Remove condition"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <Button variant="outline" size="sm" className="w-fit gap-1.5" onClick={addCondition}>
            <Plus className="size-3.5" /> Add condition
          </Button>

          <div className="flex items-center gap-3 border-t border-border pt-4">
            <span className="text-sm font-semibold">THEN</span>
            <Select value={action} onValueChange={(v) => setAction(v as Action)}>
              <SelectTrigger className="w-48 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ACTIONS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Resulting expression
          </div>
          <AsciiDiagram>
            {(expression || "// add a condition value") + `\n\n→ ${action}`}
          </AsciiDiagram>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">
          <p className="mb-2">
            This mirrors Cloudflare&apos;s WAF Custom Rules expression syntax for teaching purposes — field
            names are illustrative of the real rules language shape, not a guarantee of exact current syntax.
            Always verify against{" "}
            <a
              href="https://developers.cloudflare.com/ruleset-engine/rules-language/fields/"
              target="_blank"
              rel="noreferrer"
              className="text-brand hover:underline"
            >
              current Cloudflare documentation
            </a>{" "}
            before applying a real rule.
          </p>
          <p className={ACTION_TONE[action]}>
            {action === "Block" && "Block: the request is stopped and a block response is returned — nothing downstream sees it."}
            {action === "Managed Challenge" && "Managed Challenge: Cloudflare picks the least-intrusive challenge based on the client's signals."}
            {action === "JS Challenge" && "JS Challenge: requires JavaScript execution — filters out simple scripts, adds friction for real users."}
            {action === "Skip" && "Skip: deliberately bypasses other specified security products for matching traffic — powerful, and easy to over-scope."}
            {action === "Log" && "Log: takes no blocking action, just records a Security Event — useful for testing a rule before enforcing it."}
            {action === "Allow" && "Allow: explicitly permits matching traffic, useful to carve out exceptions ahead of a broader block rule."}
          </p>
        </div>
      </div>
    </div>
  );
}

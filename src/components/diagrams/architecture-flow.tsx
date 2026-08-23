"use client";

import * as React from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  type Edge,
  type Node,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import type { FlowEdge, FlowNode } from "@/content/architecture/deployment-models";
import { NodeDetailSheet } from "@/components/diagrams/node-detail-sheet";
import { getNodeDetail } from "@/content/nodes";
import { cn } from "@/lib/utils";

function LabNode({ data }: NodeProps<{ label: string; variant?: FlowNode["variant"]; clickable: boolean }>) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-center text-xs font-medium leading-snug shadow-sm transition-colors",
        data.variant === "brand"
          ? "border-brand/60 bg-brand/10 text-foreground"
          : "border-border bg-card text-foreground",
        data.clickable && "cursor-pointer hover:border-brand/60 hover:bg-accent/40"
      )}
      style={{ minWidth: 160, whiteSpace: "pre-line" }}
    >
      <Handle type="target" position={Position.Top} className="!bg-border" />
      {data.label}
      <Handle type="source" position={Position.Bottom} className="!bg-border" />
    </div>
  );
}

const nodeTypes = { lab: LabNode };

export function ArchitectureFlow({ nodes, edges }: { nodes: FlowNode[]; edges: FlowEdge[] }) {
  const [active, setActive] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const rfNodes: Node[] = React.useMemo(
    () =>
      nodes.map((n) => ({
        id: n.id,
        type: "lab",
        position: { x: n.x, y: n.y },
        data: { label: n.label, variant: n.variant, clickable: !!n.detailSlug && !!getNodeDetail(n.detailSlug) },
        draggable: false,
      })),
    [nodes]
  );

  const rfEdges: Edge[] = React.useMemo(
    () =>
      edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: true,
        style: { stroke: "var(--border)" },
        labelStyle: { fontSize: 10, fill: "var(--muted-foreground)" },
      })),
    [edges]
  );

  function handleNodeClick(_: unknown, node: Node) {
    const source = nodes.find((n) => n.id === node.id);
    if (source?.detailSlug && getNodeDetail(source.detailSlug)) {
      setActive(source.detailSlug);
      setOpen(true);
    }
  }

  return (
    <div className="h-[520px] w-full rounded-xl border border-border bg-grid">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
        edgesFocusable={false}
        elementsSelectable
      >
        <Background gap={20} color="var(--border)" />
        <Controls showInteractive={false} />
      </ReactFlow>
      <NodeDetailSheet slug={active} open={open} onOpenChange={setOpen} />
    </div>
  );
}

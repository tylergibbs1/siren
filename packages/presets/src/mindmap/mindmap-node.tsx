"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

export type MindmapVariant = "default" | "primary" | "success" | "warning" | "danger";

export type MindmapNodeData = {
  label: string;
  depth: number;
  variant?: MindmapVariant;
  level?: number;
};

export type MindmapNodeType = Node<MindmapNodeData, "mindmap">;

const VARIANT_COLORS: Record<MindmapVariant, string> = {
  default: "var(--siren-primary, #0090ff)",
  primary: "var(--siren-primary, #0090ff)",
  success: "var(--siren-success, #22c55e)",
  warning: "var(--siren-warning, #f59e0b)",
  danger: "var(--siren-danger, #ef4444)",
};

const DEPTH_STYLES: Array<{
  color: string;
  fontSize: string;
  fontWeight: number;
  padding: string;
  borderRadius: string;
}> = [
  {
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 500,
    padding: "12px 28px",
    borderRadius: "24px",
  },
  {
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 500,
    padding: "8px 20px",
    borderRadius: "20px",
  },
  {
    color: "var(--siren-text, hsl(0 0% 98%))",
    fontSize: "12px",
    fontWeight: 400,
    padding: "6px 16px",
    borderRadius: "16px",
  },
];

function MindmapNodeComponent({ data }: NodeProps<MindmapNodeType>) {
  const depth = data.level ?? data.depth ?? 0;
  const styleIndex = Math.min(depth, DEPTH_STYLES.length - 1);
  const s = DEPTH_STYLES[styleIndex];
  const variant = data.variant ?? "default";

  // For depth >= 2 (leaf), use a lighter node style; otherwise use variant color
  const bg =
    depth >= 2
      ? "var(--siren-node-border, hsl(0 0% 18%))"
      : VARIANT_COLORS[variant];

  // For depth 1, reduce opacity slightly to distinguish from root
  const opacity = depth === 1 ? 0.8 : 1;

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ visibility: "hidden" }}
      />
      <div
        style={{
          padding: s.padding,
          borderRadius: s.borderRadius,
          background: bg,
          color: s.color,
          fontFamily: "var(--siren-font, system-ui)",
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          textAlign: "center",
          whiteSpace: "nowrap",
          letterSpacing: "0.01em",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          opacity,
        }}
      >
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ visibility: "hidden" }}
      />
    </>
  );
}

export const MindmapNode = memo(MindmapNodeComponent);
(MindmapNode as any).displayName = "MindmapNode";

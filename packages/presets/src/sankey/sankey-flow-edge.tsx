"use client";

import { memo } from "react";
import { type EdgeProps, type Edge } from "@xyflow/react";

export type SankeyFlowData = {
  value: number;
  maxValue: number;
};

export type SankeyFlowEdgeType = Edge<SankeyFlowData, "sankey-flow">;

const FLOW_COLORS = [
  "rgba(59, 130, 246, 0.3)",  // blue
  "rgba(34, 197, 94, 0.3)",   // green
  "rgba(245, 158, 11, 0.3)",  // amber
  "rgba(139, 92, 246, 0.3)",  // purple
  "rgba(6, 182, 212, 0.3)",   // cyan
  "rgba(239, 68, 68, 0.3)",   // red
];

function SankeyFlowEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  style,
}: EdgeProps<SankeyFlowEdgeType>) {
  const value = data?.value ?? 10;
  const maxValue = data?.maxValue ?? 100;
  // Width proportional to flow value, with min/max bounds
  const strokeWidth = Math.max(4, Math.min(60, (value / maxValue) * 60));

  // Generate a hash for consistent coloring
  const colorIndex =
    (id.charCodeAt(0) + (id.charCodeAt(1) || 0)) % FLOW_COLORS.length;
  const fillColor = FLOW_COLORS[colorIndex];

  // Build a thick bezier path
  const midX = (sourceX + targetX) / 2;

  const path = [
    `M ${sourceX} ${sourceY - strokeWidth / 2}`,
    `C ${midX} ${sourceY - strokeWidth / 2}, ${midX} ${targetY - strokeWidth / 2}, ${targetX} ${targetY - strokeWidth / 2}`,
    `L ${targetX} ${targetY + strokeWidth / 2}`,
    `C ${midX} ${targetY + strokeWidth / 2}, ${midX} ${sourceY + strokeWidth / 2}, ${sourceX} ${sourceY + strokeWidth / 2}`,
    `Z`,
  ].join(" ");

  return (
    <path
      id={id}
      d={path}
      fill={fillColor}
      stroke="none"
      style={style}
    />
  );
}

export const SankeyFlowEdge = memo(SankeyFlowEdgeComponent);
(SankeyFlowEdge as any).displayName = "SankeyFlowEdge";

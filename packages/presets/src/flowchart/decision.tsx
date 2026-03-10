"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { HIDDEN_HANDLE_STYLE, getHandlePositions } from "../shared/edge-styles";

export type DecisionNodeData = {
  label: string;
  direction?: string;
};

export type DecisionNode = Node<DecisionNodeData, "decision">;

// Hoisted static styles (rendering-hoist-jsx)
const CONTAINER_STYLE = {
  width: "140px",
  height: "140px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
} as const;

const DIAMOND_STYLE = {
  width: "100px",
  height: "100px",
  transform: "rotate(45deg)",
  background: "var(--siren-node, hsl(0 0% 12.2%))",
  border: "1px solid var(--siren-primary, #0068b8)",
  borderRadius: "var(--siren-radius, 8px)",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  position: "absolute",
} as const;

const LABEL_STYLE = {
  position: "relative",
  zIndex: 1,
  fontFamily: "var(--siren-font, system-ui)",
  fontSize: "13px",
  fontWeight: 400,
  letterSpacing: "0.01em",
  color: "var(--siren-text, hsl(0 0% 98%))",
  textAlign: "center",
  maxWidth: "80px",
  lineHeight: 1.3,
} as const;

function DecisionComponent({ data }: NodeProps<DecisionNode>) {
  const handles = getHandlePositions(data.direction);
  // Secondary handle on the perpendicular axis for branching
  const isHorizontal = data.direction === "LR" || data.direction === "RL";
  const secondaryPos = isHorizontal ? Position.Bottom : Position.Right;

  return (
    <>
      <Handle type="target" position={handles.target} style={HIDDEN_HANDLE_STYLE} />
      <div style={CONTAINER_STYLE}>
        <div style={DIAMOND_STYLE} aria-hidden="true" />
        <span style={LABEL_STYLE}>
          {data.label}
        </span>
      </div>
      <Handle type="source" position={handles.source} style={HIDDEN_HANDLE_STYLE} />
      <Handle
        type="source"
        position={secondaryPos}
        id="secondary"
        style={HIDDEN_HANDLE_STYLE}
      />
    </>
  );
}

export const Decision = memo(DecisionComponent);
(Decision as any).displayName = "Decision";

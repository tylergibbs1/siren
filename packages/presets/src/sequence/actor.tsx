"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { HIDDEN_HANDLE_STYLE } from "../shared/edge-styles";

export type ActorNodeData = {
  label: string;
};

export type ActorNode = Node<ActorNodeData, "actor">;

// Hoisted static styles (rendering-hoist-jsx)
const WRAPPER_STYLE = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
} as const;

const AVATAR_STYLE = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  background: "var(--siren-primary, #0068b8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  fontFamily: "var(--siren-font-mono, monospace)",
  fontSize: "16px",
  fontWeight: 500,
  letterSpacing: "0.02em",
} as const;

const LABEL_STYLE = {
  fontFamily: "var(--siren-font-mono, monospace)",
  fontSize: "11px",
  fontWeight: 400,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--siren-text-muted, hsl(0 0% 70.6%))",
} as const;

const LIFELINE_STYLE = {
  width: "1px",
  height: "300px",
  background: "var(--siren-node-border, hsl(0 0% 18%))",
} as const;

function ActorComponent({ data }: NodeProps<ActorNode>) {
  return (
    <>
      <Handle type="target" position={Position.Left} style={HIDDEN_HANDLE_STYLE} />
      <div style={WRAPPER_STYLE}>
        <div style={AVATAR_STYLE} aria-hidden="true">
          {data.label.charAt(0).toUpperCase()}
        </div>
        <span style={LABEL_STYLE}>
          {data.label}
        </span>
        {/* Lifeline — decorative vertical line */}
        <div style={LIFELINE_STYLE} aria-hidden="true" />
      </div>
      <Handle type="source" position={Position.Right} style={HIDDEN_HANDLE_STYLE} />
    </>
  );
}

export const Actor = memo(ActorComponent);
(Actor as any).displayName = "Actor";

"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

export type StateVariant = "default" | "primary" | "success" | "warning" | "danger";

export type StateNodeData = {
  label: string;
  variant?: StateVariant;
};

export type StateNodeType = Node<StateNodeData, "state">;

const variantStyles: Record<
  StateVariant,
  { bg: string; border: string; text: string }
> = {
  default: {
    bg: "var(--siren-node, hsl(0 0% 12.2%))",
    border: "var(--siren-node-border, hsl(0 0% 18%))",
    text: "var(--siren-text, hsl(0 0% 98%))",
  },
  primary: {
    bg: "var(--siren-primary, #0090ff)",
    border: "var(--siren-primary, #0090ff)",
    text: "#ffffff",
  },
  success: {
    bg: "var(--siren-success, #22c55e)",
    border: "var(--siren-success, #22c55e)",
    text: "#ffffff",
  },
  warning: {
    bg: "var(--siren-warning, #f59e0b)",
    border: "var(--siren-warning, #f59e0b)",
    text: "#ffffff",
  },
  danger: {
    bg: "var(--siren-danger, #ef4444)",
    border: "var(--siren-danger, #ef4444)",
    text: "#ffffff",
  },
};

function StateNodeComponent({ data }: NodeProps<StateNodeType>) {
  const variant = data.variant ?? "default";
  const style = variantStyles[variant];

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: "hidden" }}
      />
      <div
        style={{
          padding: "12px 24px",
          borderRadius: "9999px",
          background: style.bg,
          border: `1px solid ${style.border}`,
          color: style.text,
          fontFamily: "var(--siren-font, system-ui)",
          fontSize: "14px",
          fontWeight: 400,
          letterSpacing: "0.01em",
          textAlign: "center",
          minWidth: "120px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ visibility: "hidden" }}
      />
    </>
  );
}

export const StateNode = memo(StateNodeComponent);
(StateNode as any).displayName = "StateNode";

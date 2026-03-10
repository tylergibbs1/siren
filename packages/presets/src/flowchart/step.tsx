"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { HIDDEN_HANDLE_STYLE } from "../shared/edge-styles";

export type StepVariant = "default" | "primary" | "success" | "warning" | "danger";

export type StepNodeData = {
  label: string;
  variant?: StepVariant;
};

export type StepNode = Node<StepNodeData, "step">;

const variantStyles: Record<StepVariant, { bg: string; border: string; text: string }> = {
  default: {
    bg: "var(--siren-node, hsl(0 0% 12.2%))",
    border: "var(--siren-node-border, hsl(0 0% 18%))",
    text: "var(--siren-text, hsl(0 0% 98%))",
  },
  primary: {
    bg: "var(--siren-primary, #0068b8)",
    border: "var(--siren-primary, #0068b8)",
    text: "#ffffff",
  },
  success: {
    bg: "var(--siren-success, #18794e)",
    border: "var(--siren-success, #18794e)",
    text: "#ffffff",
  },
  warning: {
    bg: "var(--siren-warning, #ffc53d)",
    border: "var(--siren-warning, #ffc53d)",
    text: "hsl(0 0% 9%)",
  },
  danger: {
    bg: "var(--siren-danger, #cd2b31)",
    border: "var(--siren-danger, #cd2b31)",
    text: "#ffffff",
  },
};

function StepComponent({ data }: NodeProps<StepNode>) {
  const variant = data.variant ?? "default";
  const style = variantStyles[variant];

  return (
    <>
      <Handle type="target" position={Position.Top} style={HIDDEN_HANDLE_STYLE} />
      <div
        style={{
          padding: "12px 24px",
          borderRadius: "var(--siren-radius, 8px)",
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
      <Handle type="source" position={Position.Bottom} style={HIDDEN_HANDLE_STYLE} />
    </>
  );
}

export const Step = memo(StepComponent);
(Step as any).displayName = "Step";

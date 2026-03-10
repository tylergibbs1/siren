"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { HIDDEN_HANDLE_STYLE } from "../shared/edge-styles";
import { VARIANT_STYLES, BASE_TEXT_STYLE } from "../shared/variant-styles";

export type { StepVariant } from "../shared/variant-styles";

export type StepNodeData = {
  label: string;
  variant?: import("../shared/variant-styles").StepVariant;
};

export type StepNode = Node<StepNodeData, "step">;

function StepComponent({ data }: NodeProps<StepNode>) {
  const variant = data.variant ?? "default";
  const s = VARIANT_STYLES[variant];

  return (
    <>
      <Handle type="target" position={Position.Top} style={HIDDEN_HANDLE_STYLE} />
      <div
        style={{
          padding: "12px 24px",
          borderRadius: "var(--siren-radius, 8px)",
          background: s.bg,
          border: `1px solid ${s.border}`,
          color: s.text,
          ...BASE_TEXT_STYLE,
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

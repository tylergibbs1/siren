"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { HIDDEN_HANDLE_STYLE } from "../shared/edge-styles";

export type RequirementKind =
  | "functional"
  | "interface"
  | "performance"
  | "physical"
  | "design";

export type RequirementRisk = "low" | "medium" | "high";
export type RequirementStatus = "draft" | "approved" | "implemented" | "verified";

export type RequirementNodeData = {
  label: string;
  kind?: RequirementKind;
  risk?: RequirementRisk;
  status?: RequirementStatus;
  variant?: "default" | "primary";
};

export type RequirementNodeType = Node<RequirementNodeData, "requirement">;

const variantHeader: Record<
  "default" | "primary",
  { bg: string; text: string; border: string }
> = {
  default: {
    bg: "var(--siren-node-border, hsl(0 0% 18%))",
    text: "var(--siren-text, hsl(0 0% 98%))",
    border: "var(--siren-node-border, hsl(0 0% 18%))",
  },
  primary: {
    bg: "var(--siren-primary, #0090ff)",
    text: "#ffffff",
    border: "var(--siren-primary, #0090ff)",
  },
};

function RequirementNodeComponent({ data }: NodeProps<RequirementNodeType>) {
  const variant = data.variant ?? "default";
  const header = variantHeader[variant];

  const items: string[] = [];
  if (data.kind) items.push(`Kind: ${data.kind}`);
  if (data.risk) items.push(`Risk: ${data.risk}`);
  if (data.status) items.push(`Status: ${data.status}`);

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={HIDDEN_HANDLE_STYLE}
      />
      <div
        style={{
          minWidth: "180px",
          background: "var(--siren-node, hsl(0 0% 12.2%))",
          border: `1px solid ${header.border}`,
          borderRadius: "var(--siren-radius, 8px)",
          overflow: "hidden",
          fontFamily: "var(--siren-font, system-ui)",
          fontSize: "13px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "8px 12px",
            background: header.bg,
            color: header.text,
            fontWeight: 500,
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          {data.label}
        </div>

        {/* Metadata items */}
        {items.length > 0 && (
          <>
            <div
              style={{
                height: "1px",
                background: "var(--siren-border-strong, hsl(0 0% 18%))",
              }}
            />
            <div style={{ padding: "6px 12px" }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "2px 0",
                    fontFamily: "var(--siren-font-mono, monospace)",
                    fontSize: "12px",
                    color: "var(--siren-text-subtle, hsl(0 0% 53.7%))",
                    lineHeight: 1.5,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={HIDDEN_HANDLE_STYLE}
      />
    </>
  );
}

export const RequirementNode = memo(RequirementNodeComponent);
(RequirementNode as any).displayName = "RequirementNode";

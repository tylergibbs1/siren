"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { HIDDEN_HANDLE_STYLE } from "./edge-styles";

export type ListNodeData = {
  label: string;
  sections: Array<{ title?: string; items: string[] }>;
  variant?: "default" | "primary";
};

export type ListNodeType = Node<ListNodeData, "list-node">;

const variantHeader: Record<
  "default" | "primary",
  { bg: string; text: string; border: string }
> = {
  default: {
    bg: "var(--siren-surface-raised, hsl(0 0% 12.2%))",
    text: "var(--siren-text, hsl(0 0% 98%))",
    border: "var(--siren-node-border, hsl(0 0% 18%))",
  },
  primary: {
    bg: "var(--siren-primary, #0068b8)",
    text: "#ffffff",
    border: "var(--siren-primary, #0068b8)",
  },
};

// Hoisted static styles (rendering-hoist-jsx)
const DIVIDER_STYLE = {
  height: "1px",
  background: "var(--siren-node-border, hsl(0 0% 18%))",
} as const;

const SECTION_TITLE_STYLE = {
  padding: "4px 12px 2px",
  fontFamily: "var(--siren-font-mono, monospace)",
  fontSize: "10px",
  fontWeight: 400,
  color: "var(--siren-text-subtle, hsl(0 0% 53.7%))",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
} as const;

const ITEMS_WRAPPER_STYLE = { padding: "6px 12px" } as const;

const ITEM_STYLE = {
  padding: "2px 0",
  fontFamily: "var(--siren-font-mono, monospace)",
  fontSize: "12px",
  color: "var(--siren-text, hsl(0 0% 98%))",
  lineHeight: 1.5,
} as const;

function ListNodeComponent({ data }: NodeProps<ListNodeType>) {
  const variant = data.variant ?? "default";
  const header = variantHeader[variant];

  return (
    <>
      <Handle type="target" position={Position.Top} style={HIDDEN_HANDLE_STYLE} />
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
            letterSpacing: "0.01em",
          }}
        >
          {data.label}
        </div>

        {/* Sections */}
        {data.sections.map((section, sIdx) => (
          <div key={sIdx}>
            <div style={DIVIDER_STYLE} aria-hidden="true" />
            {section.title ? (
              <div style={SECTION_TITLE_STYLE}>{section.title}</div>
            ) : null}
            <div style={ITEMS_WRAPPER_STYLE}>
              {section.items.map((item, iIdx) => (
                <div key={iIdx} style={ITEM_STYLE}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} style={HIDDEN_HANDLE_STYLE} />
    </>
  );
}

export const ListNode = memo(ListNodeComponent);
(ListNode as any).displayName = "ListNode";

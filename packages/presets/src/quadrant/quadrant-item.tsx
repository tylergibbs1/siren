"use client";

import { memo } from "react";
import { type NodeProps, type Node } from "@xyflow/react";

export type QuadrantItemData = {
  label: string;
};

export type QuadrantItemNode = Node<QuadrantItemData, "quadrant-item">;

function QuadrantItemComponent({ data }: NodeProps<QuadrantItemNode>) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {/* Dot */}
      <div
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: "var(--siren-primary, #0090ff)",
          border: "1px solid var(--siren-node, hsl(0 0% 12.2%))",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      />
      {/* Label */}
      <div
        style={{
          fontSize: "11px",
          fontWeight: 400,
          color: "var(--siren-text, hsl(0 0% 98%))",
          letterSpacing: "0.01em",
          fontFamily: "var(--siren-font, system-ui)",
          textAlign: "center",
          whiteSpace: "nowrap",
          background: "rgba(255,255,255,0.85)",
          padding: "1px 6px",
          borderRadius: "3px",
        }}
      >
        {data.label}
      </div>
    </div>
  );
}

export const QuadrantItem = memo(QuadrantItemComponent);
(QuadrantItem as any).displayName = "QuadrantItem";

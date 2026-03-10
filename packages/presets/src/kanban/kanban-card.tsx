"use client";

import { memo } from "react";
import { type NodeProps, type Node } from "@xyflow/react";

export type KanbanCardData = {
  label: string;
  tag?: string;
};

export type KanbanCardNode = Node<KanbanCardData, "kanban-card">;

function KanbanCardComponent({ data }: NodeProps<KanbanCardNode>) {
  return (
    <div
      style={{
        width: "100%",
        padding: "10px 12px",
        background: "var(--siren-node, hsl(0 0% 12.2%))",
        border: "1px solid var(--siren-node-border, hsl(0 0% 18%))",
        borderRadius: "6px",
        fontFamily: "var(--siren-font, system-ui)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 400,
          color: "var(--siren-text, hsl(0 0% 98%))",
          letterSpacing: "0.01em",
          lineHeight: 1.4,
        }}
      >
        {data.label}
      </div>
      {data.tag && (
        <div
          style={{
            marginTop: "6px",
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: "4px",
            background: "var(--siren-primary, #0090ff)",
            color: "#ffffff",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.03em",
            textTransform: "uppercase",
          }}
        >
          {data.tag}
        </div>
      )}
    </div>
  );
}

export const KanbanCard = memo(KanbanCardComponent);
(KanbanCard as any).displayName = "KanbanCard";

"use client";

import { memo } from "react";
import { type NodeProps, type Node } from "@xyflow/react";

export type KanbanColumnData = {
  label: string;
  count: number;
};

export type KanbanColumnNode = Node<KanbanColumnData, "kanban-column">;

function KanbanColumnComponent({ data }: NodeProps<KanbanColumnNode>) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "var(--siren-bg, #f8fafc)",
        border: "1px solid var(--siren-node-border, hsl(0 0% 18%))",
        borderRadius: "var(--siren-radius, 8px)",
        fontFamily: "var(--siren-font, system-ui)",
        overflow: "hidden",
      }}
    >
      {/* Column Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid var(--siren-node-border, hsl(0 0% 18%))",
          background: "var(--siren-surface-raised, var(--siren-node, hsl(0 0% 12.2%)))",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--siren-text, hsl(0 0% 98%))",
          }}
        >
          {data.label}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "24px",
            height: "24px",
            padding: "0 6px",
            borderRadius: "12px",
            background: "var(--siren-node-border, hsl(0 0% 18%))",
            fontSize: "12px",
            fontWeight: 400,
            color: "var(--siren-text-muted, hsl(0 0% 70.6%))",
          }}
        >
          {data.count}
        </span>
      </div>
    </div>
  );
}

export const KanbanColumn = memo(KanbanColumnComponent);
(KanbanColumn as any).displayName = "KanbanColumn";

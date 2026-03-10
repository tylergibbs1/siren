"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

export type GanttBarData = {
  label: string;
  color: string;
};

export type GanttBarNode = Node<GanttBarData, "gantt-bar">;

function GanttBarComponent({ data }: NodeProps<GanttBarNode>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ visibility: "hidden" }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: "28px",
          borderRadius: "4px",
          background: data.color,
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          fontFamily: "var(--siren-font, system-ui)",
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--siren-text, #1e293b)",
          letterSpacing: "0.01em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ visibility: "hidden" }}
      />
    </>
  );
}

export const GanttBar = memo(GanttBarComponent);
(GanttBar as any).displayName = "GanttBar";

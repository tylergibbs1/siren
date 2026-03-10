"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

export type GanttMilestoneData = {
  label: string;
};

export type GanttMilestoneNode = Node<GanttMilestoneData, "gantt-milestone">;

function GanttMilestoneComponent({ data }: NodeProps<GanttMilestoneNode>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ visibility: "hidden" }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {/* Diamond shape */}
        <div
          style={{
            width: "16px",
            height: "16px",
            transform: "rotate(45deg)",
            background: "var(--siren-primary, #0090ff)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--siren-font, system-ui)",
            fontSize: "11px",
            fontWeight: 400,
            color: "var(--siren-text, hsl(0 0% 98%))",
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
          }}
        >
          {data.label}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ visibility: "hidden" }}
      />
    </>
  );
}

export const GanttMilestone = memo(GanttMilestoneComponent);
(GanttMilestone as any).displayName = "GanttMilestone";

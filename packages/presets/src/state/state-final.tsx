"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

export type StateFinalData = {
  label?: string;
};

export type StateFinalNodeType = Node<StateFinalData, "state-final">;

function StateFinalComponent(_props: NodeProps<StateFinalNodeType>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: "hidden" }}
      />
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          border: "3px solid var(--siren-text, #1e293b)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--siren-node, #ffffff)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "var(--siren-text, #1e293b)",
          }}
        />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ visibility: "hidden" }}
      />
    </>
  );
}

export const StateFinal = memo(StateFinalComponent);
(StateFinal as any).displayName = "StateFinal";

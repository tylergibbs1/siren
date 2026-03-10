"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

export type SankeyNodeData = {
  label: string;
  totalValue: number;
};

export type SankeyNodeType = Node<SankeyNodeData, "sankey">;

function SankeyNodeComponent({ data }: NodeProps<SankeyNodeType>) {
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
          minWidth: "24px",
          minHeight: "30px",
          borderRadius: "3px",
          background: "var(--siren-primary, #0090ff)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px 8px",
          fontFamily: "var(--siren-font, system-ui)",
          fontSize: "11px",
          fontWeight: 500,
          color: "#ffffff",
          textAlign: "center",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            writingMode: "horizontal-tb",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
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

export const SankeyNode = memo(SankeyNodeComponent);
(SankeyNode as any).displayName = "SankeyNode";

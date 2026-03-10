"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { HIDDEN_HANDLE_STYLE } from "../shared/edge-styles";

export type BlockNodeData = {
  label: string;
};

export type BlockNodeType = Node<BlockNodeData, "block">;

function BlockNodeComponent({ data }: NodeProps<BlockNodeType>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={HIDDEN_HANDLE_STYLE}
      />
      <div
        style={{
          padding: "12px 24px",
          borderRadius: "var(--siren-radius, 8px)",
          background: "var(--siren-node, hsl(0 0% 12.2%))",
          border: "1px solid var(--siren-node-border, hsl(0 0% 18%))",
          color: "var(--siren-text, hsl(0 0% 98%))",
          fontFamily: "var(--siren-font, system-ui)",
          fontSize: "14px",
          fontWeight: 400,
          letterSpacing: "0.01em",
          textAlign: "center",
          minWidth: "120px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={HIDDEN_HANDLE_STYLE}
      />
    </>
  );
}

export const BlockNode = memo(BlockNodeComponent);
(BlockNode as any).displayName = "BlockNode";

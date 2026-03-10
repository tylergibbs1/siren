"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { HIDDEN_HANDLE_STYLE } from "../shared/edge-styles";

export type BlockGroupData = {
  label: string;
};

export type BlockGroupType = Node<BlockGroupData, "block-group">;

function BlockGroupComponent({ data }: NodeProps<BlockGroupType>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={HIDDEN_HANDLE_STYLE}
      />
      <div
        style={{
          minWidth: "250px",
          minHeight: "150px",
          width: "100%",
          height: "100%",
          borderRadius: "var(--siren-radius, 8px)",
          background: "var(--siren-surface-raised, rgba(248,250,252,0.8))",
          border: "1px dashed var(--siren-node-border, hsl(0 0% 18%))",
          fontFamily: "var(--siren-font, system-ui)",
          overflow: "hidden",
        }}
      >
        {/* Header bar */}
        <div
          style={{
            padding: "6px 12px",
            background: "var(--siren-node-border, hsl(0 0% 18%))",
            color: "var(--siren-text, hsl(0 0% 98%))",
            fontFamily: "var(--siren-font-mono, monospace)",
            fontSize: "10px",
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
            fontWeight: 400,
          }}
        >
          {data.label}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={HIDDEN_HANDLE_STYLE}
      />
    </>
  );
}

export const BlockGroup = memo(BlockGroupComponent);
(BlockGroup as any).displayName = "BlockGroup";

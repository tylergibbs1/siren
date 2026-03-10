"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

export type C4BoundaryData = {
  label: string;
};

export type C4BoundaryNode = Node<C4BoundaryData, "c4-boundary">;

function C4BoundaryComponent({ data }: NodeProps<C4BoundaryNode>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: "hidden" }}
      />
      <div
        style={{
          minWidth: "280px",
          minHeight: "180px",
          width: "100%",
          height: "100%",
          borderRadius: "var(--siren-radius, 8px)",
          background: "var(--siren-surface-raised, rgba(255, 255, 255, 0.03))",
          border: "1px dashed var(--siren-node-border, hsl(0 0% 18%))",
          fontFamily: "var(--siren-font, system-ui)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            color: "var(--siren-text-subtle, hsl(0 0% 53.7%))",
            fontFamily: "var(--siren-font-mono, monospace)",
            fontSize: "10px",
            fontWeight: 400,
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
          }}
        >
          {data.label}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ visibility: "hidden" }}
      />
    </>
  );
}

export const C4Boundary = memo(C4BoundaryComponent);
(C4Boundary as any).displayName = "C4Boundary";

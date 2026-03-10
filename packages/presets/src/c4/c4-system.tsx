"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

export type C4SystemData = {
  label: string;
  description?: string;
  external?: boolean;
};

export type C4SystemNode = Node<C4SystemData, "c4-system">;

function C4SystemComponent({ data }: NodeProps<C4SystemNode>) {
  const isExternal = data.external ?? false;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: "hidden" }}
      />
      <div
        style={{
          padding: "16px 24px",
          borderRadius: "var(--siren-radius, 8px)",
          background: isExternal
            ? "var(--siren-node, hsl(0 0% 12.2%))"
            : "var(--siren-primary, #0090ff)",
          border: isExternal
            ? "1px dashed var(--siren-node-border, hsl(0 0% 40%))"
            : "1px solid var(--siren-primary, #0090ff)",
          color: isExternal
            ? "var(--siren-text, hsl(0 0% 98%))"
            : "#ffffff",
          fontFamily: "var(--siren-font, system-ui)",
          textAlign: "center",
          minWidth: "140px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: data.description ? "4px" : 0,
          }}
        >
          {data.label}
        </div>
        {data.description && (
          <div
            style={{
              fontSize: "11px",
              opacity: 0.85,
              lineHeight: 1.4,
              maxWidth: "180px",
            }}
          >
            {data.description}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ visibility: "hidden" }}
      />
    </>
  );
}

export const C4System = memo(C4SystemComponent);
(C4System as any).displayName = "C4System";

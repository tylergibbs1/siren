"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { HIDDEN_HANDLE_STYLE } from "../shared/edge-styles";

export type C4PersonData = {
  label: string;
  description?: string;
};

export type C4PersonNode = Node<C4PersonData, "c4-person">;

function C4PersonComponent({ data }: NodeProps<C4PersonNode>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={HIDDEN_HANDLE_STYLE}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          padding: "16px 24px",
          minWidth: "140px",
        }}
      >
        {/* Person icon — simple SVG silhouette */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          style={{ marginBottom: "4px" }}
        >
          <circle
            cx="24"
            cy="14"
            r="10"
            fill="var(--siren-primary, #0090ff)"
          />
          <path
            d="M6 44c0-9.941 8.059-18 18-18s18 8.059 18 18"
            fill="var(--siren-primary, #0090ff)"
          />
        </svg>
        <span
          style={{
            fontFamily: "var(--siren-font, system-ui)",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--siren-text, hsl(0 0% 98%))",
            textAlign: "center",
          }}
        >
          {data.label}
        </span>
        {data.description && (
          <span
            style={{
              fontFamily: "var(--siren-font, system-ui)",
              fontSize: "11px",
              color: "var(--siren-text-muted, hsl(0 0% 70.6%))",
              letterSpacing: "0.01em",
              textAlign: "center",
              maxWidth: "160px",
              lineHeight: 1.4,
            }}
          >
            {data.description}
          </span>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={HIDDEN_HANDLE_STYLE}
      />
    </>
  );
}

export const C4Person = memo(C4PersonComponent);
(C4Person as any).displayName = "C4Person";

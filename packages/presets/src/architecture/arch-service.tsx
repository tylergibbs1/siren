"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

export type ArchServiceData = {
  label: string;
  icon?: string;
};

export type ArchServiceNode = Node<ArchServiceData, "arch-service">;

const ICON_MAP: Record<string, string> = {
  server: "\uD83D\uDDA5",
  database: "\uD83D\uDDC4",
  cloud: "\u2601",
  monitor: "\uD83D\uDCBB",
  mobile: "\uD83D\uDCF1",
  lock: "\uD83D\uDD12",
  globe: "\uD83C\uDF10",
  mail: "\uD83D\uDCE7",
  code: "\uD83D\uDCBB",
  storage: "\uD83D\uDCBE",
};

function ArchServiceComponent({ data }: NodeProps<ArchServiceNode>) {
  const icon = data.icon ? ICON_MAP[data.icon] ?? data.icon : null;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: "hidden" }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          padding: "12px 20px",
          borderRadius: "var(--siren-radius, 8px)",
          background: "var(--siren-node, hsl(0 0% 12.2%))",
          border: "1px solid var(--siren-node-border, hsl(0 0% 18%))",
          fontFamily: "var(--siren-font, system-ui)",
          minWidth: "100px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        {icon && (
          <span style={{ fontSize: "24px", lineHeight: 1 }}>{icon}</span>
        )}
        <span
          style={{
            fontSize: "13px",
            fontWeight: 400,
            color: "var(--siren-text, hsl(0 0% 98%))",
            textAlign: "center",
            letterSpacing: "0.01em",
          }}
        >
          {data.label}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ visibility: "hidden" }}
      />
    </>
  );
}

export const ArchService = memo(ArchServiceComponent);
(ArchService as any).displayName = "ArchService";

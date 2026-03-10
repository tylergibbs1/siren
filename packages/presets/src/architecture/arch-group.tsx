"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

export type ArchGroupData = {
  label: string;
  icon?: string;
};

export type ArchGroupNode = Node<ArchGroupData, "arch-group">;

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

function ArchGroupComponent({ data }: NodeProps<ArchGroupNode>) {
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
          minWidth: "260px",
          minHeight: "160px",
          width: "100%",
          height: "100%",
          borderRadius: "var(--siren-radius, 8px)",
          background: "var(--siren-surface-raised, rgba(248, 250, 252, 0.5))",
          border: "1px dashed var(--siren-node-border, hsl(0 0% 18%))",
          fontFamily: "var(--siren-font, system-ui)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--siren-text, hsl(0 0% 98%))",
            fontFamily: "var(--siren-font-mono, monospace)",
            fontSize: "10px",
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
            fontWeight: 400,
            background: "var(--siren-node-border, hsl(0 0% 18%))",
          }}
        >
          {icon && (
            <span style={{ fontSize: "16px", lineHeight: 1 }}>{icon}</span>
          )}
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

export const ArchGroup = memo(ArchGroupComponent);
(ArchGroup as any).displayName = "ArchGroup";

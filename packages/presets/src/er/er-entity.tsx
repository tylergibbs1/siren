"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { HIDDEN_HANDLE_STYLE } from "../shared/edge-styles";

export type ERColumn = {
  name: string;
  type: string;
  pk?: boolean;
  fk?: boolean;
  unique?: boolean;
};

export type EREntityData = {
  label: string;
  columns: ERColumn[];
};

export type EREntityNode = Node<EREntityData, "er-entity">;

function EREntityComponent({ data }: NodeProps<EREntityNode>) {
  return (
    <>
      <Handle type="target" position={Position.Top} id="top" style={HIDDEN_HANDLE_STYLE} />
      <Handle type="target" position={Position.Left} id="left" style={HIDDEN_HANDLE_STYLE} />
      <div
        style={{
          minWidth: "220px",
          background: "var(--siren-node, hsl(0 0% 12.2%))",
          border: "1px solid var(--siren-node-border, hsl(0 0% 18%))",
          borderRadius: "var(--siren-radius, 8px)",
          overflow: "hidden",
          fontFamily: "var(--siren-font, system-ui)",
          fontSize: "13px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        {/* Table Name Header */}
        <div
          style={{
            padding: "10px 16px",
            background: "var(--siren-primary, #0090ff)",
            color: "#ffffff",
            fontWeight: 500,
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          {data.label}
        </div>

        {/* Columns */}
        {data.columns.map((col, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              borderTop: "1px solid var(--siren-node-border, hsl(0 0% 18%))",
              background:
                i % 2 === 0
                  ? "var(--siren-node, hsl(0 0% 12.2%))"
                  : "var(--siren-surface-raised, hsl(0 0% 14%))",
            }}
          >
            {/* Column Name */}
            <span
              style={{
                flex: 1,
                fontFamily: "var(--siren-font-mono, monospace)",
                fontSize: "12px",
                color: "var(--siren-text, hsl(0 0% 98%))",
                fontWeight: col.pk ? 500 : 400,
                letterSpacing: "0.01em",
              }}
            >
              {col.name}
            </span>

            {/* Column Type */}
            <span
              style={{
                fontFamily: "var(--siren-font-mono, monospace)",
                fontSize: "11px",
                color: "var(--siren-text-muted, hsl(0 0% 70.6%))",
              }}
            >
              {col.type}
            </span>

            {/* Badges */}
            <span
              style={{
                display: "flex",
                gap: "4px",
                flexShrink: 0,
              }}
            >
              {col.pk && (
                <span
                  style={{
                    padding: "1px 5px",
                    borderRadius: "3px",
                    background: "var(--siren-primary, #0090ff)",
                    color: "#ffffff",
                    fontSize: "9px",
                    fontWeight: 500,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  PK
                </span>
              )}
              {col.fk && (
                <span
                  style={{
                    padding: "1px 5px",
                    borderRadius: "3px",
                    background: "var(--siren-warning, #f59e0b)",
                    color: "#ffffff",
                    fontSize: "9px",
                    fontWeight: 500,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  FK
                </span>
              )}
              {col.unique && (
                <span
                  style={{
                    padding: "1px 5px",
                    borderRadius: "3px",
                    background: "var(--siren-success, #22c55e)",
                    color: "#ffffff",
                    fontSize: "9px",
                    fontWeight: 500,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  UQ
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" style={HIDDEN_HANDLE_STYLE} />
      <Handle type="source" position={Position.Right} id="right" style={HIDDEN_HANDLE_STYLE} />
    </>
  );
}

export const EREntity = memo(EREntityComponent);
(EREntity as any).displayName = "EREntity";

"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { HIDDEN_HANDLE_STYLE } from "../shared/edge-styles";

export type ClassNodeData = {
  label: string;
  attributes: string[];
  methods: string[];
};

export type ClassNodeType = Node<ClassNodeData, "class">;

function ClassNodeComponent({ data }: NodeProps<ClassNodeType>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={HIDDEN_HANDLE_STYLE}
      />
      <div
        style={{
          minWidth: "200px",
          background: "var(--siren-node, hsl(0 0% 12.2%))",
          border: "1px solid var(--siren-node-border, hsl(0 0% 18%))",
          borderRadius: "var(--siren-radius, 8px)",
          overflow: "hidden",
          fontFamily: "var(--siren-font, system-ui)",
          fontSize: "13px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        {/* Class Name Header */}
        <div
          style={{
            padding: "10px 16px",
            background: "var(--siren-primary, #0090ff)",
            color: "#ffffff",
            fontWeight: 500,
            fontSize: "14px",
            textAlign: "center",
            fontFamily: "var(--siren-font, system-ui)",
          }}
        >
          {data.label}
        </div>

        {/* Attributes Section */}
        <div
          style={{
            height: "1px",
            background: "var(--siren-node-border, hsl(0 0% 18%))",
          }}
        />
        <div style={{ padding: "8px 12px" }}>
          {data.attributes.length > 0 ? (
            data.attributes.map((attr, i) => (
              <div
                key={i}
                style={{
                  padding: "2px 0",
                  fontFamily: "var(--siren-font-mono, monospace)",
                  fontSize: "12px",
                  color: "var(--siren-text, hsl(0 0% 98%))",
                  letterSpacing: "0.01em",
                  lineHeight: 1.5,
                }}
              >
                {attr}
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "2px 0",
                fontSize: "12px",
                color: "var(--siren-text-muted, hsl(0 0% 70.6%))",
                fontStyle: "italic",
              }}
            >
              &nbsp;
            </div>
          )}
        </div>

        {/* Methods Section */}
        <div
          style={{
            height: "1px",
            background: "var(--siren-node-border, hsl(0 0% 18%))",
          }}
        />
        <div style={{ padding: "8px 12px" }}>
          {data.methods.length > 0 ? (
            data.methods.map((method, i) => (
              <div
                key={i}
                style={{
                  padding: "2px 0",
                  fontFamily: "var(--siren-font-mono, monospace)",
                  fontSize: "12px",
                  color: "var(--siren-text, hsl(0 0% 98%))",
                  letterSpacing: "0.01em",
                  lineHeight: 1.5,
                }}
              >
                {method}
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "2px 0",
                fontSize: "12px",
                color: "var(--siren-text-muted, hsl(0 0% 70.6%))",
                fontStyle: "italic",
              }}
            >
              &nbsp;
            </div>
          )}
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

export const ClassNode = memo(ClassNodeComponent);
(ClassNode as any).displayName = "ClassNode";

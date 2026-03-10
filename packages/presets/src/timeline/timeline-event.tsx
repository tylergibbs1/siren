"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

export type TimelineVariant = "default" | "primary" | "success" | "warning" | "danger";

export type TimelineEventData = {
  date: string;
  label: string;
  description?: string;
  variant?: TimelineVariant;
};

export type TimelineEventNode = Node<TimelineEventData, "timeline-event">;

const variantStyles: Record<
  TimelineVariant,
  { accent: string; bg: string }
> = {
  default: {
    accent: "var(--siren-node-border, hsl(0 0% 18%))",
    bg: "var(--siren-node, hsl(0 0% 12.2%))",
  },
  primary: {
    accent: "var(--siren-primary, #0090ff)",
    bg: "var(--siren-node, hsl(0 0% 12.2%))",
  },
  success: {
    accent: "var(--siren-success, #22c55e)",
    bg: "var(--siren-node, hsl(0 0% 12.2%))",
  },
  warning: {
    accent: "var(--siren-warning, #f59e0b)",
    bg: "var(--siren-node, hsl(0 0% 12.2%))",
  },
  danger: {
    accent: "var(--siren-danger, #ef4444)",
    bg: "var(--siren-node, hsl(0 0% 12.2%))",
  },
};

function TimelineEventComponent({ data }: NodeProps<TimelineEventNode>) {
  const variant = data.variant ?? "default";
  const style = variantStyles[variant];

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ visibility: "hidden" }}
      />
      <div
        style={{
          minWidth: "140px",
          maxWidth: "200px",
          padding: "12px 16px",
          background: style.bg,
          border: `1px solid ${style.accent}`,
          borderTop: `4px solid ${style.accent}`,
          borderRadius: "var(--siren-radius, 8px)",
          fontFamily: "var(--siren-font, system-ui)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        {/* Date */}
        <div
          style={{
            fontSize: "10px",
            fontFamily: "var(--siren-font-mono, monospace)",
            fontWeight: 400,
            color: "var(--siren-text-subtle, hsl(0 0% 53.7%))",
            marginBottom: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {data.date}
        </div>

        {/* Label */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--siren-text, hsl(0 0% 98%))",
            lineHeight: 1.3,
          }}
        >
          {data.label}
        </div>

        {/* Description */}
        {data.description && (
          <div
            style={{
              fontSize: "12px",
              color: "var(--siren-text-muted, hsl(0 0% 70.6%))",
              letterSpacing: "0.01em",
              marginTop: "4px",
              lineHeight: 1.4,
            }}
          >
            {data.description}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ visibility: "hidden" }}
      />
    </>
  );
}

export const TimelineEvent = memo(TimelineEventComponent);
(TimelineEvent as any).displayName = "TimelineEvent";

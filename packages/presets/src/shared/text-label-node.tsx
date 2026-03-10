"use client";

import { memo } from "react";
import type { NodeProps, Node } from "@xyflow/react";

export type TextLabelData = {
  label: string;
  fontSize?: string;
  fontWeight?: number;
  color?: string;
  textAlign?: "left" | "right" | "center";
  textTransform?: string;
  letterSpacing?: string;
  fontFamily?: string;
};

export type TextLabelNode = Node<TextLabelData, "text-label">;

function TextLabelComponent({ data }: NodeProps<TextLabelNode>) {
  return (
    <div
      style={{
        fontFamily: data.fontFamily ?? "var(--siren-font, system-ui)",
        fontSize: data.fontSize ?? "11px",
        fontWeight: data.fontWeight ?? 400,
        color: data.color ?? "var(--siren-text, hsl(0 0% 90%))",
        textAlign: data.textAlign ?? "left",
        textTransform: (data.textTransform as any) ?? "none",
        letterSpacing: data.letterSpacing ?? "normal",
        whiteSpace: "nowrap",
        lineHeight: 1.3,
      }}
    >
      {data.label}
    </div>
  );
}

export const TextLabelNode = memo(TextLabelComponent);
(TextLabelNode as any).displayName = "TextLabelNode";

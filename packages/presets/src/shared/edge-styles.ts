"use client";

import { MarkerType } from "@xyflow/react";

/** Shared hidden style for React Flow Handles — hoisted to avoid per-render allocations */
export const HIDDEN_HANDLE_STYLE = { visibility: "hidden" } as const;

export const EDGE_STYLE = { stroke: "var(--siren-edge, hsl(0 0% 40%))" };
export const EDGE_DASHED_STYLE = {
  strokeDasharray: "5 5",
  stroke: "var(--siren-edge, hsl(0 0% 40%))",
};
export const EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  color: "var(--siren-edge, hsl(0 0% 40%))",
};
export const EDGE_LABEL_STYLE = {
  fontFamily: "var(--siren-font-mono, monospace)",
  fontSize: 11,
  fontWeight: 400,
  letterSpacing: "0.02em",
  fill: "var(--siren-text-subtle, hsl(0 0% 53.7%))",
};
export const EDGE_LABEL_BG_STYLE = {
  fill: "var(--siren-bg, hsl(0 0% 7.1%))",
};
export const PRO_OPTIONS = { hideAttribution: true };

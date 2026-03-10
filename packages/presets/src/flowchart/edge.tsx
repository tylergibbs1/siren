"use client";

/**
 * FlowEdge is a declarative component for describing edges.
 * It's not rendered directly — it's collected by the Flowchart parent
 * and converted to React Flow edge objects.
 */
export function FlowEdge(_props: {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  animated?: boolean;
  edgeType?: string;
  bidirectional?: boolean;
  value?: string | number;
}) {
  return null;
}

FlowEdge.displayName = "FlowEdge";

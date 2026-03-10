"use client";

import { memo, useCallback } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { EDGE_STYLE } from "./edge-styles";

function EdgeWithButtonComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  markerStart,
}: EdgeProps) {
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const onDelete = useCallback(() => {
    setEdges((edges) => edges.filter((e) => e.id !== id));
  }, [id, setEdges]);

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{ ...EDGE_STYLE, ...style }}
        markerEnd={markerEnd}
        markerStart={markerStart}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <button
            onClick={onDelete}
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "var(--siren-surface-raised, #1a1a2e)",
              border: "1px solid var(--siren-node-border, hsl(0 0% 18%))",
              color: "var(--siren-text, hsl(0 0% 98%))",
              fontSize: 10,
              lineHeight: "14px",
              textAlign: "center",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const EdgeWithButton = memo(EdgeWithButtonComponent);
(EdgeWithButton as any).displayName = "EdgeWithButton";

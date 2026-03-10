"use client";

import { memo } from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";
import { EDGE_STYLE } from "./edge-styles";

function AnimatedEdgeComponent({
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
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{ ...EDGE_STYLE, ...style }}
        markerEnd={markerEnd}
        markerStart={markerStart}
      />
      <circle r={4} fill="var(--siren-primary, hsl(221 83% 53%))">
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  );
}

export const AnimatedEdge = memo(AnimatedEdgeComponent);
(AnimatedEdge as any).displayName = "AnimatedEdge";

"use client";

import { memo } from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";
import { EDGE_STYLE } from "./edge-styles";

// Module-level style injection — only inject once
let styleInjected = false;
function injectKeyframes() {
  if (styleInjected || typeof document === "undefined") return;
  styleInjected = true;
  const style = document.createElement("style");
  style.textContent = `@keyframes siren-dash { to { stroke-dashoffset: 0; } }`;
  document.head.appendChild(style);
}

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
  injectKeyframes();

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
        style={{
          ...EDGE_STYLE,
          ...style,
          strokeDasharray: "8 4",
          strokeDashoffset: "100",
          animation: "siren-dash 2s linear infinite",
          strokeLinecap: "round",
        }}
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

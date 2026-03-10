"use client";

import { memo } from "react";
import { type EdgeProps } from "@xyflow/react";
import { EDGE_STYLE, EDGE_MARKER } from "./edge-styles";

function SelfLoopEdgeComponent({
  id,
  sourceX,
  sourceY,
  style,
}: EdgeProps) {
  const loopWidth = 60;
  const loopHeight = 40;

  // Draw a cubic bezier loop that arcs above and to the right of the node
  const path = [
    `M ${sourceX} ${sourceY}`,
    `C ${sourceX + loopWidth} ${sourceY},`,
    `${sourceX + loopWidth} ${sourceY - loopHeight},`,
    `${sourceX} ${sourceY - loopHeight}`,
    `C ${sourceX - loopWidth} ${sourceY - loopHeight},`,
    `${sourceX - loopWidth} ${sourceY},`,
    `${sourceX} ${sourceY}`,
  ].join(" ");

  return (
    <path
      id={id}
      d={path}
      fill="none"
      style={{ ...EDGE_STYLE, ...style }}
      markerEnd={`url(#${EDGE_MARKER.type})`}
    />
  );
}

export const SelfLoopEdge = memo(SelfLoopEdgeComponent);
(SelfLoopEdge as any).displayName = "SelfLoopEdge";

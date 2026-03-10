"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";
import { EDGE_STYLE } from "./edge-styles";

export type DataFlowEdgeData = {
  value?: string | number;
};

export type DataFlowEdgeType = Edge<DataFlowEdgeData, "data-flow">;

const PARTICLE_OFFSETS = ["0s", "0.67s", "1.33s"];

function DataFlowEdgeComponent({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  markerStart,
  data,
}: EdgeProps<DataFlowEdgeType>) {
  const [edgePath, labelX, labelY] = getBezierPath({
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
      {PARTICLE_OFFSETS.map((offset, i) => (
        <circle
          key={i}
          r={3}
          fill="var(--siren-primary, hsl(221 83% 53%))"
          opacity={0.6}
        >
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path={edgePath}
            begin={offset}
          />
        </circle>
      ))}
      {data?.value != null && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            <span
              style={{
                background: "var(--siren-primary, hsl(221 83% 53%))",
                color: "#fff",
                borderRadius: 9999,
                paddingLeft: 8,
                paddingRight: 8,
                paddingTop: 2,
                paddingBottom: 2,
                fontSize: 10,
                fontFamily: "var(--siren-font-mono, monospace)",
                whiteSpace: "nowrap",
              }}
            >
              {data.value}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const DataFlowEdge = memo(DataFlowEdgeComponent);
(DataFlowEdge as any).displayName = "DataFlowEdge";

"use client";

import React, { Children, isValidElement, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  type Node,
} from "@xyflow/react";
import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";
import { QuadrantItem } from "./quadrant-item";
import { PRO_OPTIONS } from "../shared/edge-styles";

interface QuadrantConfig {
  label: string;
  color: string;
}

interface QuadrantChartProps {
  theme?: SirenTheme;
  xAxis?: { label?: string; low?: string; high?: string };
  yAxis?: { label?: string; low?: string; high?: string };
  quadrants?: [QuadrantConfig, QuadrantConfig, QuadrantConfig, QuadrantConfig];
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const nodeTypes = {
  "quadrant-item": QuadrantItem,
};

const DEFAULT_QUADRANTS: [QuadrantConfig, QuadrantConfig, QuadrantConfig, QuadrantConfig] = [
  { label: "Q1", color: "rgba(34, 197, 94, 0.12)" },   // top-right
  { label: "Q2", color: "rgba(59, 130, 246, 0.12)" },   // top-left
  { label: "Q3", color: "rgba(245, 158, 11, 0.12)" },   // bottom-left
  { label: "Q4", color: "rgba(239, 68, 68, 0.12)" },    // bottom-right
];

const CHART_SIZE = 600;
const PADDING = 60;

function QuadrantBackground({
  quadrants,
  xAxis,
  yAxis,
}: {
  quadrants: [QuadrantConfig, QuadrantConfig, QuadrantConfig, QuadrantConfig];
  xAxis?: { label?: string; low?: string; high?: string };
  yAxis?: { label?: string; low?: string; high?: string };
}) {
  const half = CHART_SIZE / 2;

  return (
    <svg
      width={CHART_SIZE + PADDING * 2}
      height={CHART_SIZE + PADDING * 2}
      style={{
        position: "absolute",
        top: -PADDING,
        left: -PADDING,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* Quadrant backgrounds */}
      {/* Top-right (Q1) */}
      <rect
        x={PADDING + half}
        y={PADDING}
        width={half}
        height={half}
        fill={quadrants[0].color}
      />
      {/* Top-left (Q2) */}
      <rect
        x={PADDING}
        y={PADDING}
        width={half}
        height={half}
        fill={quadrants[1].color}
      />
      {/* Bottom-left (Q3) */}
      <rect
        x={PADDING}
        y={PADDING + half}
        width={half}
        height={half}
        fill={quadrants[2].color}
      />
      {/* Bottom-right (Q4) */}
      <rect
        x={PADDING + half}
        y={PADDING + half}
        width={half}
        height={half}
        fill={quadrants[3].color}
      />

      {/* Grid lines */}
      <line
        x1={PADDING}
        y1={PADDING + half}
        x2={PADDING + CHART_SIZE}
        y2={PADDING + half}
        stroke="var(--siren-node-border, hsl(0 0% 18%))"
        strokeWidth={1}
      />
      <line
        x1={PADDING + half}
        y1={PADDING}
        x2={PADDING + half}
        y2={PADDING + CHART_SIZE}
        stroke="var(--siren-node-border, hsl(0 0% 18%))"
        strokeWidth={1}
      />

      {/* Border */}
      <rect
        x={PADDING}
        y={PADDING}
        width={CHART_SIZE}
        height={CHART_SIZE}
        fill="none"
        stroke="var(--siren-border-strong, var(--siren-node-border, hsl(0 0% 18%)))"
        strokeWidth={1.5}
      />

      {/* Quadrant labels */}
      <text
        x={PADDING + half + half / 2}
        y={PADDING + half / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--siren-font, system-ui)"
        fontSize="14"
        fontWeight="400"
        fill="var(--siren-text-muted, hsl(0 0% 70.6%))"
        opacity={0.6}
      >
        {quadrants[0].label}
      </text>
      <text
        x={PADDING + half / 2}
        y={PADDING + half / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--siren-font, system-ui)"
        fontSize="14"
        fontWeight="400"
        fill="var(--siren-text-muted, hsl(0 0% 70.6%))"
        opacity={0.6}
      >
        {quadrants[1].label}
      </text>
      <text
        x={PADDING + half / 2}
        y={PADDING + half + half / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--siren-font, system-ui)"
        fontSize="14"
        fontWeight="400"
        fill="var(--siren-text-muted, hsl(0 0% 70.6%))"
        opacity={0.6}
      >
        {quadrants[2].label}
      </text>
      <text
        x={PADDING + half + half / 2}
        y={PADDING + half + half / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--siren-font, system-ui)"
        fontSize="14"
        fontWeight="400"
        fill="var(--siren-text-muted, hsl(0 0% 70.6%))"
        opacity={0.6}
      >
        {quadrants[3].label}
      </text>

      {/* Axis labels */}
      {xAxis?.label && (
        <text
          x={PADDING + half}
          y={PADDING + CHART_SIZE + 40}
          textAnchor="middle"
          fontFamily="var(--siren-font, system-ui)"
          fontSize="13"
          fontWeight="500"
          fill="var(--siren-text, hsl(0 0% 98%))"
        >
          {xAxis.label}
        </text>
      )}
      {xAxis?.low && (
        <text
          x={PADDING}
          y={PADDING + CHART_SIZE + 20}
          textAnchor="start"
          fontFamily="var(--siren-font, system-ui)"
          fontSize="11"
          fill="var(--siren-text-muted, hsl(0 0% 70.6%))"
        >
          {xAxis.low}
        </text>
      )}
      {xAxis?.high && (
        <text
          x={PADDING + CHART_SIZE}
          y={PADDING + CHART_SIZE + 20}
          textAnchor="end"
          fontFamily="var(--siren-font, system-ui)"
          fontSize="11"
          fill="var(--siren-text-muted, hsl(0 0% 70.6%))"
        >
          {xAxis.high}
        </text>
      )}
      {yAxis?.label && (
        <text
          x={PADDING - 40}
          y={PADDING + half}
          textAnchor="middle"
          fontFamily="var(--siren-font, system-ui)"
          fontSize="13"
          fontWeight="500"
          fill="var(--siren-text, hsl(0 0% 98%))"
          transform={`rotate(-90, ${PADDING - 40}, ${PADDING + half})`}
        >
          {yAxis.label}
        </text>
      )}
      {yAxis?.low && (
        <text
          x={PADDING - 10}
          y={PADDING + CHART_SIZE}
          textAnchor="end"
          fontFamily="var(--siren-font, system-ui)"
          fontSize="11"
          fill="var(--siren-text-muted, hsl(0 0% 70.6%))"
        >
          {yAxis.low}
        </text>
      )}
      {yAxis?.high && (
        <text
          x={PADDING - 10}
          y={PADDING + 10}
          textAnchor="end"
          fontFamily="var(--siren-font, system-ui)"
          fontSize="11"
          fill="var(--siren-text-muted, hsl(0 0% 70.6%))"
        >
          {yAxis.high}
        </text>
      )}
    </svg>
  );
}

function QuadrantChartInner({
  xAxis,
  yAxis,
  quadrants = DEFAULT_QUADRANTS,
  children,
  className,
  style,
}: Omit<QuadrantChartProps, "theme">) {
  const nodes = useMemo(() => {
    const nodes: Node[] = [];

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;

      const type = child.type;
      const props = child.props as Record<string, any>;

      if (
        type === QuadrantItem ||
        (type as any)?.displayName === "QuadrantItem"
      ) {
        const x = typeof props.x === "number" ? props.x : 0.5;
        const y = typeof props.y === "number" ? props.y : 0.5;

        nodes.push({
          id: props.id,
          type: "quadrant-item",
          position: {
            x: x * CHART_SIZE,
            y: (1 - y) * CHART_SIZE,
          },
          data: {
            label: props.label,
          },
        });
      }
    });

    return nodes;
  }, [children]);

  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%", position: "relative", ...style }}
    >
      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={PRO_OPTIONS}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        minZoom={0.3}
        maxZoom={2}
      >
        <QuadrantBackground
          quadrants={quadrants}
          xAxis={xAxis}
          yAxis={yAxis}
        />
      </ReactFlow>
    </div>
  );
}

export function QuadrantChart({ theme, ...props }: QuadrantChartProps) {
  const inner = (
    <ReactFlowProvider>
      <QuadrantChartInner {...props} />
    </ReactFlowProvider>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

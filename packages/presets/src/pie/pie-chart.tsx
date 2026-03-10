"use client";

import React, { useMemo } from "react";
import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";

const DEFAULT_PALETTE = [
  "#0090ff",
  "#30a46c",
  "#ffc53d",
  "#e5484d",
  "#8e4ec6",
  "#0d74ce",
  "#f76b15",
  "#12a594",
];

export interface PieSegment {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  title?: string;
  segments: PieSegment[];
  theme?: SirenTheme;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  const rRound = Math.round(r * 100) / 100;
  return [
    `M ${Math.round(cx * 100) / 100} ${Math.round(cy * 100) / 100}`,
    `L ${start.x} ${start.y}`,
    `A ${rRound} ${rRound} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angle: number,
): { x: number; y: number } {
  return {
    x: Math.round((cx + r * Math.cos(angle)) * 100) / 100,
    y: Math.round((cy + r * Math.sin(angle)) * 100) / 100,
  };
}

function PieChartInner({
  title,
  segments,
  className,
  style,
  size = 300,
}: Omit<PieChartProps, "theme">) {
  const total = useMemo(
    () => segments.reduce((sum, s) => sum + s.value, 0),
    [segments],
  );

  const nonZeroSegments = useMemo(
    () => segments.filter((s) => s.value > 0),
    [segments],
  );

  const arcs = useMemo(() => {
    let currentAngle = -Math.PI / 2; // Start from top
    return nonZeroSegments.map((segment, i) => {
      const sliceAngle = total > 0 ? (segment.value / total) * Math.PI * 2 : 0;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;
      currentAngle = endAngle;

      return {
        ...segment,
        color: segment.color ?? DEFAULT_PALETTE[i % DEFAULT_PALETTE.length],
        startAngle,
        endAngle,
        midAngle,
        percentage: total > 0 ? ((segment.value / total) * 100).toFixed(1) : "0",
      };
    });
  }, [nonZeroSegments, total]);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 10;
  const legendX = size + 24;
  const svgWidth = size + 200;
  const titleHeight = title ? 36 : 0;
  const svgHeight = Math.max(
    size + titleHeight,
    titleHeight + arcs.length * 24 + 20,
  );

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--siren-font, system-ui)",
        ...style,
      }}
    >
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ maxWidth: "100%", height: "auto" }}
        role="img"
        aria-label={title ?? "Pie chart"}
      >
        <title>{title ?? "Pie chart"}</title>
        {/* Title */}
        {title && (
          <text
            x={cx}
            y={20}
            textAnchor="middle"
            fontFamily="var(--siren-font, system-ui)"
            fontSize="16"
            fontWeight="500"
            fill="var(--siren-text, #1e293b)"
          >
            {title}
          </text>
        )}

        {/* Pie slices */}
        <g transform={`translate(0, ${titleHeight})`}>
          {arcs.map((arc, i) => {
            // Full circle case
            if (arcs.length === 1) {
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill={arc.color}
                  stroke="var(--siren-node, hsl(0 0% 12.2%))"
                  strokeWidth={2}
                />
              );
            }

            return (
              <path
                key={i}
                d={describeArc(cx, cy, radius, arc.startAngle, arc.endAngle)}
                fill={arc.color}
                stroke="var(--siren-node, hsl(0 0% 12.2%))"
                strokeWidth={2}
              />
            );
          })}

          {/* Center circle for donut effect (optional visual) */}
        </g>

        {/* Legend */}
        <g transform={`translate(${legendX}, ${titleHeight + 10})`}>
          {arcs.map((arc, i) => (
            <g key={i} transform={`translate(0, ${i * 24})`}>
              <rect
                x={0}
                y={0}
                width={14}
                height={14}
                rx={3}
                fill={arc.color}
              />
              <text
                x={22}
                y={11}
                fontFamily="var(--siren-font, system-ui)"
                fontSize="12"
                fill="var(--siren-text, #1e293b)"
              >
                {arc.label} ({arc.percentage}%)
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export function PieChart({ theme, ...props }: PieChartProps) {
  if (theme) {
    return (
      <SirenProvider theme={theme}>
        <PieChartInner {...props} />
      </SirenProvider>
    );
  }

  return <PieChartInner {...props} />;
}

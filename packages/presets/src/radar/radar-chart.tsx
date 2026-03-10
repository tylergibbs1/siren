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
];

interface RadarSeries {
  label: string;
  values: number[];
  color?: string;
}

interface RadarChartProps {
  title?: string;
  axes: string[];
  series: RadarSeries[];
  max?: number;
  theme?: SirenTheme;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}

const CONTAINER_STYLE: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "var(--siren-font, system-ui)",
};

const SVG_STYLE: React.CSSProperties = { maxWidth: "100%", height: "auto" };

function polarToXY(cx: number, cy: number, r: number, angleIndex: number, total: number) {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2;
  return {
    x: Math.round((cx + r * Math.cos(angle)) * 100) / 100,
    y: Math.round((cy + r * Math.sin(angle)) * 100) / 100,
  };
}

function RadarChartInner({
  title,
  axes,
  series,
  max: maxProp,
  className,
  style,
  size = 360,
}: Omit<RadarChartProps, "theme">) {
  const maxValue = useMemo(() => {
    if (maxProp !== undefined) return maxProp;
    return Math.max(...series.flatMap((s) => s.values), 1);
  }, [maxProp, series]);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 50;
  const n = axes.length;
  const rings = 5;

  const titleHeight = title ? 32 : 0;
  const legendHeight = series.length > 1 ? series.length * 20 + 10 : 0;
  const svgHeight = size + titleHeight + legendHeight;

  return (
    <div
      className={className}
      style={style ? { ...CONTAINER_STYLE, ...style } : CONTAINER_STYLE}
    >
      <svg
        viewBox={`0 0 ${size} ${svgHeight}`}
        style={SVG_STYLE}
        role="img"
        aria-label={title ?? "Radar chart"}
      >
        <title>{title ?? "Radar chart"}</title>
        {title ? (
          <text
            x={cx}
            y={22}
            textAnchor="middle"
            fontFamily="var(--siren-font, system-ui)"
            fontSize="15"
            fontWeight="500"
            fill="var(--siren-text, #1e293b)"
          >
            {title}
          </text>
        ) : null}

        <g transform={`translate(0, ${titleHeight})`}>
          {/* Grid rings */}
          {Array.from({ length: rings }, (_, r) => {
            const ringRadius = (radius * (r + 1)) / rings;
            const points = Array.from({ length: n }, (_, i) =>
              polarToXY(cx, cy, ringRadius, i, n),
            );
            const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
            return (
              <path
                key={r}
                d={d}
                fill="none"
                stroke="var(--siren-node-border, hsl(0 0% 18%))"
                strokeWidth={0.5}
                opacity={0.5}
              />
            );
          })}

          {/* Axis lines and labels */}
          {axes.map((label, i) => {
            const outer = polarToXY(cx, cy, radius, i, n);
            const labelPt = polarToXY(cx, cy, radius + 20, i, n);
            return (
              <g key={i}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="var(--siren-node-border, hsl(0 0% 18%))"
                  strokeWidth={0.5}
                />
                <text
                  x={labelPt.x}
                  y={labelPt.y + 4}
                  textAnchor="middle"
                  fontFamily="var(--siren-font, system-ui)"
                  fontSize="10"
                  fill="var(--siren-text-muted, hsl(0 0% 70.6%))"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Data series */}
          {series.map((s, sIdx) => {
            const color = s.color ?? DEFAULT_PALETTE[sIdx % DEFAULT_PALETTE.length]!;
            const points = s.values.map((v, i) => {
              const r = (v / maxValue) * radius;
              return polarToXY(cx, cy, r, i, n);
            });
            const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

            return (
              <g key={sIdx}>
                <path d={d} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={2} />
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
                ))}
              </g>
            );
          })}
        </g>

        {/* Legend */}
        {series.length > 1 ? (
          <g transform={`translate(16, ${size + titleHeight})`}>
            {series.map((s, i) => (
              <g key={i} transform={`translate(0, ${i * 20})`}>
                <rect
                  x={0}
                  y={0}
                  width={12}
                  height={12}
                  rx={2}
                  fill={s.color ?? DEFAULT_PALETTE[i % DEFAULT_PALETTE.length]}
                />
                <text
                  x={18}
                  y={10}
                  fontFamily="var(--siren-font, system-ui)"
                  fontSize="11"
                  fill="var(--siren-text, #1e293b)"
                >
                  {s.label}
                </text>
              </g>
            ))}
          </g>
        ) : null}
      </svg>
    </div>
  );
}

export function RadarChart({ theme, ...props }: RadarChartProps) {
  if (theme) {
    return (
      <SirenProvider theme={theme}>
        <RadarChartInner {...props} />
      </SirenProvider>
    );
  }

  return <RadarChartInner {...props} />;
}

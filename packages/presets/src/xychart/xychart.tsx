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

interface Series {
  label: string;
  type: "line" | "bar";
  data: number[];
  color?: string;
}

interface XYChartProps {
  title?: string;
  xLabel?: string;
  yLabel?: string;
  xAxis: string[];
  series: Series[];
  theme?: SirenTheme;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}

const PADDING = { top: 40, right: 40, bottom: 60, left: 60 } as const;

const CONTAINER_STYLE: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "var(--siren-font, system-ui)",
};

const SVG_STYLE: React.CSSProperties = { maxWidth: "100%", height: "auto" };

function XYChartInner({
  title,
  xLabel,
  yLabel,
  xAxis,
  series,
  className,
  style,
  width = 500,
  height = 320,
}: Omit<XYChartProps, "theme">) {
  const plotW = width - PADDING.left - PADDING.right;
  const plotH = height - PADDING.top - PADDING.bottom;

  const { yMin, yMax, yTicks } = useMemo(() => {
    const allValues = series.flatMap((s) => s.data);
    const min = Math.min(0, ...allValues);
    const max = Math.max(...allValues);
    const range = max - min || 1;
    const step = Math.pow(10, Math.floor(Math.log10(range)));
    const yMin = Math.floor(min / step) * step;
    const yMax = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let v = yMin; v <= yMax; v += step) {
      ticks.push(Math.round(v * 1000) / 1000);
    }
    return { yMin, yMax, yTicks: ticks };
  }, [series]);

  const xStep = xAxis.length > 1 ? plotW / (xAxis.length - 1) : plotW;
  const barSeriesCount = series.filter((s) => s.type === "bar").length;
  const barGroupWidth = xAxis.length > 0 ? plotW / xAxis.length : plotW;
  const barWidth = barSeriesCount > 0 ? Math.min(30, (barGroupWidth * 0.7) / barSeriesCount) : 0;

  function yScale(v: number): number {
    return plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH;
  }

  let barIndex = 0;
  const titleHeight = title ? 20 : 0;

  return (
    <div
      className={className}
      style={style ? { ...CONTAINER_STYLE, ...style } : CONTAINER_STYLE}
    >
      <svg
        viewBox={`0 0 ${width} ${height + titleHeight}`}
        style={SVG_STYLE}
        role="img"
        aria-label={title ?? "XY chart"}
      >
        <title>{title ?? "XY chart"}</title>
        {title ? (
          <text
            x={width / 2}
            y={20}
            textAnchor="middle"
            fontFamily="var(--siren-font, system-ui)"
            fontSize="15"
            fontWeight="500"
            fill="var(--siren-text, #1e293b)"
          >
            {title}
          </text>
        ) : null}

        <g transform={`translate(${PADDING.left}, ${PADDING.top + titleHeight})`}>
          {/* Y grid lines and labels */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={0}
                y1={yScale(tick)}
                x2={plotW}
                y2={yScale(tick)}
                stroke="var(--siren-node-border, hsl(0 0% 18%))"
                strokeWidth={0.5}
                opacity={0.5}
              />
              <text
                x={-8}
                y={yScale(tick) + 4}
                textAnchor="end"
                fontFamily="var(--siren-font, system-ui)"
                fontSize="10"
                fill="var(--siren-text-muted, hsl(0 0% 70.6%))"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {xAxis.map((label, i) => (
            <text
              key={i}
              x={xAxis.length > 1 ? i * xStep : plotW / 2}
              y={plotH + 20}
              textAnchor="middle"
              fontFamily="var(--siren-font, system-ui)"
              fontSize="10"
              fill="var(--siren-text-muted, hsl(0 0% 70.6%))"
            >
              {label}
            </text>
          ))}

          {/* Axes */}
          <line x1={0} y1={0} x2={0} y2={plotH} stroke="var(--siren-edge, hsl(0 0% 40%))" strokeWidth={1} />
          <line x1={0} y1={plotH} x2={plotW} y2={plotH} stroke="var(--siren-edge, hsl(0 0% 40%))" strokeWidth={1} />

          {/* Series */}
          {series.map((s, sIdx) => {
            const color = s.color ?? DEFAULT_PALETTE[sIdx % DEFAULT_PALETTE.length]!;

            if (s.type === "bar") {
              const thisBarIdx = barIndex++;
              const groupOffset = -((barSeriesCount * barWidth) / 2) + thisBarIdx * barWidth;

              return (
                <g key={sIdx}>
                  {s.data.map((val, i) => {
                    const x = (xAxis.length > 1 ? i * xStep : plotW / 2) + groupOffset;
                    const barH = ((val - yMin) / (yMax - yMin || 1)) * plotH;
                    return (
                      <rect
                        key={i}
                        x={x}
                        y={plotH - barH}
                        width={barWidth}
                        height={barH}
                        fill={color}
                        opacity={0.8}
                        rx={2}
                      />
                    );
                  })}
                </g>
              );
            }

            // Line
            const points = s.data.map((val, i) => {
              const x = xAxis.length > 1 ? i * xStep : plotW / 2;
              return `${x},${yScale(val)}`;
            });

            return (
              <g key={sIdx}>
                <polyline
                  points={points.join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                {s.data.map((val, i) => (
                  <circle
                    key={i}
                    cx={xAxis.length > 1 ? i * xStep : plotW / 2}
                    cy={yScale(val)}
                    r={3}
                    fill={color}
                  />
                ))}
              </g>
            );
          })}

          {/* Axis labels */}
          {xLabel ? (
            <text
              x={plotW / 2}
              y={plotH + 45}
              textAnchor="middle"
              fontFamily="var(--siren-font, system-ui)"
              fontSize="12"
              fontWeight="500"
              fill="var(--siren-text, #1e293b)"
            >
              {xLabel}
            </text>
          ) : null}
          {yLabel ? (
            <text
              x={-plotH / 2}
              y={-45}
              textAnchor="middle"
              fontFamily="var(--siren-font, system-ui)"
              fontSize="12"
              fontWeight="500"
              fill="var(--siren-text, #1e293b)"
              transform="rotate(-90)"
            >
              {yLabel}
            </text>
          ) : null}
        </g>

        {/* Legend */}
        {series.length > 1 ? (
          <g transform={`translate(${PADDING.left + 8}, ${PADDING.top + titleHeight + 8})`}>
            {series.map((s, i) => (
              <g key={i} transform={`translate(${i * 100}, 0)`}>
                <rect
                  x={0}
                  y={0}
                  width={10}
                  height={10}
                  rx={2}
                  fill={s.color ?? DEFAULT_PALETTE[i % DEFAULT_PALETTE.length]}
                />
                <text
                  x={14}
                  y={9}
                  fontFamily="var(--siren-font, system-ui)"
                  fontSize="10"
                  fill="var(--siren-text-muted, hsl(0 0% 70.6%))"
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

export function XYChart({ theme, ...props }: XYChartProps) {
  if (theme) {
    return (
      <SirenProvider theme={theme}>
        <XYChartInner {...props} />
      </SirenProvider>
    );
  }

  return <XYChartInner {...props} />;
}

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

interface TreemapNodeData {
  label: string;
  value?: number;
  color?: string;
  children?: TreemapNodeData[];
}

interface TreemapChartProps {
  title?: string;
  root: {
    label: string;
    children: TreemapNodeData[];
  };
  theme?: SirenTheme;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
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

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
  value: number;
}

function getLeafValue(node: TreemapNodeData): number {
  if (node.value !== undefined) return node.value;
  if (node.children) return node.children.reduce((s, c) => s + getLeafValue(c), 0);
  return 0;
}

function squarify(
  nodes: TreemapNodeData[],
  x: number,
  y: number,
  w: number,
  h: number,
  colorOffset: number,
): Rect[] {
  if (nodes.length === 0) return [];

  const total = nodes.reduce((s, n) => s + getLeafValue(n), 0);
  if (total === 0) return [];

  const rects: Rect[] = [];
  let cx = x;
  let cy = y;
  let remainingW = w;
  let remainingH = h;

  const sorted = [...nodes].sort((a, b) => getLeafValue(b) - getLeafValue(a));

  for (let i = 0; i < sorted.length; i++) {
    const node = sorted[i]!;
    const value = getLeafValue(node);
    const remainingTotal = sorted.slice(i).reduce((s, n) => s + getLeafValue(n), 0);
    const ratio = remainingTotal > 0 ? value / remainingTotal : 1;

    const isHorizontal = remainingW > remainingH;
    const nodeW = isHorizontal ? remainingW * ratio : remainingW;
    const nodeH = isHorizontal ? remainingH : remainingH * ratio;

    rects.push({
      x: cx,
      y: cy,
      w: nodeW,
      h: nodeH,
      label: node.label,
      color: node.color ?? DEFAULT_PALETTE[(i + colorOffset) % DEFAULT_PALETTE.length]!,
      value,
    });

    if (isHorizontal) {
      cx += nodeW;
      remainingW -= nodeW;
    } else {
      cy += nodeH;
      remainingH -= nodeH;
    }
  }

  return rects;
}

function TreemapChartInner({
  title,
  root,
  className,
  style,
  width = 500,
  height = 320,
}: Omit<TreemapChartProps, "theme">) {
  const titleHeight = title ? 32 : 0;

  const rects = useMemo(
    () => squarify(root.children, 2, titleHeight + 2, width - 4, height - titleHeight - 4, 0),
    [root, width, height, titleHeight],
  );

  return (
    <div
      className={className}
      style={style ? { ...CONTAINER_STYLE, ...style } : CONTAINER_STYLE}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={SVG_STYLE}
        role="img"
        aria-label={title ?? root.label}
      >
        <title>{title ?? root.label}</title>
        {title ? (
          <text
            x={width / 2}
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

        {rects.map((rect, i) => (
          <g key={i}>
            <rect
              x={rect.x}
              y={rect.y}
              width={Math.max(0, rect.w - 2)}
              height={Math.max(0, rect.h - 2)}
              rx={4}
              fill={rect.color}
              opacity={0.75}
              stroke="var(--siren-background, hsl(0 0% 7.1%))"
              strokeWidth={2}
            />
            {rect.w > 40 && rect.h > 20 ? (
              <text
                x={rect.x + rect.w / 2 - 1}
                y={rect.y + rect.h / 2 + 4}
                textAnchor="middle"
                fontFamily="var(--siren-font, system-ui)"
                fontSize={Math.min(12, rect.w / 8)}
                fontWeight="500"
                fill="#fff"
              >
                {rect.label}
              </text>
            ) : null}
            {rect.w > 50 && rect.h > 36 ? (
              <text
                x={rect.x + rect.w / 2 - 1}
                y={rect.y + rect.h / 2 + 18}
                textAnchor="middle"
                fontFamily="var(--siren-font, system-ui)"
                fontSize="10"
                fill="rgba(255,255,255,0.7)"
              >
                {rect.value}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}

export function TreemapChart({ theme, ...props }: TreemapChartProps) {
  if (theme) {
    return (
      <SirenProvider theme={theme}>
        <TreemapChartInner {...props} />
      </SirenProvider>
    );
  }

  return <TreemapChartInner {...props} />;
}

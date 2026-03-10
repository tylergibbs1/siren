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

interface VennSet {
  id: string;
  label: string;
  value: number;
  color?: string;
}

interface VennIntersection {
  sets: string[];
  label?: string;
  value: number;
}

interface VennDiagramProps {
  title?: string;
  sets: VennSet[];
  intersections?: VennIntersection[];
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

function VennDiagramInner({
  title,
  sets,
  intersections,
  className,
  style,
  size = 400,
}: Omit<VennDiagramProps, "theme">) {
  const titleHeight = title ? 32 : 0;
  const svgHeight = size + titleHeight;
  const cx = size / 2;
  const cy = size / 2;

  const layout = useMemo(() => {
    const n = sets.length;
    if (n === 0) return [];

    const maxValue = Math.max(...sets.map((s) => s.value), 1);
    const baseRadius = size / 4;
    const spread = n <= 2 ? baseRadius * 0.6 : baseRadius * 0.8;

    return sets.map((set, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const offset = n === 1 ? 0 : spread;
      const r = baseRadius * Math.sqrt(set.value / maxValue);

      return {
        ...set,
        cx: cx + offset * Math.cos(angle),
        cy: cy + offset * Math.sin(angle),
        r: Math.max(r, 30),
        color: set.color ?? DEFAULT_PALETTE[i % DEFAULT_PALETTE.length]!,
      };
    });
  }, [sets, size, cx, cy]);

  return (
    <div
      className={className}
      style={style ? { ...CONTAINER_STYLE, ...style } : CONTAINER_STYLE}
    >
      <svg
        viewBox={`0 0 ${size} ${svgHeight}`}
        style={SVG_STYLE}
        role="img"
        aria-label={title ?? "Venn diagram"}
      >
        <title>{title ?? "Venn diagram"}</title>
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
          {/* Circles */}
          {layout.map((set, i) => (
            <circle
              key={set.id}
              cx={set.cx}
              cy={set.cy}
              r={set.r}
              fill={set.color}
              fillOpacity={0.25}
              stroke={set.color}
              strokeWidth={2}
            />
          ))}

          {/* Labels */}
          {layout.map((set) => {
            // Position label at the far side of the circle from center
            const dx = set.cx - cx;
            const dy = set.cy - cy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const labelDist = set.r * 0.5;
            const lx = set.cx + (dx / dist) * labelDist * (layout.length === 1 ? 0 : 0.3);
            const ly = set.cy + (dy / dist) * labelDist * (layout.length === 1 ? 0 : 0.3);

            return (
              <g key={`label-${set.id}`}>
                <text
                  x={layout.length === 1 ? set.cx : lx}
                  y={layout.length === 1 ? set.cy - 6 : ly - 6}
                  textAnchor="middle"
                  fontFamily="var(--siren-font, system-ui)"
                  fontSize="13"
                  fontWeight="500"
                  fill="var(--siren-text, #1e293b)"
                >
                  {set.label}
                </text>
                <text
                  x={layout.length === 1 ? set.cx : lx}
                  y={layout.length === 1 ? set.cy + 10 : ly + 10}
                  textAnchor="middle"
                  fontFamily="var(--siren-font, system-ui)"
                  fontSize="11"
                  fill="var(--siren-text-muted, hsl(0 0% 70.6%))"
                >
                  {set.value}
                </text>
              </g>
            );
          })}

          {/* Intersection labels */}
          {intersections?.map((inter, i) => {
            const interSets = inter.sets
              .map((id) => layout.find((s) => s.id === id))
              .filter(Boolean) as typeof layout;

            if (interSets.length < 2) return null;

            const midX = interSets.reduce((s, c) => s + c.cx, 0) / interSets.length;
            const midY = interSets.reduce((s, c) => s + c.cy, 0) / interSets.length;

            return (
              <text
                key={`inter-${i}`}
                x={midX}
                y={midY + 4}
                textAnchor="middle"
                fontFamily="var(--siren-font, system-ui)"
                fontSize="11"
                fontWeight="500"
                fill="var(--siren-text, #1e293b)"
              >
                {inter.label ?? inter.value}
              </text>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export function VennDiagram({ theme, ...props }: VennDiagramProps) {
  if (theme) {
    return (
      <SirenProvider theme={theme}>
        <VennDiagramInner {...props} />
      </SirenProvider>
    );
  }

  return <VennDiagramInner {...props} />;
}

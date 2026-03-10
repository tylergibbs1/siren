"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";
import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";
import { GanttBar } from "./gantt-bar";
import { GanttMilestone } from "./gantt-milestone";
import { PRO_OPTIONS } from "../shared/edge-styles";

// Hoisted module-level
const nodeTypes = {
  "gantt-bar": GanttBar,
  "gantt-milestone": GanttMilestone,
};

const SECTION_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#ef4444", // red
  "#ec4899", // pink
  "#f97316", // orange
];

interface GanttTask {
  id: string;
  label: string;
  start: string;
  end: string;
  milestone?: boolean;
}

interface GanttSection {
  label: string;
  tasks: GanttTask[];
}

interface GanttChartProps {
  title?: string;
  sections: GanttSection[];
  theme?: SirenTheme;
  className?: string;
  style?: React.CSSProperties;
}

function parseDate(dateStr: string): number {
  return new Date(dateStr).getTime();
}

function GanttChartInner({
  title,
  sections,
  className,
  style,
}: Omit<GanttChartProps, "theme">) {
  const { nodes } = useMemo(() => {
    const PIXELS_PER_DAY = 12;
    const ROW_HEIGHT = 40;
    const SECTION_HEADER_HEIGHT = 32;
    const LEFT_MARGIN = 0;

    // Calculate global date range
    let minDate = Infinity;
    let maxDate = -Infinity;
    for (const section of sections) {
      for (const task of section.tasks) {
        const start = parseDate(task.start);
        const end = parseDate(task.end);
        if (start < minDate) minDate = start;
        if (end > maxDate) maxDate = end;
      }
    }

    const nodes: Node[] = [];
    let currentY = title ? 40 : 0;

    // Title node (simple text)
    if (title) {
      nodes.push({
        id: "__gantt-title",
        type: "default",
        position: { x: LEFT_MARGIN, y: 0 },
        data: { label: title },
        style: {
          background: "transparent",
          border: "none",
          fontFamily: "var(--siren-font, system-ui)",
          fontSize: "16px",
          fontWeight: 500,
          color: "var(--siren-text, #1e293b)",
          boxShadow: "none",
        },
        selectable: false,
        draggable: false,
      });
    }

    sections.forEach((section, sectionIndex) => {
      const sectionColor =
        SECTION_COLORS[sectionIndex % SECTION_COLORS.length];

      // Section header
      nodes.push({
        id: `__section-${sectionIndex}`,
        type: "default",
        position: { x: LEFT_MARGIN, y: currentY },
        data: { label: section.label },
        style: {
          background: "transparent",
          border: "none",
          fontFamily: "var(--siren-font-mono, monospace)",
          fontSize: "10px",
          fontWeight: 400,
          color: "var(--siren-text-subtle, hsl(0 0% 53.7%))",
          boxShadow: "none",
          textTransform: "uppercase" as const,
          letterSpacing: "0.06em",
        },
        selectable: false,
        draggable: false,
      });
      currentY += SECTION_HEADER_HEIGHT;

      for (const task of section.tasks) {
        const startMs = parseDate(task.start);
        const endMs = parseDate(task.end);
        const daysDuration =
          (endMs - startMs) / (1000 * 60 * 60 * 24);
        const daysOffset =
          (startMs - minDate) / (1000 * 60 * 60 * 24);

        const x = LEFT_MARGIN + daysOffset * PIXELS_PER_DAY;
        const width = Math.max(daysDuration * PIXELS_PER_DAY, 20);

        if (task.milestone) {
          nodes.push({
            id: task.id,
            type: "gantt-milestone",
            position: { x, y: currentY },
            data: { label: task.label },
          });
        } else {
          nodes.push({
            id: task.id,
            type: "gantt-bar",
            position: { x, y: currentY },
            data: { label: task.label, color: sectionColor },
            style: { width: `${width}px`, height: "28px" },
          });
        }

        currentY += ROW_HEIGHT;
      }
    });

    return { nodes };
  }, [title, sections]);

  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        fitView
        proOptions={PRO_OPTIONS}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="var(--siren-node-border, hsl(0 0% 18%))"
        />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export function GanttChart({ theme, ...props }: GanttChartProps) {
  const inner = (
    <ReactFlowProvider>
      <GanttChartInner {...props} />
    </ReactFlowProvider>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

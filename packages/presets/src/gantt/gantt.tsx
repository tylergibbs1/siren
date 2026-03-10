"use client";

import React, { Children, isValidElement, useId, useMemo } from "react";
import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";
import { GanttTask, type GanttVariant } from "./gantt-task";
import { GanttSection } from "./gantt-section";

const VARIANT_COLORS: Record<GanttVariant, { fill: string; progress: string }> = {
  default: {
    fill: "var(--siren-primary, #3b82f6)",
    progress: "var(--siren-primary, #2563eb)",
  },
  primary: {
    fill: "var(--siren-primary, #3b82f6)",
    progress: "var(--siren-primary, #2563eb)",
  },
  success: {
    fill: "var(--siren-success, #22c55e)",
    progress: "var(--siren-success, #16a34a)",
  },
  warning: {
    fill: "var(--siren-warning, #f59e0b)",
    progress: "var(--siren-warning, #d97706)",
  },
  danger: {
    fill: "var(--siren-danger, #ef4444)",
    progress: "var(--siren-danger, #dc2626)",
  },
};

interface ParsedTask {
  id: string;
  label: string;
  start: Date;
  end: Date;
  progress: number;
  variant: GanttVariant;
  dependencies: string[];
  section?: string;
}

interface GanttProps {
  title?: string;
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Collect tasks from declarative children.
 * Supports both direct GanttTask children and GanttSection-wrapped children.
 */
function collectTasks(children: React.ReactNode): ParsedTask[] {
  const tasks: ParsedTask[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    const type = child.type;
    const props = child.props as Record<string, any>;

    if (
      type === GanttSection ||
      (type as any)?.displayName === "GanttSection"
    ) {
      const sectionLabel = props.label as string;
      Children.forEach(props.children, (taskChild) => {
        if (!isValidElement(taskChild)) return;
        const taskType = taskChild.type;
        const taskProps = taskChild.props as Record<string, any>;

        if (
          taskType === GanttTask ||
          (taskType as any)?.displayName === "GanttTask"
        ) {
          tasks.push({
            id: taskProps.id,
            label: taskProps.label,
            start: new Date(taskProps.start),
            end: new Date(taskProps.end),
            progress: taskProps.progress ?? 0,
            variant: taskProps.variant ?? "default",
            dependencies: taskProps.dependencies ?? [],
            section: sectionLabel,
          });
        }
      });
    } else if (
      type === GanttTask ||
      (type as any)?.displayName === "GanttTask"
    ) {
      tasks.push({
        id: props.id,
        label: props.label,
        start: new Date(props.start),
        end: new Date(props.end),
        progress: props.progress ?? 0,
        variant: props.variant ?? "default",
        dependencies: props.dependencies ?? [],
      });
    }
  });

  return tasks;
}

/** Compute the number of days between two dates. */
function daysBetween(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/** Format a date as "MMM DD". */
function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Layout constants
const ROW_HEIGHT = 36;
const ROW_GAP = 4;
const LABEL_WIDTH = 200;
const HEADER_HEIGHT = 48;
const DAY_WIDTH = 20;
const PADDING = 16;

function GanttInner({
  title,
  children,
  className,
  style,
}: Omit<GanttProps, "theme">) {
  const markerId = useId();
  const arrowMarkerId = `gantt-arrow-${markerId.replace(/:/g, "")}`;

  const rawTasks = collectTasks(children);
  const taskKey = rawTasks
    .map((t) => `${t.id}:${t.start.getTime()}:${t.end.getTime()}:${t.progress}:${t.variant}`)
    .join("|");
  const tasks = useMemo(() => rawTasks, [taskKey]);

  const { timelineStart, totalDays, columns } = useMemo(() => {
    if (tasks.length === 0) {
      return { timelineStart: new Date(), totalDays: 1, columns: [] as Date[] };
    }

    const allStarts = tasks.map((t) => t.start.getTime());
    const allEnds = tasks.map((t) => t.end.getTime());
    const minTime = Math.min(...allStarts);
    const maxTime = Math.max(...allEnds);

    // Pad by 1 day on each side
    const timelineStart = new Date(minTime - 1000 * 60 * 60 * 24);
    const timelineEnd = new Date(maxTime + 1000 * 60 * 60 * 24);
    const totalDays = daysBetween(timelineStart, timelineEnd);

    // Generate column dates (one per day, but show every Nth to avoid crowding)
    const step = Math.max(1, Math.ceil(totalDays / 20));
    const columns: Date[] = [];
    for (let i = 0; i <= totalDays; i += step) {
      const d = new Date(timelineStart.getTime() + i * 1000 * 60 * 60 * 24);
      columns.push(d);
    }

    return { timelineStart, totalDays, columns };
  }, [tasks]);

  const taskIdToIndex = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((t, i) => map.set(t.id, i));
    return map;
  }, [tasks]);

  const titleHeight = title ? 32 : 0;
  const chartWidth = LABEL_WIDTH + totalDays * DAY_WIDTH + PADDING * 2;
  const chartHeight =
    titleHeight +
    HEADER_HEIGHT +
    tasks.length * (ROW_HEIGHT + ROW_GAP) +
    PADDING * 2;

  /** Get X position for a date on the timeline. */
  function dateToX(date: Date): number {
    const days = daysBetween(timelineStart, date);
    return LABEL_WIDTH + days * DAY_WIDTH;
  }

  /** Get Y center for a task row. */
  function rowY(index: number): number {
    return titleHeight + HEADER_HEIGHT + PADDING + index * (ROW_HEIGHT + ROW_GAP);
  }

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflowX: "auto",
        fontFamily: "var(--siren-font, system-ui)",
        ...style,
      }}
    >
      <svg
        width={chartWidth}
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        role="img"
        aria-label={title ?? "Gantt chart"}
      >
        <title>{title ?? "Gantt chart"}</title>
        {/* Arrow marker definition */}
        <defs>
          <marker
            id={arrowMarkerId}
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path
              d="M 0 0 L 10 5 L 0 10 z"
              fill="var(--siren-edge, #94a3b8)"
            />
          </marker>
        </defs>

        {/* Title */}
        {title && (
          <text
            x={chartWidth / 2}
            y={22}
            textAnchor="middle"
            fontFamily="var(--siren-font, system-ui)"
            fontSize="16"
            fontWeight="700"
            fill="var(--siren-text, #1e293b)"
          >
            {title}
          </text>
        )}

        {/* Header date columns */}
        {columns.map((date, i) => {
          const x = dateToX(date);
          return (
            <g key={i}>
              <text
                x={x}
                y={titleHeight + 20}
                textAnchor="middle"
                fontFamily="var(--siren-font, system-ui)"
                fontSize="11"
                fontWeight="500"
                fill="var(--siren-text-muted, #64748b)"
              >
                {formatDate(date)}
              </text>
              {/* Grid line */}
              <line
                x1={x}
                y1={titleHeight + HEADER_HEIGHT - 8}
                x2={x}
                y2={chartHeight}
                stroke="var(--siren-node-border, #e2e8f0)"
                strokeWidth="1"
                opacity="0.5"
              />
            </g>
          );
        })}

        {/* Header separator */}
        <line
          x1={0}
          y1={titleHeight + HEADER_HEIGHT - 8}
          x2={chartWidth}
          y2={titleHeight + HEADER_HEIGHT - 8}
          stroke="var(--siren-node-border, #e2e8f0)"
          strokeWidth="1"
        />

        {/* Task rows */}
        {tasks.map((task, i) => {
          const y = rowY(i);
          const barX = dateToX(task.start);
          const barWidth = Math.max(
            (daysBetween(task.start, task.end)) * DAY_WIDTH,
            DAY_WIDTH,
          );
          const barY = y + 4;
          const barHeight = ROW_HEIGHT - 8;
          const colors = VARIANT_COLORS[task.variant];
          const progressWidth = barWidth * (task.progress / 100);

          return (
            <g key={task.id}>
              {/* Row background (alternating) */}
              <rect
                x={0}
                y={y}
                width={chartWidth}
                height={ROW_HEIGHT}
                fill={i % 2 === 0 ? "transparent" : "var(--siren-node-border, #e2e8f0)"}
                opacity="0.08"
              />

              {/* Section / task label */}
              <text
                x={PADDING}
                y={y + ROW_HEIGHT / 2 + 4}
                fontFamily="var(--siren-font, system-ui)"
                fontSize="12"
                fontWeight="500"
                fill="var(--siren-text, #1e293b)"
              >
                {task.section ? `${task.section}: ` : ""}
                {task.label}
              </text>

              {/* Task bar */}
              <rect
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={colors.fill}
                opacity={0.75}
              />

              {/* Progress overlay */}
              {task.progress > 0 && (
                <rect
                  x={barX}
                  y={barY}
                  width={progressWidth}
                  height={barHeight}
                  rx={4}
                  fill={colors.progress}
                  opacity={1}
                />
              )}

              {/* Bar label */}
              <text
                x={barX + 6}
                y={barY + barHeight / 2 + 4}
                fontFamily="var(--siren-font, system-ui)"
                fontSize="10"
                fontWeight="600"
                fill="var(--siren-text, #1e293b)"
              >
                {task.progress > 0 ? `${task.progress}%` : ""}
              </text>
            </g>
          );
        })}

        {/* Dependency arrows */}
        {tasks.map((task) =>
          task.dependencies.map((depId) => {
            const sourceIndex = taskIdToIndex.get(depId);
            if (sourceIndex === undefined) return null;
            const targetIndex = taskIdToIndex.get(task.id);
            if (targetIndex === undefined) return null;

            const sourceTask = tasks[sourceIndex];
            const sourceEndX = dateToX(sourceTask.end);
            const sourceY = rowY(sourceIndex) + ROW_HEIGHT / 2;
            const targetStartX = dateToX(task.start);
            const targetY = rowY(targetIndex) + ROW_HEIGHT / 2;

            // Route: go right from source end, then down/up, then to target start
            const midX = sourceEndX + 12;

            return (
              <path
                key={`${depId}-${task.id}`}
                d={`M ${sourceEndX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetStartX} ${targetY}`}
                fill="none"
                stroke="var(--siren-edge, #94a3b8)"
                strokeWidth="1.5"
                markerEnd={`url(#${arrowMarkerId})`}
              />
            );
          }),
        )}
      </svg>
    </div>
  );
}

export function Gantt({ theme, ...props }: GanttProps) {
  if (theme) {
    return (
      <SirenProvider theme={theme}>
        <GanttInner {...props} />
      </SirenProvider>
    );
  }

  return <GanttInner {...props} />;
}

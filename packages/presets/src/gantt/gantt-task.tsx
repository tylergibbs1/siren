"use client";

export type GanttVariant = "default" | "primary" | "success" | "warning" | "danger";

/**
 * GanttTask is a declarative component for describing tasks within a Gantt section.
 * It's not rendered directly — it's collected by the Gantt parent
 * and converted to SVG elements.
 */
export function GanttTask(_props: {
  id: string;
  label: string;
  start: string;
  end: string;
  progress?: number;
  variant?: GanttVariant;
  dependencies?: string[];
}) {
  return null;
}

GanttTask.displayName = "GanttTask";

"use client";

import type React from "react";

/**
 * GanttSection is a declarative component for grouping tasks in a Gantt chart.
 * It's not rendered directly — it's collected by the Gantt parent
 * and used for labeling row groups.
 */
export function GanttSection(_props: {
  label: string;
  children: React.ReactNode;
}) {
  return null;
}

GanttSection.displayName = "GanttSection";

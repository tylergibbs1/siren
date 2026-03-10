"use client";

/**
 * MindmapItem is a declarative component for describing nodes in a mindmap.
 * It's not rendered directly — it's collected by the Mindmap parent
 * and converted to React Flow nodes and edges.
 */
export function MindmapItem(_props: {
  id: string;
  label: string;
  parent?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}) {
  return null;
}

(MindmapItem as any).displayName = "MindmapItem";

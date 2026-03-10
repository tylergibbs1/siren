"use client";

import { useEffect, useRef } from "react";
import { useReactFlow, useStore } from "@xyflow/react";
import { layoutGraph } from "@siren/core";
import type { LayoutDirection } from "@siren/core";

export interface AutoLayoutOptions {
  direction?: LayoutDirection;
  spacing?: {
    node?: number;
    layer?: number;
    edge?: number;
    edgeNode?: number;
  };
  /** Extra ELK layout options passed through to layoutGraph */
  layoutOptions?: Record<string, string | number>;
}

/** Stable JSON key for object deps so they don't re-trigger on every render */
function stableKey(obj: unknown): string {
  if (obj == null) return "";
  return JSON.stringify(obj, Object.keys(obj as Record<string, unknown>).sort());
}

/**
 * Runs ELK layout once nodes are measured by React Flow.
 *
 * Reads measured dimensions from React Flow's internal nodeLookup,
 * which is populated via onNodesChange in controlled mode.
 */
export function useAutoLayout(
  directionOrOpts: LayoutDirection | AutoLayoutOptions = "TB",
) {
  const opts =
    typeof directionOrOpts === "string"
      ? { direction: directionOrOpts }
      : directionOrOpts;
  const direction = opts.direction ?? "TB";
  const spacing = opts.spacing;
  const layoutOptions = opts.layoutOptions;

  // Stabilize object references so they don't re-trigger the effect
  const spacingKey = stableKey(spacing);
  const layoutOptsKey = stableKey(layoutOptions);
  const spacingRef = useRef(spacing);
  const layoutOptsRef = useRef(layoutOptions);
  if (stableKey(spacingRef.current) !== spacingKey) spacingRef.current = spacing;
  if (stableKey(layoutOptsRef.current) !== layoutOptsKey) layoutOptsRef.current = layoutOptions;

  const { setNodes, getNodes, getEdges, fitView } = useReactFlow();
  const layoutRunRef = useRef(0);
  const lastKeyRef = useRef("");

  // Build a measurement key — returns "" when nodes aren't ready yet
  const measurementKey = useStore((s) => {
    if (s.nodeLookup.size === 0) return "";
    const parts: string[] = [];
    for (const [id, node] of s.nodeLookup) {
      const w = node.measured?.width;
      const h = node.measured?.height;
      if (!w || !h) return "";
      parts.push(`${id}:${w}x${h}`);
    }
    return parts.join(",");
  });

  const edgeKey = useStore((s) =>
    s.edges
      .filter((e) => !e.data?.layoutIgnore)
      .map((e) => `${e.source}-${e.target}`)
      .join(","),
  );

  useEffect(() => {
    if (!measurementKey) return;

    const key = `${measurementKey}|${edgeKey}|${direction}`;
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    const run = ++layoutRunRef.current;
    const currentNodes = getNodes();
    const currentEdges = getEdges().filter((e) => !e.data?.layoutIgnore);

    const sirenNodes = currentNodes.map((node) => ({
      id: node.id,
      width: node.measured?.width ?? node.width ?? 100,
      height: node.measured?.height ?? node.height ?? 40,
      layoutOptions: node.data?.layoutOptions as
        | Record<string, string | number>
        | undefined,
    }));

    const sirenEdges = currentEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    }));

    layoutGraph({
      nodes: sirenNodes,
      edges: sirenEdges,
      direction,
      spacing: spacingRef.current,
      layoutOptions: layoutOptsRef.current,
    })
      .then((result) => {
        if (run !== layoutRunRef.current) return;
        const resultById = new Map(
          result.nodes.map((node) => [node.id, { x: node.x, y: node.y }]),
        );

        setNodes((prev) =>
          prev.map((node) => {
            const laid = resultById.get(node.id);
            if (!laid) return node;
            return { ...node, position: { x: laid.x, y: laid.y } };
          }),
        );

        fitView({ padding: 0.2, duration: 200 });
      })
      .catch((err) => {
        console.error("[siren] Layout failed:", err);
      });
  }, [
    measurementKey,
    edgeKey,
    direction,
    spacingKey,
    layoutOptsKey,
    getNodes,
    getEdges,
    setNodes,
    fitView,
  ]);
}

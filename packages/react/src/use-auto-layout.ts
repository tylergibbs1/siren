"use client";

import { useEffect, useRef } from "react";
import {
  useReactFlow,
  useNodesInitialized,
  useStore,
} from "@xyflow/react";
import { layoutGraph } from "@siren/core";
import type { LayoutDirection } from "@siren/core";

/**
 * Runs ELK layout once nodes are measured by React Flow.
 * Listens to the node/edge arrays from the store and re-layouts
 * when they change structurally (by id set).
 */
export function useAutoLayout(direction: LayoutDirection = "TB") {
  const { setNodes, fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const layoutRunRef = useRef(0);
  const lastKeyRef = useRef("");

  // Pull live nodes/edges from the store
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);

  useEffect(() => {
    if (!nodesInitialized || nodes.length === 0) return;

    // Build a key from node IDs + edge source/target to detect structural changes
    const key = [
      nodes.map((n) => n.id).join(","),
      edges.map((e) => `${e.source}-${e.target}`).join(","),
      direction,
    ].join("|");

    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    const run = ++layoutRunRef.current;

    const sirenNodes = nodes.map((n) => ({
      id: n.id,
      width: n.measured?.width ?? 180,
      height: n.measured?.height ?? 60,
      parentId: n.parentId,
      layoutOptions: n.data?.layoutOptions as Record<string, string | number> | undefined,
    }));

    const sirenEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    }));

    layoutGraph({
      nodes: sirenNodes,
      edges: sirenEdges,
      direction,
    }).then((result) => {
      if (run !== layoutRunRef.current) return;

      setNodes((prev) =>
        prev.map((node) => {
          const laid = result.nodes.find((n) => n.id === node.id);
          if (!laid) return node;
          return {
            ...node,
            position: { x: laid.x, y: laid.y },
          };
        })
      );

      requestAnimationFrame(() => {
        fitView({ padding: 0.2, duration: 200 });
      });
    });
  }, [nodesInitialized, nodes, edges, direction, setNodes, fitView]);
}

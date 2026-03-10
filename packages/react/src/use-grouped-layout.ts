"use client";

import { useEffect, useRef, useMemo } from "react";
import { useReactFlow, useStore } from "@xyflow/react";
import { layoutGraph } from "@siren/core";
import type { LayoutDirection } from "@siren/core";

/**
 * Runs ELK compound layout for diagrams with grouped/nested nodes.
 *
 * Groups are ELK parent nodes — ELK handles sizing and prevents overlap.
 * Results are converted to absolute positions for React Flow's flat rendering.
 */
export function useGroupedLayout(
  direction: LayoutDirection,
  groupMembership: Map<string, string>,
) {
  const { setNodes, getNodes, getEdges, fitView } = useReactFlow();
  const lastKeyRef = useRef("");
  const layoutRunRef = useRef(0);

  const groupIds = useMemo(
    () => new Set(groupMembership.values()),
    [groupMembership],
  );

  const measurementKey = useStore((s) => {
    if (s.nodeLookup.size === 0) return "";
    const parts: string[] = [];
    let allMeasured = true;
    for (const [id, node] of s.nodeLookup) {
      if (groupIds.has(id)) continue;
      const w = node.measured?.width;
      const h = node.measured?.height;
      if (!w || !h) {
        allMeasured = false;
        break;
      }
      parts.push(`${id}:${w}x${h}`);
    }
    return allMeasured ? parts.join(",") : "";
  });

  const edgeKey = useStore((s) =>
    s.edges.map((e) => `${e.source}-${e.target}`).join(","),
  );

  useEffect(() => {
    if (!measurementKey) return;

    const key = `${measurementKey}|${edgeKey}|${direction}`;
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    const run = ++layoutRunRef.current;
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    const sirenNodes = currentNodes.map((node) => ({
      id: node.id,
      width:
        node.measured?.width ??
        (node.style?.width as number) ??
        node.width ??
        100,
      height:
        node.measured?.height ??
        (node.style?.height as number) ??
        node.height ??
        40,
      parentId: groupMembership.get(node.id),
    }));

    const sirenEdges = currentEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    }));

    layoutGraph({ nodes: sirenNodes, edges: sirenEdges, direction })
      .then((result) => {
        if (run !== layoutRunRef.current) return;

        const posById = new Map(result.nodes.map((n) => [n.id, n]));

        setNodes((prev) =>
          prev.map((node) => {
            const laid = posById.get(node.id);
            if (!laid) return node;

            if (groupIds.has(node.id)) {
              return {
                ...node,
                position: { x: laid.x, y: laid.y },
                style: {
                  ...node.style,
                  width: laid.width,
                  height: laid.height,
                },
              };
            }

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
    getNodes,
    getEdges,
    setNodes,
    fitView,
    groupIds,
    groupMembership,
  ]);
}

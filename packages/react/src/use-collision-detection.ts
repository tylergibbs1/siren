"use client";

import React, { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import type { Node } from "@xyflow/react";

/**
 * Prevents nodes from overlapping when dragged interactively.
 *
 * Returns `onNodeDrag` and `onNodeDragStop` handlers that can be
 * spread directly onto `<ReactFlow>`.  Uses simple AABB overlap
 * detection — no spatial indexing needed for typical diagram sizes.
 */
export function useCollisionDetection(padding = 8) {
  const { getNodes, setNodes } = useReactFlow();

  const getNodeRect = (node: Node) => {
    const w = node.measured?.width ?? node.width ?? 100;
    const h = node.measured?.height ?? node.height ?? 40;
    return {
      x: node.position.x,
      y: node.position.y,
      width: w as number,
      height: h as number,
    };
  };

  const resolveCollisions = useCallback(
    (draggedNode: Node) => {
      const dragged = getNodeRect(draggedNode);
      const allNodes = getNodes();
      let hasCollision = false;

      const updated = allNodes.map((node) => {
        if (node.id === draggedNode.id) return node;

        const other = getNodeRect(node);

        const overlapX =
          dragged.x - padding < other.x + other.width &&
          dragged.x + dragged.width + padding > other.x;
        const overlapY =
          dragged.y - padding < other.y + other.height &&
          dragged.y + dragged.height + padding > other.y;

        if (!overlapX || !overlapY) return node;

        hasCollision = true;

        // Compute the center-to-center vector and push the other node away.
        const dcx = other.x + other.width / 2 - (dragged.x + dragged.width / 2);
        const dcy = other.y + other.height / 2 - (dragged.y + dragged.height / 2);

        // Determine the minimum translation to separate along each axis.
        const overlapAmountX =
          dcx >= 0
            ? dragged.x + dragged.width + padding - other.x
            : other.x + other.width + padding - dragged.x;

        const overlapAmountY =
          dcy >= 0
            ? dragged.y + dragged.height + padding - other.y
            : other.y + other.height + padding - dragged.y;

        let newX = node.position.x;
        let newY = node.position.y;

        // Push along the axis with the smallest overlap (shortest escape).
        if (overlapAmountX < overlapAmountY) {
          newX = dcx >= 0 ? node.position.x + overlapAmountX : node.position.x - overlapAmountX;
        } else {
          newY = dcy >= 0 ? node.position.y + overlapAmountY : node.position.y - overlapAmountY;
        }

        return { ...node, position: { x: newX, y: newY } };
      });

      if (hasCollision) {
        setNodes(updated);
      }
    },
    [getNodes, setNodes, padding],
  );

  const onNodeDrag = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      resolveCollisions(node);
    },
    [resolveCollisions],
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      resolveCollisions(node);
    },
    [resolveCollisions],
  );

  return { onNodeDrag, onNodeDragStop };
}

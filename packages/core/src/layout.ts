import ELK from "elkjs/lib/elk.bundled.js";
import type { SirenGraph, SirenNode, LayoutResult, LayoutDirection } from "./types";

// Singleton ELK instance with sensible defaults applied globally
const elk = new ELK({
  defaultLayoutOptions: {
    "elk.algorithm": "layered",
    "elk.edgeRouting": "ORTHOGONAL",
    "elk.layered.mergeEdges": "true",
    "elk.layered.cycleBreaking.strategy": "GREEDY",
    "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
    "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
  },
});

const directionMap: Record<LayoutDirection, string> = {
  TB: "DOWN",
  BT: "UP",
  LR: "RIGHT",
  RL: "LEFT",
};

/**
 * Recursively flatten ELK result children into a flat list of positioned nodes.
 */
function flattenChildren(
  children: Array<any>,
  offsetX = 0,
  offsetY = 0
): Array<{ id: string; x: number; y: number; width: number; height: number }> {
  const result: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }> = [];

  for (const child of children) {
    const x = (child.x ?? 0) + offsetX;
    const y = (child.y ?? 0) + offsetY;
    result.push({
      id: child.id,
      x,
      y,
      width: child.width ?? 0,
      height: child.height ?? 0,
    });

    if (child.children && child.children.length > 0) {
      result.push(...flattenChildren(child.children, x, y));
    }
  }

  return result;
}

/**
 * Recursively flatten ELK result edges from compound graphs.
 */
function flattenEdges(
  elkNode: any,
  offsetX = 0,
  offsetY = 0
): Array<{
  id: string;
  sections?: Array<{
    startPoint: { x: number; y: number };
    endPoint: { x: number; y: number };
    bendPoints?: Array<{ x: number; y: number }>;
  }>;
}> {
  const result: Array<any> = [];

  if (elkNode.edges) {
    for (const edge of elkNode.edges) {
      result.push({
        id: edge.id,
        sections: edge.sections?.map((s: any) => ({
          startPoint: {
            x: (s.startPoint?.x ?? 0) + offsetX,
            y: (s.startPoint?.y ?? 0) + offsetY,
          },
          endPoint: {
            x: (s.endPoint?.x ?? 0) + offsetX,
            y: (s.endPoint?.y ?? 0) + offsetY,
          },
          bendPoints: s.bendPoints?.map((bp: any) => ({
            x: (bp.x ?? 0) + offsetX,
            y: (bp.y ?? 0) + offsetY,
          })),
        })),
      });
    }
  }

  if (elkNode.children) {
    for (const child of elkNode.children) {
      const childX = (child.x ?? 0) + offsetX;
      const childY = (child.y ?? 0) + offsetY;
      result.push(...flattenEdges(child, childX, childY));
    }
  }

  return result;
}

export async function layoutGraph(graph: SirenGraph): Promise<LayoutResult> {
  // Build per-call layout options
  const layoutOptions: Record<string, string> = {
    "elk.direction": directionMap[graph.direction ?? "TB"],
    "elk.spacing.nodeNode": String(graph.spacing?.node ?? 40),
    "elk.layered.spacing.nodeNodeBetweenLayers": String(
      graph.spacing?.layer ?? 60
    ),
  };

  // Override algorithm if specified
  if (graph.algorithm) {
    layoutOptions["elk.algorithm"] = graph.algorithm;
    // mrtree doesn't support ORTHOGONAL edge routing
    if (graph.algorithm === "mrtree") {
      layoutOptions["elk.edgeRouting"] = "UNDEFINED";
    }
  }

  // Separate root-level nodes from child nodes (compound support)
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  const childrenByParent = new Map<string, typeof graph.nodes>();

  for (const node of graph.nodes) {
    if (node.parentId) {
      const siblings = childrenByParent.get(node.parentId) ?? [];
      siblings.push(node);
      childrenByParent.set(node.parentId, siblings);
    }
  }

  // Build ELK node recursively
  function buildElkNode(node: SirenNode): any {
    const children = childrenByParent.get(node.id);
    const elkNode: any = {
      id: node.id,
      width: node.width,
      height: node.height,
      layoutOptions: node.layoutOptions
        ? Object.fromEntries(
            Object.entries(node.layoutOptions).map(([k, v]) => [k, String(v)])
          )
        : undefined,
    };

    if (children && children.length > 0) {
      elkNode.children = children.map(buildElkNode);
      // Compound nodes need their own layout algorithm
      elkNode.layoutOptions = {
        ...elkNode.layoutOptions,
        "elk.algorithm": graph.algorithm ?? "layered",
        "elk.padding": "[top=30, left=10, bottom=10, right=10]",
      };
      if (graph.algorithm === "mrtree") {
        elkNode.layoutOptions["elk.edgeRouting"] = "UNDEFINED";
      }
    }

    return elkNode;
  }

  // Root nodes are those without a parentId
  const rootNodes = graph.nodes.filter((n) => !n.parentId);

  const elkGraph = {
    id: "root",
    layoutOptions,
    children: rootNodes.map(buildElkNode),
    edges: graph.edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const result = await elk.layout(elkGraph);

  return {
    nodes: flattenChildren(result.children ?? []),
    edges: flattenEdges(result),
  };
}

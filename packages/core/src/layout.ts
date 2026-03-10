import ELK from "elkjs/lib/elk.bundled.js";
import type { SirenGraph, SirenNode, LayoutResult, LayoutDirection } from "./types";

// ELK's bundled worker fallback can fail in some runtimes (e.g. Bun)
// where the CJS export of elk-worker.min.js doesn't resolve Worker correctly.
// We build a workerFactory from the elk-worker module ourselves so that ELK
// always has a valid synchronous worker regardless of runtime.
//
// The Node.js-only fallbacks use dynamic imports to avoid breaking browser/Next.js
// bundlers that cannot resolve `fs` or `module` at compile time.
function makeElk() {
  const defaultLayoutOptions: Record<string, string> = {
    "elk.algorithm": "layered",
    // POLYLINE routing is required for compound layouts (INCLUDE_CHILDREN)
    // because ORTHOGONAL crashes with cross-hierarchy edges in ELK.js
    "elk.edgeRouting": "POLYLINE",
    "elk.hierarchyHandling": "INCLUDE_CHILDREN",
    "elk.layered.mergeEdges": "true",
    "elk.layered.cycleBreaking.strategy": "GREEDY",
    "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
    "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
    "elk.layered.crossingMinimization.forceNodeModelOrder": "true",
  };

  // First attempt: let the bundled version handle worker creation (works in
  // Node.js and browser environments).
  try {
    return new ELK({ defaultLayoutOptions });
  } catch {
    // Server-only fallbacks — skip entirely in browser environments
    if (typeof window !== "undefined") {
      throw new Error(
        "Failed to initialise ELK layout engine in browser. " +
        "The bundled ELK worker could not be created."
      );
    }

    // Fallback 1: manually require the worker module and build a factory.
    try {
      // Dynamic require via createRequire to stay invisible to browser bundlers
      const { createRequire } = require("module") as typeof import("module");
      const _require = createRequire(import.meta.url);
      const workerModule = _require("elkjs/lib/elk-worker.min.js");
      const WorkerCtor = workerModule?.Worker ?? workerModule?.default?.Worker;
      if (typeof WorkerCtor === "function") {
        return new ELK({
          defaultLayoutOptions,
          workerFactory: () => new WorkerCtor(),
        } as any);
      }
    } catch {
      // ignore
    }

    // Fallback 2: Bun's CJS loader doesn't evaluate elk-worker.min.js correctly
    // (the Worker class variable `j` is undefined). Manually evaluate the source
    // via `new Function` so the IIFE runs in a clean scope.
    try {
      const { createRequire } = require("module") as typeof import("module");
      const { readFileSync } = require("fs") as typeof import("fs");
      const _require = createRequire(import.meta.url);
      const resolvedPath = _require.resolve("elkjs/lib/elk-worker.min.js");
      const src = readFileSync(resolvedPath, "utf8");
      const mod = { exports: {} as Record<string, any> };
      const evalFn = new Function("module", "exports", "require", "self", src);
      evalFn(mod, mod.exports, _require, undefined);
      const WorkerCtor = mod.exports.Worker ?? mod.exports.default;
      if (typeof WorkerCtor === "function") {
        return new ELK({
          defaultLayoutOptions,
          workerFactory: () => new WorkerCtor(),
        } as any);
      }
    } catch {
      // ignore
    }

    throw new Error(
      "Failed to initialise ELK layout engine. " +
      "Ensure 'elkjs' is installed and your runtime supports CommonJS require."
    );
  }
}

// Singleton ELK instance with POLYLINE routing (required for compound layouts)
const elk = makeElk();

const directionMap: Record<LayoutDirection, string> = {
  TB: "DOWN",
  BT: "UP",
  LR: "RIGHT",
  RL: "LEFT",
};

/**
 * Recursively flatten ELK result children into a flat list of positioned nodes.
 *
 * ELK returns child positions relative to their parent container.
 * We convert to absolute positions by accumulating parent offsets,
 * since React Flow nodes are rendered flat (no parentId hierarchy).
 */
function flattenChildren(
  children: Array<any>,
  offsetX = 0,
  offsetY = 0,
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
      // Accumulate this node's position as offset for its children
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
  const layoutOptions: Record<string, string> = {
    "elk.direction": directionMap[graph.direction ?? "TB"],
    "elk.spacing.nodeNode": String(graph.spacing?.node ?? 40),
    "elk.layered.spacing.nodeNodeBetweenLayers": String(
      graph.spacing?.layer ?? 60
    ),
    "elk.layered.spacing.edgeEdgeBetweenLayers": String(
      graph.spacing?.edge ?? 24
    ),
    "elk.layered.spacing.edgeNodeBetweenLayers": String(
      graph.spacing?.edgeNode ?? 36
    ),
  };

  // Merge caller-provided ELK overrides
  if (graph.layoutOptions) {
    for (const [k, v] of Object.entries(graph.layoutOptions)) {
      layoutOptions[k] = String(v);
    }
  }

  // Check if any nodes have parentId — if so, build hierarchical graph
  const hasGroups = graph.nodes.some((n) => n.parentId);

  // considerModelOrder crashes with compound layouts in ELK.js — only use for flat
  if (!hasGroups) {
    layoutOptions["elk.layered.considerModelOrder.strategy"] = "NODES_AND_EDGES";
  }

  if (graph.algorithm) {
    layoutOptions["elk.algorithm"] = graph.algorithm;
    if (graph.algorithm === "mrtree") {
      layoutOptions["elk.edgeRouting"] = "UNDEFINED";
    }
  }

  // Build ELK node from a SirenNode
  function toElkNode(node: SirenNode) {
    return {
      id: node.id,
      width: node.width,
      height: node.height,
      layoutOptions: node.layoutOptions
        ? Object.fromEntries(
            Object.entries(node.layoutOptions).map(([k, v]) => [k, String(v)])
          )
        : undefined,
    };
  }

  let rootChildren: any[];

  if (hasGroups) {
    // Collect group IDs (nodes referenced as parentId but may or may not be in the node list)
    const groupIds = new Set(
      graph.nodes.map((n) => n.parentId).filter(Boolean) as string[]
    );

    // Build a map: groupId -> child nodes
    const groupChildren = new Map<string, any[]>();
    const rootNodes: any[] = [];

    for (const node of graph.nodes) {
      if (groupIds.has(node.id)) {
        // This is a group node — will be added with its children
        if (!groupChildren.has(node.id)) {
          groupChildren.set(node.id, []);
        }
      } else if (node.parentId) {
        // Child of a group
        const children = groupChildren.get(node.parentId) ?? [];
        children.push(toElkNode(node));
        groupChildren.set(node.parentId, children);
      } else {
        // Root-level node, not in any group
        rootNodes.push(toElkNode(node));
      }
    }

    // Build group ELK nodes with their children
    for (const node of graph.nodes) {
      if (groupIds.has(node.id)) {
        rootNodes.push({
          id: node.id,
          // ELK will auto-size based on children + padding
          layoutOptions: {
            "elk.padding": "top=36,left=12,bottom=12,right=12",
            "elk.algorithm": "layered",
            ...(node.layoutOptions
              ? Object.fromEntries(
                  Object.entries(node.layoutOptions).map(([k, v]) => [k, String(v)])
                )
              : {}),
          },
          children: groupChildren.get(node.id) ?? [],
        });
      }
    }

    rootChildren = rootNodes;
  } else {
    // Flat layout — no groups
    rootChildren = graph.nodes.map(toElkNode);
  }

  const elkGraph = {
    id: "root",
    layoutOptions,
    children: rootChildren,
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

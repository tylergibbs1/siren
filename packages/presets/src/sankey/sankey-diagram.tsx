"use client";

import { useEffect, useRef, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";
import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";
import { SankeyNode } from "./sankey-node";
import { SankeyFlowEdge } from "./sankey-flow-edge";
import { TextLabelNode } from "../shared/text-label-node";
import { PRO_OPTIONS } from "../shared/edge-styles";

// Hoisted module-level
const nodeTypes = {
  sankey: SankeyNode,
  "text-label": TextLabelNode,
};

const edgeTypes = {
  "sankey-flow": SankeyFlowEdge,
};

interface SankeyNodeDef {
  id: string;
  label: string;
}

interface SankeyFlow {
  from: string;
  to: string;
  value: number;
}

interface SankeyDiagramProps {
  nodes: SankeyNodeDef[];
  flows: SankeyFlow[];
  theme?: SirenTheme;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Topological sort using Kahn's algorithm.
 * Returns node IDs grouped into columns (layers).
 */
function topoLayers(
  nodeIds: string[],
  flows: SankeyFlow[]
): string[][] {
  const inDegree: Record<string, number> = {};
  const adjacency: Record<string, string[]> = {};

  for (const id of nodeIds) {
    inDegree[id] = 0;
    adjacency[id] = [];
  }

  for (const f of flows) {
    inDegree[f.to] = (inDegree[f.to] ?? 0) + 1;
    adjacency[f.from] = adjacency[f.from] ?? [];
    adjacency[f.from].push(f.to);
  }

  const layers: string[][] = [];
  let queue = nodeIds.filter((id) => inDegree[id] === 0);

  while (queue.length > 0) {
    layers.push([...queue]);
    const next: string[] = [];

    for (const id of queue) {
      for (const neighbor of adjacency[id] ?? []) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          next.push(neighbor);
        }
      }
    }

    queue = next;
  }

  return layers;
}

function SankeyDiagramInner({
  nodes: nodeDefs,
  flows,
  className,
  style,
}: Omit<SankeyDiagramProps, "theme">) {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const prevKeyRef = useRef("");

  const { nodes, edges } = useMemo(() => {
    const COLUMN_SPACING = 300;
    const NODE_WIDTH = 24;
    const LABEL_WIDTH = 120;
    const PIXELS_PER_UNIT = 4;
    const NODE_GAP = 20;

    // Calculate total value flowing through each node
    const totalValue: Record<string, number> = {};
    for (const def of nodeDefs) {
      totalValue[def.id] = 0;
    }
    for (const f of flows) {
      totalValue[f.from] = (totalValue[f.from] ?? 0) + f.value;
      totalValue[f.to] = (totalValue[f.to] ?? 0) + f.value;
    }

    // Get max value for edge scaling
    const maxFlowValue = Math.max(...flows.map((f) => f.value), 1);

    // Topological layering
    const nodeIds = nodeDefs.map((n) => n.id);
    const layers = topoLayers(nodeIds, flows);
    const numLayers = layers.length;

    // Position nodes
    const nodePositions: Record<
      string,
      { x: number; y: number; height: number }
    > = {};

    const nodes: Node[] = [];

    for (let col = 0; col < layers.length; col++) {
      let currentY = 0;

      for (const nodeId of layers[col]) {
        const def = nodeDefs.find((n) => n.id === nodeId);
        if (!def) continue;

        const total = totalValue[nodeId] ?? 1;
        const height = Math.max(30, total * PIXELS_PER_UNIT);

        nodePositions[nodeId] = {
          x: col * COLUMN_SPACING + LABEL_WIDTH,
          y: currentY,
          height,
        };

        const x = col * COLUMN_SPACING + LABEL_WIDTH;
        nodes.push({
          id: nodeId,
          type: "sankey",
          position: { x, y: currentY },
          data: { label: "", totalValue: total },
          style: { width: `${NODE_WIDTH}px`, height: `${height}px` },
        });

        // Label node positioned beside the sankey bar
        const isFirstCol = col === 0;
        const isLastCol = col === numLayers - 1;
        const labelX = isLastCol
          ? x + NODE_WIDTH + 8
          : isFirstCol
            ? x - LABEL_WIDTH - 8
            : x + NODE_WIDTH + 8;

        nodes.push({
          id: `__label-${nodeId}`,
          type: "text-label",
          position: { x: labelX, y: currentY + height / 2 - 10 },
          data: {
            label: def.label,
            fontSize: "11px",
            fontWeight: 500,
            textAlign: isFirstCol ? "right" : "left",
          },
          style: { width: `${LABEL_WIDTH}px` },
          selectable: false,
          draggable: false,
        });

        currentY += height + NODE_GAP;
      }
    }

    // Create flow edges
    const edges: Edge[] = flows.map((f, i) => ({
      id: `flow-${i}-${f.from}-${f.to}`,
      source: f.from,
      target: f.to,
      type: "sankey-flow",
      data: { value: f.value, maxValue: maxFlowValue },
    }));

    return { nodes, edges };
  }, [nodeDefs, flows]);

  useEffect(() => {
    const key = nodes.map((n) => n.id).join(",") + "|" + edges.map((e) => e.id).join(",");
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;
    setRfNodes(nodes);
    setRfEdges(edges);
  }, [nodes, edges, setRfNodes, setRfEdges]);

  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        proOptions={PRO_OPTIONS}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="var(--siren-node-border, #e2e8f0)"
        />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export function SankeyDiagram({ theme, ...props }: SankeyDiagramProps) {
  const inner = (
    <ReactFlowProvider>
      <SankeyDiagramInner {...props} />
    </ReactFlowProvider>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

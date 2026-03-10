"use client";

import React, { Children, isValidElement, useEffect, useRef, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useNodesInitialized,
  type Node,
  type Edge,
} from "@xyflow/react";
import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";
import { layoutGraph } from "@siren/core";
import { MindmapNode } from "./mindmap-node";
import { MindmapItem } from "./mindmap-item";
import {
  EDGE_STYLE,
  PRO_OPTIONS,
} from "../shared/edge-styles";

// Hoisted module-level
const nodeTypes = {
  mindmap: MindmapNode,
};

interface MindmapTreeNode {
  id: string;
  label: string;
  children?: MindmapTreeNode[];
}

interface MindmapPropsWithRoot {
  root: MindmapTreeNode;
  children?: never;
  theme?: SirenTheme;
  className?: string;
  style?: React.CSSProperties;
}

interface MindmapPropsWithChildren {
  root?: never;
  children: React.ReactNode;
  theme?: SirenTheme;
  className?: string;
  style?: React.CSSProperties;
}

type MindmapProps = MindmapPropsWithRoot | MindmapPropsWithChildren;

/**
 * Flatten a recursive tree into flat nodes[] and edges[] arrays.
 */
function flattenTree(
  tree: MindmapTreeNode,
  depth: number,
  nodes: Node[],
  edges: Edge[]
) {
  nodes.push({
    id: tree.id,
    type: "mindmap",
    position: { x: 0, y: 0 },
    data: { label: tree.label, depth },
  });

  if (tree.children) {
    for (const child of tree.children) {
      edges.push({
        id: `${tree.id}-${child.id}`,
        source: tree.id,
        target: child.id,
        style: EDGE_STYLE,
      });
      flattenTree(child, depth + 1, nodes, edges);
    }
  }
}

/**
 * Collect MindmapItem children and build nodes/edges from the flat parent references.
 * Items without a parent are root nodes (depth 0).
 */
function collectItems(children: React.ReactNode): { nodes: Node[]; edges: Edge[] } {
  const items: Array<{
    id: string;
    label: string;
    parent?: string;
  }> = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    const type = child.type;
    const props = child.props as Record<string, any>;

    if (
      type === MindmapItem ||
      (type as any)?.displayName === "MindmapItem"
    ) {
      items.push({
        id: props.id,
        label: props.label,
        parent: props.parent,
      });
    }
  });

  // Build a depth map by traversing parent references
  const depthMap = new Map<string, number>();
  const parentMap = new Map<string, string>();

  for (const item of items) {
    if (item.parent) {
      parentMap.set(item.id, item.parent);
    }
  }

  function getDepth(id: string): number {
    if (depthMap.has(id)) return depthMap.get(id)!;
    const parent = parentMap.get(id);
    if (!parent) {
      depthMap.set(id, 0);
      return 0;
    }
    const d = getDepth(parent) + 1;
    depthMap.set(id, d);
    return d;
  }

  for (const item of items) {
    getDepth(item.id);
  }

  const nodes: Node[] = items.map((item) => ({
    id: item.id,
    type: "mindmap",
    position: { x: 0, y: 0 },
    data: { label: item.label, depth: depthMap.get(item.id) ?? 0 },
  }));

  const edges: Edge[] = items
    .filter((item) => item.parent)
    .map((item) => ({
      id: `${item.parent}-${item.id}`,
      source: item.parent!,
      target: item.id,
      style: EDGE_STYLE,
    }));

  return { nodes, edges };
}

function MindmapLayout({
  initialNodes,
  initialEdges,
}: {
  initialNodes: Node[];
  initialEdges: Edge[];
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const hasLaidOut = useRef(false);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  // Reset when inputs change
  useEffect(() => {
    setNodes(initialNodes);
    hasLaidOut.current = false;
  }, [initialNodes, setNodes]);

  // Run ELK mrtree layout once nodes are measured
  useEffect(() => {
    if (!nodesInitialized || hasLaidOut.current) return;
    const currentNodes = nodesRef.current;
    if (currentNodes.length === 0) return;

    const allMeasured = currentNodes.every((n) => n.measured?.width);
    if (!allMeasured) return;

    hasLaidOut.current = true;

    const sirenNodes = currentNodes.map((n) => ({
      id: n.id,
      width: n.measured?.width ?? 120,
      height: n.measured?.height ?? 40,
      layoutOptions: {
        "elk.algorithm": "mrtree",
      },
    }));

    const sirenEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    }));

    layoutGraph({
      nodes: sirenNodes,
      edges: sirenEdges,
      direction: "LR",
    }).then((result) => {
      setNodes((prev) =>
        prev.map((node) => {
          const laid = result.nodes.find((n) => n.id === node.id);
          if (!laid) return node;
          return { ...node, position: { x: laid.x, y: laid.y } };
        })
      );
      fitView({ padding: 0.2, duration: 200 });
    });
  }, [nodesInitialized, edges, setNodes, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
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
        color="var(--siren-node-border, hsl(0 0% 18%))"
      />
      <Controls />
    </ReactFlow>
  );
}

function MindmapInner({
  root,
  children,
  className,
  style,
}: Omit<MindmapProps, "theme">) {
  const { initialNodes, initialEdges } = useMemo(() => {
    // If a root tree is provided, use the tree API
    if (root) {
      const nodes: Node[] = [];
      const edges: Edge[] = [];
      flattenTree(root, 0, nodes, edges);
      return { initialNodes: nodes, initialEdges: edges };
    }

    // Otherwise, collect declarative MindmapItem children
    const { nodes, edges } = collectItems(children);
    return { initialNodes: nodes, initialEdges: edges };
  }, [root, children]);

  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
      <ReactFlowProvider
        key={initialNodes.map((n) => n.id).join(",")}
      >
        <MindmapLayout
          initialNodes={initialNodes}
          initialEdges={initialEdges}
        />
      </ReactFlowProvider>
    </div>
  );
}

export function Mindmap({ theme, ...props }: MindmapProps) {
  if (theme) {
    return (
      <SirenProvider theme={theme}>
        <MindmapInner {...props} />
      </SirenProvider>
    );
  }

  return <MindmapInner {...props} />;
}

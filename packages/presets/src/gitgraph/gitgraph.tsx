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
import { GitCommit } from "./git-commit";
import {
  EDGE_STYLE,
  PRO_OPTIONS,
} from "../shared/edge-styles";

// Hoisted module-level
const nodeTypes = {
  "git-commit": GitCommit,
};

const BRANCH_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#f97316", // orange
];

interface GitGraphCommit {
  id: string;
  message: string;
  branch: string;
  parent?: string;
  parents?: string[];
  merge?: boolean;
}

interface GitGraphProps {
  commits: GitGraphCommit[];
  theme?: SirenTheme;
  className?: string;
  style?: React.CSSProperties;
}

function GitGraphInner({
  commits,
  className,
  style,
}: Omit<GitGraphProps, "theme">) {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const prevKeyRef = useRef("");

  const { nodes, edges } = useMemo(() => {
    // Assign each unique branch a lane (Y position) and color
    const branches: string[] = [];
    for (const c of commits) {
      if (!branches.includes(c.branch)) {
        branches.push(c.branch);
      }
    }

    const branchLane: Record<string, number> = {};
    const branchColor: Record<string, string> = {};
    branches.forEach((b, i) => {
      branchLane[b] = i;
      branchColor[b] = BRANCH_COLORS[i % BRANCH_COLORS.length];
    });

    const X_SPACING = 80;
    const Y_SPACING = 60;

    const nodes: Node[] = commits.map((c, i) => ({
      id: c.id,
      type: "git-commit",
      position: {
        x: i * X_SPACING,
        y: branchLane[c.branch] * Y_SPACING,
      },
      data: {
        message: c.message,
        branch: c.branch,
        color: branchColor[c.branch],
        merge: c.merge,
      },
    }));

    // Build edges: connect sequential commits and merge parents
    const edges: Edge[] = [];
    const commitIndex = new Map<string, number>();
    commits.forEach((c, i) => commitIndex.set(c.id, i));

    for (const c of commits) {
      // Single parent
      if (c.parent) {
        edges.push({
          id: `${c.parent}-${c.id}`,
          source: c.parent,
          target: c.id,
          style: { stroke: branchColor[c.branch] },
          type: "smoothstep",
        });
      }

      // Multiple parents (merge)
      if (c.parents) {
        for (const parentId of c.parents) {
          const parentCommit = commits.find((pc) => pc.id === parentId);
          const color = parentCommit
            ? branchColor[parentCommit.branch]
            : branchColor[c.branch];

          edges.push({
            id: `${parentId}-${c.id}`,
            source: parentId,
            target: c.id,
            style: { stroke: color },
            type: "smoothstep",
          });
        }
      }
    }

    return { nodes, edges };
  }, [commits]);

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
    </div>
  );
}

export function GitGraph({ theme, ...props }: GitGraphProps) {
  const inner = (
    <ReactFlowProvider>
      <GitGraphInner {...props} />
    </ReactFlowProvider>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

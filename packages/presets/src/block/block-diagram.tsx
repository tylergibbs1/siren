"use client";

import React, { Children, isValidElement, useEffect, useRef, useMemo } from "react";
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
import type { LayoutDirection } from "@siren/core";
import { ClientOnly, useGroupedLayout } from "@siren/react";
import { BlockNode } from "./block-node";
import { BlockGroup } from "./block-group";
import { Connection } from "./connection";
import {
  EDGE_STYLE,
  EDGE_MARKER,
  EDGE_MARKER_START,
  EDGE_LABEL_STYLE,
  PRO_OPTIONS,
} from "../shared/edge-styles";
import { AnimatedEdge } from "../shared/animated-edge";
import { SelfLoopEdge } from "../shared/self-loop-edge";

interface BlockDiagramProps {
  direction?: LayoutDirection;
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  edgeType?: string;
  interactive?: boolean;
}

// Hoisted module-level — React Flow docs: "define edgeTypes outside of the component"
const edgeTypes = { animated: AnimatedEdge, selfLoop: SelfLoopEdge };

// Hoisted module-level
const nodeTypes = {
  block: BlockNode,
  "block-group": BlockGroup,
};

const DEFAULT_WRAPPER_STYLE = { width: "100%", height: "100%" };

/**
 * Recursively collect nodes and edges from children.
 * BlockGroup children are nested — tracked via groupMembership map.
 */
function collectChildren(
  children: React.ReactNode,
  nodes: Node[],
  edges: Edge[],
  groupMembership: Map<string, string>,
  currentGroupId?: string,
  diagramEdgeType?: string,
) {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    const type = child.type;
    const props = child.props as Record<string, any>;

    if (
      type === BlockGroup ||
      (type as any)?.displayName === "BlockGroup"
    ) {
      nodes.push({
        id: props.id,
        type: "block-group",
        position: { x: 0, y: 0 },
        data: { label: props.label },
        style: { width: 250, height: 150 },
        zIndex: -1,
      });

      if (currentGroupId) {
        groupMembership.set(props.id, currentGroupId);
      }

      if (props.children) {
        collectChildren(props.children, nodes, edges, groupMembership, props.id, diagramEdgeType);
      }
    } else if (
      type === BlockNode ||
      (type as any)?.displayName === "BlockNode"
    ) {
      nodes.push({
        id: props.id,
        type: "block",
        position: { x: 0, y: 0 },
        data: { label: props.label },
      });

      if (currentGroupId) {
        groupMembership.set(props.id, currentGroupId);
      }
    } else if (
      type === Connection ||
      (type as any)?.displayName === "Connection"
    ) {
      const isSelfLoop = props.from === props.to;
      const resolvedType = isSelfLoop
        ? "selfLoop"
        : props.edgeType ?? diagramEdgeType;

      const edge: Edge = {
        id: `${props.from}-${props.to}-${edges.length}`,
        source: props.from,
        target: props.to,
        label: props.label,
        animated: false,
        style: EDGE_STYLE,
        markerEnd: EDGE_MARKER,
        labelStyle: EDGE_LABEL_STYLE,
      };

      if (resolvedType && resolvedType !== "default") {
        edge.type = resolvedType;
      }

      if (props.bidirectional) {
        edge.markerStart = EDGE_MARKER_START;
      }

      edges.push(edge);
    }
  });
}

function BlockLayoutRunner({
  direction,
  groupMembership,
}: {
  direction: LayoutDirection;
  groupMembership: Map<string, string>;
}) {
  useGroupedLayout(direction, groupMembership);
  return null;
}

function BlockDiagramInner({
  direction = "TB",
  children,
  className,
  style,
  edgeType: diagramEdgeType,
  interactive,
}: Omit<BlockDiagramProps, "theme">) {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const prevKeyRef = useRef("");

  const { nodes, edges, groupMembership } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const groupMembership = new Map<string, string>();
    collectChildren(children, nodes, edges, groupMembership, undefined, diagramEdgeType);
    return { nodes, edges, groupMembership };
  }, [children, diagramEdgeType]);

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
      style={style ? { ...DEFAULT_WRAPPER_STYLE, ...style } : DEFAULT_WRAPPER_STYLE}
    >
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={PRO_OPTIONS}
        nodesDraggable={interactive ?? false}
        nodesConnectable={false}
        elementsSelectable={interactive ?? false}
        minZoom={0.3}
        maxZoom={2}
      >
        <BlockLayoutRunner direction={direction} groupMembership={groupMembership} />
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

export function BlockDiagram({ theme, ...props }: BlockDiagramProps) {
  const inner = (
    <ClientOnly>
      <ReactFlowProvider>
        <BlockDiagramInner {...props} />
      </ReactFlowProvider>
    </ClientOnly>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

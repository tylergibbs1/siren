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
import { useAutoLayout } from "@siren/react";
import { RequirementNode } from "./requirement-node";
import { Relationship } from "./relationship";
import {
  EDGE_STYLE,
  EDGE_MARKER,
  EDGE_MARKER_START,
  EDGE_LABEL_STYLE,
  PRO_OPTIONS,
} from "../shared/edge-styles";
import { AnimatedEdge } from "../shared/animated-edge";
import { SelfLoopEdge } from "../shared/self-loop-edge";

function LayoutRunner({ direction }: { direction: LayoutDirection }) {
  useAutoLayout(direction);
  return null;
}

interface RequirementDiagramProps {
  direction?: LayoutDirection;
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  edgeType?: string;
  interactive?: boolean;
}

// Hoisted module-level
const nodeTypes = {
  requirement: RequirementNode,
};

// Hoisted module-level — React Flow docs: "define edgeTypes outside of the component"
const edgeTypes = { animated: AnimatedEdge, selfLoop: SelfLoopEdge };

const DEFAULT_WRAPPER_STYLE = { width: "100%", height: "100%" };

function RequirementDiagramInner({
  direction = "TB",
  children,
  className,
  style,
  edgeType: diagramEdgeType,
  interactive,
}: Omit<RequirementDiagramProps, "theme">) {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const prevKeyRef = useRef("");

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;

      const type = child.type;
      const props = child.props as Record<string, any>;

      if (
        type === RequirementNode ||
        (type as any)?.displayName === "RequirementNode"
      ) {
        nodes.push({
          id: props.id,
          type: "requirement",
          position: { x: 0, y: 0 },
          data: {
            label: props.label,
            kind: props.kind,
            risk: props.risk,
            status: props.status,
            variant: props.variant,
          },
        });
      } else if (
        type === Relationship ||
        (type as any)?.displayName === "Relationship"
      ) {
        const isSelfLoop = props.from === props.to;
        const resolvedType = isSelfLoop
          ? "selfLoop"
          : props.edgeType ?? diagramEdgeType;

        const edge: Edge = {
          id: `${props.from}-${props.to}-${props.type}`,
          source: props.from,
          target: props.to,
          label: props.type,
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

    return { nodes, edges };
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
        <LayoutRunner direction={direction} />
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

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

export function RequirementDiagram({
  theme,
  ...props
}: RequirementDiagramProps) {
  const inner = (
    <ClientOnly>
      <ReactFlowProvider>
        <RequirementDiagramInner {...props} />
      </ReactFlowProvider>
    </ClientOnly>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

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
  MarkerType,
  type Node,
  type Edge,
} from "@xyflow/react";
import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";
import type { LayoutDirection } from "@siren/core";
import { useAutoLayout, ClientOnly } from "@siren/react";
import { EREntity } from "./er-entity";
import { ERRelationship } from "./er-relationship";
import type { ERCardinality } from "./er-relationship";
import {
  EDGE_STYLE,
  EDGE_MARKER_START,
  EDGE_LABEL_STYLE,
  EDGE_LABEL_BG_STYLE,
  PRO_OPTIONS,
} from "../shared/edge-styles";
import { AnimatedEdge } from "../shared/animated-edge";
import { SelfLoopEdge } from "../shared/self-loop-edge";

function LayoutRunner({ direction }: { direction: LayoutDirection }) {
  useAutoLayout(direction);
  return null;
}

interface ERDiagramProps {
  direction?: LayoutDirection;
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  edgeType?: string;
  interactive?: boolean;
}

const nodeTypes = {
  "er-entity": EREntity,
};

// Hoisted module-level — React Flow docs: "define edgeTypes outside of the component"
const edgeTypes = { animated: AnimatedEdge, selfLoop: SelfLoopEdge };

const DEFAULT_WRAPPER_STYLE = { width: "100%", height: "100%" };

const cardinalityLabels: Record<ERCardinality, string> = {
  "1:1": "1 \u2500\u2500 1",
  "1:N": "1 \u2500\u2500 *",
  "N:1": "* \u2500\u2500 1",
  "M:N": "* \u2500\u2500 *",
};

function ERDiagramInner({
  direction = "LR",
  children,
  className,
  style,
  edgeType: diagramEdgeType,
  interactive,
}: Omit<ERDiagramProps, "theme">) {
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
        type === EREntity ||
        (type as any)?.displayName === "EREntity"
      ) {
        nodes.push({
          id: props.id,
          type: "er-entity",
          position: { x: 0, y: 0 },
          data: {
            label: props.label,
            columns: props.columns ?? [],
          },
        });
      } else if (
        type === ERRelationship ||
        (type as any)?.displayName === "ERRelationship"
      ) {
        const cardinality: ERCardinality = props.cardinality ?? "1:N";
        const cardLabel = cardinalityLabels[cardinality];
        const label = props.label
          ? `${cardLabel}  ${props.label}`
          : cardLabel;

        const isSelfLoop = props.from === props.to;
        const resolvedType = isSelfLoop
          ? "selfLoop"
          : props.edgeType ?? diagramEdgeType;

        const edge: Edge = {
          id: `${props.from}-${props.to}-${edges.length}`,
          source: props.from,
          target: props.to,
          label,
          style: EDGE_STYLE,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "var(--siren-edge, hsl(0 0% 40%))",
          },
          labelStyle: EDGE_LABEL_STYLE,
          labelBgStyle: EDGE_LABEL_BG_STYLE,
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

export function ERDiagram({ theme, ...props }: ERDiagramProps) {
  const inner = (
    <ClientOnly>
      <ReactFlowProvider>
        <ERDiagramInner {...props} />
      </ReactFlowProvider>
    </ClientOnly>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

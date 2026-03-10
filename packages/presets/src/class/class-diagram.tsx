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
  MiniMap,
  MarkerType,
  type Node,
  type Edge,
} from "@xyflow/react";
import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";
import type { LayoutDirection } from "@siren/core";
import { useAutoLayout, ClientOnly } from "@siren/react";
import { ClassNode } from "./class-node";
import { ClassRelationship } from "./class-relationship";
import type { ClassRelationshipType } from "./class-relationship";
import {
  EDGE_STYLE,
  EDGE_DASHED_STYLE,
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

interface ClassDiagramProps {
  direction?: LayoutDirection;
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  edgeType?: string;
  mode?: "static" | "interactive";
  ariaLabel?: string;
}

const nodeTypes = {
  class: ClassNode,
};

// Hoisted module-level — React Flow docs: "define edgeTypes outside of the component"
const edgeTypes = { animated: AnimatedEdge, selfLoop: SelfLoopEdge };

const DEFAULT_WRAPPER_STYLE = { width: "100%", height: "100%" };

function getEdgeForRelationship(
  from: string,
  to: string,
  relType: ClassRelationshipType,
  label?: string,
  edgeType?: string,
  bidirectional?: boolean,
): Edge {
  const base = {
    id: `${from}-${to}-${relType}`,
    source: from,
    target: to,
    labelStyle: EDGE_LABEL_STYLE,
    labelBgStyle: EDGE_LABEL_BG_STYLE,
  };

  let edge: Edge;

  switch (relType) {
    case "inheritance":
      edge = {
        ...base,
        style: EDGE_STYLE,
        markerEnd: {
          type: MarkerType.Arrow,
          color: "var(--siren-edge, hsl(0 0% 40%))",
        },
        label: label,
      };
      break;
    case "composition":
      edge = {
        ...base,
        style: EDGE_STYLE,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--siren-edge, hsl(0 0% 40%))",
        },
        label: label ? `\u25C6 ${label}` : "\u25C6",
      };
      break;
    case "aggregation":
      edge = {
        ...base,
        style: EDGE_STYLE,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--siren-edge, hsl(0 0% 40%))",
        },
        label: label ? `\u25C7 ${label}` : "\u25C7",
      };
      break;
    case "association":
      edge = {
        ...base,
        style: EDGE_STYLE,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--siren-edge, hsl(0 0% 40%))",
        },
        label: label,
      };
      break;
    case "dependency":
      edge = {
        ...base,
        style: EDGE_DASHED_STYLE,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--siren-edge, hsl(0 0% 40%))",
        },
        label: label,
      };
      break;
    case "realization":
      edge = {
        ...base,
        style: EDGE_DASHED_STYLE,
        markerEnd: {
          type: MarkerType.Arrow,
          color: "var(--siren-edge, hsl(0 0% 40%))",
        },
        label: label,
      };
      break;
    default:
      edge = {
        ...base,
        style: EDGE_STYLE,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--siren-edge, hsl(0 0% 40%))",
        },
        label: label,
      };
  }

  const isSelfLoop = from === to;
  const resolvedType = isSelfLoop ? "selfLoop" : edgeType;
  if (resolvedType && resolvedType !== "default") {
    edge.type = resolvedType;
  }
  if (bidirectional) {
    edge.markerStart = EDGE_MARKER_START;
  }

  return edge;
}

function ClassDiagramInner({
  direction = "TB",
  children,
  className,
  style,
  edgeType: diagramEdgeType,
  mode,
  ariaLabel,
}: Omit<ClassDiagramProps, "theme">) {
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
        type === ClassNode ||
        (type as any)?.displayName === "ClassNode"
      ) {
        nodes.push({
          id: props.id,
          type: "class",
          position: { x: 0, y: 0 },
          data: {
            label: props.label,
            attributes: props.attributes ?? [],
            methods: props.methods ?? [],
          },
        });
      } else if (
        type === ClassRelationship ||
        (type as any)?.displayName === "ClassRelationship"
      ) {
        const relType: ClassRelationshipType = props.type ?? "association";
        edges.push(getEdgeForRelationship(props.from, props.to, relType, props.label, props.edgeType ?? diagramEdgeType, props.bidirectional));
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
        nodesDraggable={mode === "interactive"}
        nodesConnectable={false}
        elementsSelectable={mode === "interactive"}
        minZoom={0.3}
        maxZoom={2}
        role="img"
        aria-roledescription="class diagram"
        aria-label={ariaLabel ?? "Class diagram"}
      >
        <LayoutRunner direction={direction} />
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="var(--siren-node-border, hsl(0 0% 18%))"
        />
        <Controls />
        <MiniMap
          nodeStrokeWidth={2}
          nodeColor="var(--siren-node, hsl(0 0% 12.2%))"
          maskColor="rgba(0, 0, 0, 0.6)"
          style={{ background: "var(--siren-bg, hsl(0 0% 7.1%))", borderRadius: 8 }}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}

export function ClassDiagram({ theme, ...props }: ClassDiagramProps) {
  const inner = (
    <ClientOnly>
      <ReactFlowProvider>
        <ClassDiagramInner {...props} />
      </ReactFlowProvider>
    </ClientOnly>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

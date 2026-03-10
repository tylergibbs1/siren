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
import { useAutoLayout, ClientOnly } from "@siren/react";
import { StateNode } from "./state-node";
import { StateInitial } from "./state-initial";
import { StateFinal } from "./state-final";
import { Transition } from "./transition";
import {
  EDGE_STYLE,
  EDGE_DASHED_STYLE,
  EDGE_MARKER,
  EDGE_MARKER_START,
  EDGE_LABEL_STYLE,
  EDGE_LABEL_BG_STYLE,
  PRO_OPTIONS,
} from "../shared/edge-styles";
import { AnimatedEdge } from "../shared/animated-edge";
import { SelfLoopEdge } from "../shared/self-loop-edge";

function LayoutRunner({ direction }: { direction: LayoutDirection }) {
  useAutoLayout({ direction, spacing: { node: 60, layer: 80, edgeNode: 48 } });
  return null;
}

interface StateDiagramProps {
  direction?: LayoutDirection;
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  edgeType?: string;
  interactive?: boolean;
  ariaLabel?: string;
}

// Hoisted module-level — React Flow docs: "define nodeTypes outside of the component"
const nodeTypes = {
  state: StateNode,
  "state-initial": StateInitial,
  "state-final": StateFinal,
};

// Hoisted module-level — React Flow docs: "define edgeTypes outside of the component"
const edgeTypes = { animated: AnimatedEdge, selfLoop: SelfLoopEdge };

const DEFAULT_WRAPPER_STYLE = { width: "100%", height: "100%" };

function StateDiagramInner({
  direction = "TB",
  children,
  className,
  style,
  edgeType: diagramEdgeType,
  interactive,
  ariaLabel,
}: Omit<StateDiagramProps, "theme">) {
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
        type === StateNode ||
        (type as any)?.displayName === "StateNode"
      ) {
        nodes.push({
          id: props.id,
          type: "state",
          position: { x: 0, y: 0 },
          data: {
            label: props.label,
            variant: props.variant,
          },
        });
      } else if (
        type === StateInitial ||
        (type as any)?.displayName === "StateInitial"
      ) {
        nodes.push({
          id: props.id,
          type: "state-initial",
          position: { x: 0, y: 0 },
          data: { label: props.label },
        });
      } else if (
        type === StateFinal ||
        (type as any)?.displayName === "StateFinal"
      ) {
        nodes.push({
          id: props.id,
          type: "state-final",
          position: { x: 0, y: 0 },
          data: { label: props.label },
        });
      } else if (
        type === Transition ||
        (type as any)?.displayName === "Transition"
      ) {
        const guardLabel = props.guard
          ? props.label
            ? `[${props.guard}] ${props.label}`
            : `[${props.guard}]`
          : props.label;

        const isSelfLoop = props.from === props.to;
        const resolvedType = isSelfLoop
          ? "selfLoop"
          : props.edgeType ?? diagramEdgeType;

        const edge: Edge = {
          id: `${props.from}-${props.to}-${edges.length}`,
          source: props.from,
          target: props.to,
          label: guardLabel,
          animated: false,
          style: EDGE_STYLE,
          markerEnd: EDGE_MARKER,
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
        role="img"
        aria-roledescription="state diagram"
        aria-label={ariaLabel ?? "State diagram"}
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

export function StateDiagram({ theme, ...props }: StateDiagramProps) {
  const inner = (
    <ClientOnly>
      <ReactFlowProvider>
        <StateDiagramInner {...props} />
      </ReactFlowProvider>
    </ClientOnly>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

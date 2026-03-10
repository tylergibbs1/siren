"use client";

import React, {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
} from "react";
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
import { Step } from "./step";
import { Decision } from "./decision";
import { FlowEdge } from "./edge";
import { useAutoLayout, useCollisionDetection } from "@siren/react";
import {
  EDGE_STYLE,
  EDGE_DASHED_STYLE,
  EDGE_MARKER,
  EDGE_MARKER_START,
  EDGE_LABEL_STYLE,
  PRO_OPTIONS,
} from "../shared/edge-styles";
import { AnimatedEdge } from "../shared/animated-edge";
import { SelfLoopEdge } from "../shared/self-loop-edge";
import { EdgeWithButton } from "../shared/edge-with-button";
import { DataFlowEdge } from "../shared/data-flow-edge";

function LayoutRunner({ direction }: { direction: LayoutDirection }) {
  useAutoLayout(direction);
  return null;
}

interface FlowchartProps {
  direction?: LayoutDirection;
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  edgeType?: string;
  interactive?: boolean;
}

// Hoisted module-level — React Flow docs: "define nodeTypes outside of the component"
const nodeTypes = {
  step: Step,
  decision: Decision,
};

const edgeTypes = {
  animated: AnimatedEdge,
  selfLoop: SelfLoopEdge,
  edgeWithButton: EdgeWithButton,
  dataFlow: DataFlowEdge,
};

// Hoisted static wrapper style (rendering-hoist-jsx)
const DEFAULT_WRAPPER_STYLE = { width: "100%", height: "100%" };

function parseChildren(children: React.ReactNode, diagramEdgeType?: string) {
  const nodes: Node[] = [];
  const rawEdges: Array<Record<string, any>> = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    const type = child.type;
    const props = child.props as Record<string, any>;

    if (type === Step || (type as any)?.displayName === "Step") {
      nodes.push({
        id: props.id,
        type: "step",
        position: { x: 0, y: 0 },
        data: {
          label: props.label,
          variant: props.variant,
        },
      });
    } else if (type === Decision || (type as any)?.displayName === "Decision") {
      nodes.push({
        id: props.id,
        type: "decision",
        position: { x: 0, y: 0 },
        data: {
          label: props.label,
        },
      });
    } else if (
      type === FlowEdge ||
      (type as any)?.displayName === "FlowEdge"
    ) {
      rawEdges.push(props);
    }
  });

  const nodeOrder = new Map(nodes.map((node, index) => [node.id, index]));
  const edges: Edge[] = rawEdges.map((edge, index) => {
    const sourceIndex = nodeOrder.get(edge.from);
    const targetIndex = nodeOrder.get(edge.to);
    const isBackEdge =
      typeof sourceIndex === "number" &&
      typeof targetIndex === "number" &&
      sourceIndex >= targetIndex;

    const isSelfLoop = edge.from === edge.to;

    // Priority: selfLoop > dataFlow > animated > edgeType
    let type: string | undefined;
    let data: Record<string, any> | undefined = isBackEdge
      ? { layoutIgnore: true }
      : undefined;

    if (isSelfLoop) {
      type = "selfLoop";
      data = { layoutIgnore: true };
    } else if (edge.value != null) {
      type = "dataFlow";
      data = { ...(data ?? {}), value: edge.value };
    } else if (edge.animated) {
      type = "animated";
    } else {
      type = edge.edgeType ?? diagramEdgeType ?? undefined;
    }

    return {
      id: `${edge.from}-${edge.to}-${index}`,
      source: edge.from,
      target: edge.to,
      label: edge.label,
      type,
      style: edge.dashed ? EDGE_DASHED_STYLE : EDGE_STYLE,
      markerEnd: EDGE_MARKER,
      markerStart: edge.bidirectional ? EDGE_MARKER_START : undefined,
      labelStyle: EDGE_LABEL_STYLE,
      data,
    };
  });

  return { nodes, edges };
}

function FlowchartInner({
  direction = "TB",
  children,
  className,
  style,
  edgeType: diagramEdgeType,
  interactive,
}: Omit<FlowchartProps, "theme">) {
  // Parse children once for initial state
  const initial = useMemo(
    () => parseChildren(children, diagramEdgeType),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>(initial.nodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>(initial.edges);
  const prevKeyRef = useRef(
    initial.nodes.map((n) => n.id).join(",") + "|" + initial.edges.map((e) => e.id).join(",")
  );

  // Re-parse when children change (after initial render)
  const { nodes, edges } = useMemo(
    () => parseChildren(children, diagramEdgeType),
    [children, diagramEdgeType]
  );

  useEffect(() => {
    const key = nodes.map((n) => n.id).join(",") + "|" + edges.map((e) => e.id).join(",");
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;
    setRfNodes(nodes);
    setRfEdges(edges);
  }, [nodes, edges, setRfNodes, setRfEdges]);

  const { onNodeDrag, onNodeDragStop } = useCollisionDetection();

  const wrapperStyle = style
    ? { ...DEFAULT_WRAPPER_STYLE, ...style }
    : DEFAULT_WRAPPER_STYLE;

  return (
    <div className={className} style={wrapperStyle}>
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
        {...(interactive ? { onNodeDrag, onNodeDragStop } : {})}
      >
        <LayoutRunner direction={direction} />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="var(--siren-node-border, hsl(0 0% 18%))" />
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

export function Flowchart({ theme, ...props }: FlowchartProps) {
  const inner = (
    <ClientOnly>
      <ReactFlowProvider>
        <FlowchartInner {...props} />
      </ReactFlowProvider>
    </ClientOnly>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

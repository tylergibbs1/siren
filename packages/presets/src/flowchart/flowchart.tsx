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
  MiniMap,
  type Node,
  type Edge,
} from "@xyflow/react";
import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";
import type { LayoutDirection } from "@siren/core";
import { Step } from "./step";
import { Decision } from "./decision";
import { FlowEdge } from "./edge";
import {
  Stadium,
  Cylinder,
  Hexagon,
  Cloud,
  Document,
  Note,
  Subroutine,
  Trapezoid,
} from "./shapes";
import { useAutoLayout, useCollisionDetection, ClientOnly } from "@siren/react";
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
  mode?: "static" | "interactive";
  ariaLabel?: string;
}

// Hoisted module-level — React Flow docs: "define nodeTypes outside of the component"
const nodeTypes = {
  step: Step,
  decision: Decision,
  stadium: Stadium,
  cylinder: Cylinder,
  hexagon: Hexagon,
  cloud: Cloud,
  document: Document,
  note: Note,
  subroutine: Subroutine,
  trapezoid: Trapezoid,
};

const edgeTypes = {
  animated: AnimatedEdge,
  selfLoop: SelfLoopEdge,
  edgeWithButton: EdgeWithButton,
  dataFlow: DataFlowEdge,
};

// Hoisted static wrapper style (rendering-hoist-jsx)
const DEFAULT_WRAPPER_STYLE = { width: "100%", height: "100%" };

// Hoisted position object — avoids creating { x: 0, y: 0 } per node (rendering-hoist-jsx)
const ZERO_POSITION = { x: 0, y: 0 };

// O(1) component → node type lookup maps (js-set-map-lookups)
const SHAPE_ENTRIES: Array<[any, string]> = [
  [Step, "step"],
  [Decision, "decision"],
  [Stadium, "stadium"],
  [Cylinder, "cylinder"],
  [Hexagon, "hexagon"],
  [Cloud, "cloud"],
  [Document, "document"],
  [Note, "note"],
  [Subroutine, "subroutine"],
  [Trapezoid, "trapezoid"],
];
const SHAPE_COMPONENT_MAP = new Map<any, string>(SHAPE_ENTRIES);
const SHAPE_DISPLAY_NAME_MAP = new Map<string, string>(
  SHAPE_ENTRIES.map(([comp, type]) => [(comp as any).displayName ?? "", type])
);

function parseChildren(children: React.ReactNode, diagramEdgeType?: string, direction?: string) {
  const nodes: Node[] = [];
  const rawEdges: Array<Record<string, any>> = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    const type = child.type;
    const props = child.props as Record<string, any>;

    const matchedType = SHAPE_COMPONENT_MAP.get(type)
      ?? ((type as any)?.displayName ? SHAPE_DISPLAY_NAME_MAP.get((type as any).displayName) : undefined);

    if (matchedType) {
      nodes.push({
        id: props.id,
        type: matchedType,
        position: ZERO_POSITION,
        data: {
          label: props.label,
          variant: props.variant,
          direction,
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
      labelBgStyle: EDGE_LABEL_BG_STYLE,
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
  mode,
  ariaLabel,
}: Omit<FlowchartProps, "theme">) {
  // Parse children once for initial state
  const initial = useMemo(
    () => parseChildren(children, diagramEdgeType, direction),
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
    () => parseChildren(children, diagramEdgeType, direction),
    [children, diagramEdgeType, direction]
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
        nodesDraggable={mode === "interactive"}
        nodesConnectable={false}
        elementsSelectable={mode === "interactive"}
        minZoom={0.3}
        maxZoom={2}
        role="img"
        aria-roledescription="flowchart"
        aria-label={ariaLabel ?? "Flowchart"}
        {...(mode === "interactive" ? { onNodeDrag, onNodeDragStop } : {})}
      >
        <LayoutRunner direction={direction} />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="var(--siren-node-border, hsl(0 0% 18%))" />
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

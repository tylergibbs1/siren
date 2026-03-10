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
  type Node,
  type Edge,
} from "@xyflow/react";
import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";
import type { LayoutDirection } from "@siren/core";
import { ClientOnly, useGroupedLayout } from "@siren/react";
import { ArchService } from "./arch-service";
import { ArchGroup } from "./arch-group";
import { ArchConnection } from "./arch-connection";
import {
  EDGE_STYLE,
  EDGE_MARKER,
  EDGE_MARKER_START,
  EDGE_LABEL_STYLE,
  EDGE_LABEL_BG_STYLE,
  PRO_OPTIONS,
} from "../shared/edge-styles";
import { AnimatedEdge } from "../shared/animated-edge";
import { SelfLoopEdge } from "../shared/self-loop-edge";

const directionToElk: Record<string, string> = {
  TB: "DOWN",
  BT: "UP",
  LR: "RIGHT",
  RL: "LEFT",
};

interface ArchitectureDiagramProps {
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
  "arch-service": ArchService,
  "arch-group": ArchGroup,
};

// Hoisted module-level — React Flow docs: "define edgeTypes outside of the component"
const edgeTypes = { animated: AnimatedEdge, selfLoop: SelfLoopEdge };

const DEFAULT_WRAPPER_STYLE = { width: "100%", height: "100%" };

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

    if (type === ArchGroup || (type as any)?.displayName === "ArchGroup") {
      const groupLayoutOptions = props.direction
        ? { "elk.direction": directionToElk[props.direction] }
        : undefined;
      nodes.push({
        id: props.id,
        type: "arch-group",
        position: { x: 0, y: 0 },
        data: { label: props.label, icon: props.icon, layoutOptions: groupLayoutOptions },
        style: { width: 260, height: 160 },
        zIndex: -1,
      });
      if (props.children) {
        collectChildren(props.children, nodes, edges, groupMembership, props.id, diagramEdgeType);
      }
    } else if (type === ArchService || (type as any)?.displayName === "ArchService") {
      nodes.push({
        id: props.id,
        type: "arch-service",
        position: { x: 0, y: 0 },
        data: { label: props.label, icon: props.icon },
      });
      if (currentGroupId) {
        groupMembership.set(props.id, currentGroupId);
      }
    } else if (type === ArchConnection || (type as any)?.displayName === "ArchConnection") {
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
}

function ArchLayoutRunner({
  direction,
  groupMembership,
}: {
  direction: LayoutDirection;
  groupMembership: Map<string, string>;
}) {
  useGroupedLayout(direction, groupMembership);
  return null;
}

function ArchitectureDiagramInner({
  direction = "TB",
  children,
  className,
  style,
  edgeType: diagramEdgeType,
  mode,
  ariaLabel,
}: Omit<ArchitectureDiagramProps, "theme">) {
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
        nodesDraggable={mode === "interactive"}
        nodesConnectable={false}
        elementsSelectable={mode === "interactive"}
        minZoom={0.3}
        maxZoom={2}
        role="img"
        aria-roledescription="architecture diagram"
        aria-label={ariaLabel ?? "Architecture diagram"}
      >
        <ArchLayoutRunner direction={direction} groupMembership={groupMembership} />
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

export function ArchitectureDiagram({
  theme,
  ...props
}: ArchitectureDiagramProps) {
  const inner = (
    <ClientOnly>
      <ReactFlowProvider>
        <ArchitectureDiagramInner {...props} />
      </ReactFlowProvider>
    </ClientOnly>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

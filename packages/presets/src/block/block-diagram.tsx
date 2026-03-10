"use client";

import React, { Children, isValidElement, useEffect, useRef, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useStore,
  Background,
  BackgroundVariant,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";
import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";
import type { LayoutDirection } from "@siren/core";
import { layoutGraph } from "@siren/core";
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

/**
 * Layout hook using ELK compound layout.
 * Groups are ELK parent nodes so ELK handles spacing and prevents overlap.
 */
function useBlockLayout(
  direction: LayoutDirection,
  groupMembership: Map<string, string>
) {
  const { setNodes, getNodes, getEdges, fitView } = useReactFlow();
  const lastKeyRef = useRef("");
  const layoutRunRef = useRef(0);

  const groupIds = useMemo(
    () => new Set(groupMembership.values()),
    [groupMembership]
  );

  const measurementKey = useStore((s) => {
    if (s.nodeLookup.size === 0) return "";
    const parts: string[] = [];
    let allMeasured = true;
    for (const [id, node] of s.nodeLookup) {
      if (groupIds.has(id)) continue;
      const w = node.measured?.width;
      const h = node.measured?.height;
      if (!w || !h) { allMeasured = false; break; }
      parts.push(`${id}:${w}x${h}`);
    }
    return allMeasured ? parts.join(",") : "";
  });

  const edgeKey = useStore((s) =>
    s.edges.map((e) => `${e.source}-${e.target}`).join(",")
  );

  useEffect(() => {
    if (!measurementKey) return;

    const key = `${measurementKey}|${edgeKey}|${direction}`;
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    const run = ++layoutRunRef.current;
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    const sirenNodes = currentNodes.map((node) => ({
      id: node.id,
      width: node.measured?.width ?? (node.style?.width as number) ?? node.width ?? 100,
      height: node.measured?.height ?? (node.style?.height as number) ?? node.height ?? 40,
      parentId: groupMembership.get(node.id),
    }));

    const sirenEdges = currentEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    }));

    layoutGraph({ nodes: sirenNodes, edges: sirenEdges, direction })
      .then((result) => {
        if (run !== layoutRunRef.current) return;

        const posById = new Map(result.nodes.map((n) => [n.id, n]));

        setNodes((prev) =>
          prev.map((node) => {
            const laid = posById.get(node.id);
            if (!laid) return node;

            if (groupIds.has(node.id)) {
              return {
                ...node,
                position: { x: laid.x, y: laid.y },
                style: {
                  ...node.style,
                  width: laid.width,
                  height: laid.height,
                },
              };
            }

            return { ...node, position: { x: laid.x, y: laid.y } };
          })
        );

        fitView({ padding: 0.2, duration: 200 });
      })
      .catch((err) => {
        console.error("[siren] Layout failed:", err);
      });
  }, [measurementKey, edgeKey, direction, getNodes, getEdges, setNodes, fitView, groupIds, groupMembership]);
}

function BlockLayoutRunner({
  direction,
  groupMembership,
}: {
  direction: LayoutDirection;
  groupMembership: Map<string, string>;
}) {
  useBlockLayout(direction, groupMembership);
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

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
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

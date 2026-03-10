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
import { Actor } from "./actor";
import { Message } from "./message";
import {
  EDGE_STYLE,
  EDGE_DASHED_STYLE,
  EDGE_MARKER,
  EDGE_LABEL_STYLE,
  EDGE_LABEL_BG_STYLE,
  PRO_OPTIONS,
} from "../shared/edge-styles";

interface SequenceProps {
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

const nodeTypes = {
  actor: Actor,
};

// Hoisted static style (rendering-hoist-jsx)
const DEFAULT_WRAPPER_STYLE = { width: "100%", height: "100%" };

// Reply edge uses a dashed variant with same stroke
const REPLY_EDGE_STYLE = { strokeDasharray: "6 4", ...EDGE_STYLE };

/**
 * Sequence diagrams use a custom layout (not ELK):
 * - Actors are placed horizontally with equal spacing
 * - Messages are rendered as edges between actors at increasing Y positions
 */
function SequenceInner({
  children,
  className,
  style,
  ariaLabel,
}: Omit<SequenceProps, "theme">) {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const prevKeyRef = useRef("");

  const wrapperStyle = style
    ? { ...DEFAULT_WRAPPER_STYLE, ...style }
    : DEFAULT_WRAPPER_STYLE;

  const { nodes, edges } = useMemo(() => {
    const actors: Array<{ id: string; label: string }> = [];
    const messages: Array<{
      from: string;
      to: string;
      label?: string;
      reply?: boolean;
    }> = [];

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;

      const type = child.type;
      const props = child.props as Record<string, any>;

      if (type === Actor || (type as any)?.displayName === "Actor") {
        actors.push({ id: props.id, label: props.label });
      } else if (
        type === Message ||
        (type as any)?.displayName === "Message"
      ) {
        messages.push({
          from: props.from,
          to: props.to,
          label: props.label,
          reply: props.reply,
        });
      }
    });

    const spacing = 200;
    const nodes: Node[] = actors.map((actor, i) => ({
      id: actor.id,
      type: "actor",
      position: { x: i * spacing, y: 0 },
      data: { label: actor.label },
    }));

    const edges: Edge[] = messages.map((msg, i) => ({
      id: `msg-${i}`,
      source: msg.from,
      target: msg.to,
      label: msg.label,
      type: "straight",
      style: msg.reply ? REPLY_EDGE_STYLE : EDGE_STYLE,
      markerEnd: EDGE_MARKER,
      labelStyle: EDGE_LABEL_STYLE,
      labelBgStyle: EDGE_LABEL_BG_STYLE,
    }));

    return { nodes, edges };
  }, [children]);

  useEffect(() => {
    const key = nodes.map((n) => n.id).join(",") + "|" + edges.map((e) => e.id).join(",");
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;
    setRfNodes(nodes);
    setRfEdges(edges);
  }, [nodes, edges, setRfNodes, setRfEdges]);

  return (
    <div className={className} style={wrapperStyle}>
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
        role="img"
        aria-roledescription="sequence diagram"
        aria-label={ariaLabel ?? "Sequence diagram"}
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

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

export function Sequence({ theme, ...props }: SequenceProps) {
  const inner = (
    <ClientOnly>
      <ReactFlowProvider>
        <SequenceInner {...props} />
      </ReactFlowProvider>
    </ClientOnly>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

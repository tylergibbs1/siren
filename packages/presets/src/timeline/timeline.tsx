"use client";

import React, { Children, isValidElement, useEffect, useRef, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
} from "@xyflow/react";
import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";
import { TimelineEvent } from "./timeline-event";
import { EDGE_STYLE, PRO_OPTIONS } from "../shared/edge-styles";

interface TimelineProps {
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

const nodeTypes = {
  "timeline-event": TimelineEvent,
};

function TimelineInner({
  children,
  className,
  style,
  ariaLabel,
}: Omit<TimelineProps, "theme">) {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const prevKeyRef = useRef("");

  const { nodes, edges } = useMemo(() => {
    const events: Array<{
      id: string;
      date: string;
      label: string;
      description?: string;
      variant?: string;
    }> = [];

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;

      const type = child.type;
      const props = child.props as Record<string, any>;

      if (
        type === TimelineEvent ||
        (type as any)?.displayName === "TimelineEvent"
      ) {
        events.push({
          id: props.id,
          date: props.date,
          label: props.label,
          description: props.description,
          variant: props.variant,
        });
      }
    });

    const spacing = 250;
    const centerY = 200;
    const offsetY = 120;

    const nodes: Node[] = events.map((event, i) => ({
      id: event.id,
      type: "timeline-event",
      position: {
        x: i * spacing,
        y: i % 2 === 0 ? centerY - offsetY - 60 : centerY + offsetY,
      },
      data: {
        date: event.date,
        label: event.label,
        description: event.description,
        variant: event.variant,
      },
    }));

    const edges: Edge[] = [];

    // Connect consecutive events through the center line
    for (let i = 0; i < events.length - 1; i++) {
      edges.push({
        id: `timeline-${events[i].id}-${events[i + 1].id}`,
        source: events[i].id,
        target: events[i + 1].id,
        type: "straight",
        style: EDGE_STYLE,
      });
    }

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
    <div
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
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
        aria-roledescription="timeline"
        aria-label={ariaLabel ?? "Timeline"}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="var(--siren-node-border, hsl(0 0% 18%))"
        />
      </ReactFlow>
    </div>
  );
}

export function Timeline({ theme, ...props }: TimelineProps) {
  const inner = (
    <ReactFlowProvider>
      <TimelineInner {...props} />
    </ReactFlowProvider>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

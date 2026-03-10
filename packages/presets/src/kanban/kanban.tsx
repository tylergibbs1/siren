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
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { PRO_OPTIONS } from "../shared/edge-styles";

interface KanbanProps {
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

const nodeTypes = {
  "kanban-column": KanbanColumn,
  "kanban-card": KanbanCard,
};

function KanbanInner({
  children,
  className,
  style,
  ariaLabel,
}: Omit<KanbanProps, "theme">) {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>([]);
  const [rfEdges, , onEdgesChange] = useEdgesState<Edge>([]);
  const prevKeyRef = useRef("");

  const { nodes } = useMemo(() => {
    const columns: Array<{
      id: string;
      label: string;
      cards: Array<{ id: string; label: string; tag?: string }>;
    }> = [];

    let currentColumn: (typeof columns)[number] | null = null;

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;

      const type = child.type;
      const props = child.props as Record<string, any>;

      if (
        type === KanbanColumn ||
        (type as any)?.displayName === "KanbanColumn"
      ) {
        currentColumn = {
          id: props.id,
          label: props.label,
          cards: [],
        };
        columns.push(currentColumn);
      } else if (
        (type === KanbanCard ||
          (type as any)?.displayName === "KanbanCard") &&
        currentColumn
      ) {
        currentColumn.cards.push({
          id: props.id,
          label: props.label,
          tag: props.tag,
        });
      }
    });

    const colWidth = 280;
    const colGap = 20;
    const cardHeight = 60;
    const cardGap = 8;
    const headerHeight = 50;
    const colPadding = 10;

    const nodes: Node[] = [];

    columns.forEach((col, colIdx) => {
      const cardCount = col.cards.length;
      const colHeight =
        headerHeight +
        colPadding +
        cardCount * (cardHeight + cardGap) +
        colPadding;

      const colX = colIdx * (colWidth + colGap);

      // Column group node — flat layout with zIndex: -1
      nodes.push({
        id: col.id,
        type: "kanban-column",
        position: { x: colX, y: 0 },
        data: {
          label: col.label,
          count: cardCount,
        },
        style: {
          width: colWidth,
          height: Math.max(colHeight, 200),
        },
        zIndex: -1,
      });

      // Card nodes — absolute positions (no parentId)
      col.cards.forEach((card, cardIdx) => {
        nodes.push({
          id: card.id,
          type: "kanban-card",
          position: {
            x: colX + colPadding,
            y: headerHeight + colPadding + cardIdx * (cardHeight + cardGap),
          },
          data: {
            label: card.label,
            tag: card.tag,
          },
          style: {
            width: colWidth - colPadding * 2,
          },
        });
      });
    });

    const edges: Edge[] = [];
    return { nodes, edges };
  }, [children]);

  useEffect(() => {
    const key = nodes.map((n) => n.id).join(",");
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;
    setRfNodes(nodes);
  }, [nodes, setRfNodes]);

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
        aria-roledescription="kanban board"
        aria-label={ariaLabel ?? "Kanban board"}
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

export function Kanban({ theme, ...props }: KanbanProps) {
  const inner = (
    <ReactFlowProvider>
      <KanbanInner {...props} />
    </ReactFlowProvider>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

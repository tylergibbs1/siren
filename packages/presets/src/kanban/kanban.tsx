"use client";

import React, { Children, isValidElement, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
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
}

const nodeTypes = {
  "kanban-column": KanbanColumn,
  "kanban-card": KanbanCard,
};

function KanbanInner({
  children,
  className,
  style,
}: Omit<KanbanProps, "theme">) {
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

      // Column group node
      nodes.push({
        id: col.id,
        type: "kanban-column",
        position: { x: colIdx * (colWidth + colGap), y: 0 },
        data: {
          label: col.label,
          count: cardCount,
        },
        style: {
          width: colWidth,
          height: Math.max(colHeight, 200),
        },
      });

      // Card nodes inside column
      col.cards.forEach((card, cardIdx) => {
        nodes.push({
          id: card.id,
          type: "kanban-card",
          position: {
            x: colPadding,
            y: headerHeight + colPadding + cardIdx * (cardHeight + cardGap),
          },
          parentId: col.id,
          extent: "parent" as const,
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

  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        fitView
        proOptions={PRO_OPTIONS}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        onlyRenderVisibleElements
        minZoom={0.3}
        maxZoom={2}
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

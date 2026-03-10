"use client";

import React, { Children, isValidElement, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  type Node,
  type Edge,
} from "@xyflow/react";
import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";
import type { LayoutDirection } from "@siren/core";
import { useAutoLayout } from "@siren/react";
import { EREntity } from "./er-entity";
import { ERRelationship } from "./er-relationship";
import type { ERCardinality } from "./er-relationship";
import {
  EDGE_STYLE,
  EDGE_LABEL_STYLE,
  PRO_OPTIONS,
} from "../shared/edge-styles";

function LayoutRunner({ direction }: { direction: LayoutDirection }) {
  useAutoLayout(direction);
  return null;
}

interface ERDiagramProps {
  direction?: LayoutDirection;
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const nodeTypes = {
  "er-entity": EREntity,
};

const cardinalityLabels: Record<ERCardinality, string> = {
  "1:1": "1 \u2500\u2500 1",
  "1:N": "1 \u2500\u2500 *",
  "N:1": "* \u2500\u2500 1",
  "M:N": "* \u2500\u2500 *",
};

function ERDiagramInner({
  direction = "LR",
  children,
  className,
  style,
}: Omit<ERDiagramProps, "theme">) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;

      const type = child.type;
      const props = child.props as Record<string, any>;

      if (
        type === EREntity ||
        (type as any)?.displayName === "EREntity"
      ) {
        nodes.push({
          id: props.id,
          type: "er-entity",
          position: { x: 0, y: 0 },
          data: {
            label: props.label,
            columns: props.columns ?? [],
          },
        });
      } else if (
        type === ERRelationship ||
        (type as any)?.name === "ERRelationship" ||
        props.from
      ) {
        const cardinality: ERCardinality = props.cardinality ?? "1:N";
        const cardLabel = cardinalityLabels[cardinality];
        const label = props.label
          ? `${cardLabel}  ${props.label}`
          : cardLabel;

        edges.push({
          id: `${props.from}-${props.to}`,
          source: props.from,
          target: props.to,
          label,
          style: EDGE_STYLE,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "var(--siren-edge, hsl(0 0% 40%))",
          },
          labelStyle: EDGE_LABEL_STYLE,
          labelBgStyle: {
            fill: "var(--siren-bg, hsl(0 0% 12.2%))",
          },
        });
      }
    });

    return { nodes, edges };
  }, [children]);

  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
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

export function ERDiagram({ theme, ...props }: ERDiagramProps) {
  const inner = (
    <ReactFlowProvider>
      <ERDiagramInner {...props} />
    </ReactFlowProvider>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

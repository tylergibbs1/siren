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
import { ClassNode } from "./class-node";
import { ClassRelationship } from "./class-relationship";
import type { ClassRelationshipType } from "./class-relationship";
import {
  EDGE_STYLE,
  EDGE_DASHED_STYLE,
  EDGE_LABEL_STYLE,
  PRO_OPTIONS,
} from "../shared/edge-styles";

function LayoutRunner({ direction }: { direction: LayoutDirection }) {
  useAutoLayout(direction);
  return null;
}

interface ClassDiagramProps {
  direction?: LayoutDirection;
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const nodeTypes = {
  class: ClassNode,
};

function getEdgeForRelationship(
  from: string,
  to: string,
  relType: ClassRelationshipType,
  label?: string,
): Edge {
  const base = {
    id: `${from}-${to}-${relType}`,
    source: from,
    target: to,
    labelStyle: EDGE_LABEL_STYLE,
  };

  switch (relType) {
    case "inheritance":
      return {
        ...base,
        style: EDGE_STYLE,
        markerEnd: {
          type: MarkerType.Arrow,
          color: "var(--siren-edge, hsl(0 0% 40%))",
        },
        label: label,
      };
    case "composition":
      return {
        ...base,
        style: EDGE_STYLE,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--siren-edge, hsl(0 0% 40%))",
        },
        label: label ? `\u25C6 ${label}` : "\u25C6",
      };
    case "aggregation":
      return {
        ...base,
        style: EDGE_STYLE,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--siren-edge, hsl(0 0% 40%))",
        },
        label: label ? `\u25C7 ${label}` : "\u25C7",
      };
    case "association":
      return {
        ...base,
        style: EDGE_STYLE,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--siren-edge, hsl(0 0% 40%))",
        },
        label: label,
      };
    case "dependency":
      return {
        ...base,
        style: EDGE_DASHED_STYLE,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--siren-edge, hsl(0 0% 40%))",
        },
        label: label,
      };
    case "realization":
      return {
        ...base,
        style: EDGE_DASHED_STYLE,
        markerEnd: {
          type: MarkerType.Arrow,
          color: "var(--siren-edge, hsl(0 0% 40%))",
        },
        label: label,
      };
    default:
      return {
        ...base,
        style: EDGE_STYLE,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--siren-edge, hsl(0 0% 40%))",
        },
        label: label,
      };
  }
}

function ClassDiagramInner({
  direction = "TB",
  children,
  className,
  style,
}: Omit<ClassDiagramProps, "theme">) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;

      const type = child.type;
      const props = child.props as Record<string, any>;

      if (
        type === ClassNode ||
        (type as any)?.displayName === "ClassNode"
      ) {
        nodes.push({
          id: props.id,
          type: "class",
          position: { x: 0, y: 0 },
          data: {
            label: props.label,
            attributes: props.attributes ?? [],
            methods: props.methods ?? [],
          },
        });
      } else if (
        type === ClassRelationship ||
        (type as any)?.name === "ClassRelationship" ||
        props.from
      ) {
        const relType: ClassRelationshipType = props.type ?? "association";
        edges.push(getEdgeForRelationship(props.from, props.to, relType, props.label));
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

export function ClassDiagram({ theme, ...props }: ClassDiagramProps) {
  const inner = (
    <ReactFlowProvider>
      <ClassDiagramInner {...props} />
    </ReactFlowProvider>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

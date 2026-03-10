"use client";

import React, { Children, isValidElement, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";
import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";
import type { LayoutDirection } from "@siren/core";
import { useAutoLayout } from "@siren/react";
import { C4Person } from "./c4-person";
import { C4System } from "./c4-system";
import { C4Boundary } from "./c4-boundary";
import {
  EDGE_STYLE,
  EDGE_MARKER,
  EDGE_LABEL_STYLE,
  PRO_OPTIONS,
} from "../shared/edge-styles";

function LayoutRunner({ direction }: { direction: LayoutDirection }) {
  useAutoLayout(direction);
  return null;
}

interface C4DiagramProps {
  direction?: LayoutDirection;
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Hoisted module-level — React Flow docs: "define nodeTypes outside of the component"
const nodeTypes = {
  "c4-person": C4Person,
  "c4-system": C4System,
  "c4-boundary": C4Boundary,
};

/**
 * Recursively collect nodes and edges from children.
 * C4Boundary children are nested — their children become child nodes with parentId set.
 */
function collectChildren(
  children: React.ReactNode,
  nodes: Node[],
  edges: Edge[],
  parentId?: string
) {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    const type = child.type;
    const props = child.props as Record<string, any>;

    if (
      type === C4Boundary ||
      (type as any)?.displayName === "C4Boundary"
    ) {
      const groupNode: Node = {
        id: props.id,
        type: "c4-boundary",
        position: { x: 0, y: 0 },
        data: { label: props.label },
        style: { width: 280, height: 180 },
      };

      if (parentId) {
        groupNode.parentId = parentId;
        groupNode.extent = "parent" as const;
      }

      nodes.push(groupNode);

      // Recurse into boundary children
      if (props.children) {
        collectChildren(props.children, nodes, edges, props.id);
      }
    } else if (
      type === C4Person ||
      (type as any)?.displayName === "C4Person"
    ) {
      const node: Node = {
        id: props.id,
        type: "c4-person",
        position: { x: 0, y: 0 },
        data: {
          label: props.label,
          description: props.description,
        },
      };

      if (parentId) {
        node.parentId = parentId;
        node.extent = "parent" as const;
      }

      nodes.push(node);
    } else if (
      type === C4System ||
      (type as any)?.displayName === "C4System"
    ) {
      const node: Node = {
        id: props.id,
        type: "c4-system",
        position: { x: 0, y: 0 },
        data: {
          label: props.label,
          description: props.description,
          external: props.external,
        },
      };

      if (parentId) {
        node.parentId = parentId;
        node.extent = "parent" as const;
      }

      nodes.push(node);
    } else if (
      (type as any)?.name === "C4Relationship" ||
      (props.from && props.to)
    ) {
      edges.push({
        id: `${props.from}-${props.to}`,
        source: props.from,
        target: props.to,
        label: props.label,
        animated: false,
        style: EDGE_STYLE,
        markerEnd: EDGE_MARKER,
        labelStyle: EDGE_LABEL_STYLE,
      });
    }
  });
}

function C4DiagramInner({
  direction = "TB",
  children,
  className,
  style,
}: Omit<C4DiagramProps, "theme">) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    collectChildren(children, nodes, edges);
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

export function C4Diagram({ theme, ...props }: C4DiagramProps) {
  const inner = (
    <ReactFlowProvider>
      <C4DiagramInner {...props} />
    </ReactFlowProvider>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

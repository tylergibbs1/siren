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
import { BlockNode } from "./block-node";
import { BlockGroup } from "./block-group";
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

interface BlockDiagramProps {
  direction?: LayoutDirection;
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Hoisted module-level
const nodeTypes = {
  block: BlockNode,
  "block-group": BlockGroup,
};

/**
 * Recursively collect nodes and edges from children.
 * BlockGroup children are nested — their children become child nodes with parentId set.
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
      type === BlockGroup ||
      (type as any)?.displayName === "BlockGroup"
    ) {
      const groupNode: Node = {
        id: props.id,
        type: "block-group",
        position: { x: 0, y: 0 },
        data: { label: props.label },
        style: { width: 250, height: 150 },
      };

      if (parentId) {
        groupNode.parentId = parentId;
        groupNode.extent = "parent" as const;
      }

      nodes.push(groupNode);

      // Recurse into group children
      if (props.children) {
        collectChildren(props.children, nodes, edges, props.id);
      }
    } else if (
      type === BlockNode ||
      (type as any)?.displayName === "BlockNode"
    ) {
      const node: Node = {
        id: props.id,
        type: "block",
        position: { x: 0, y: 0 },
        data: { label: props.label },
      };

      if (parentId) {
        node.parentId = parentId;
        node.extent = "parent" as const;
      }

      nodes.push(node);
    } else if (
      (type as any)?.name === "Connection" ||
      (props.from && props.to && !props.type)
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

function BlockDiagramInner({
  direction = "TB",
  children,
  className,
  style,
}: Omit<BlockDiagramProps, "theme">) {
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

export function BlockDiagram({ theme, ...props }: BlockDiagramProps) {
  const inner = (
    <ReactFlowProvider>
      <BlockDiagramInner {...props} />
    </ReactFlowProvider>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

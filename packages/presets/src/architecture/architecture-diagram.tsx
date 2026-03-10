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
import { ArchService } from "./arch-service";
import { ArchGroup } from "./arch-group";
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

interface ArchitectureDiagramProps {
  direction?: LayoutDirection;
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Hoisted module-level
const nodeTypes = {
  "arch-service": ArchService,
  "arch-group": ArchGroup,
};

/**
 * Recursively collect nodes and edges from children.
 * ArchGroup children are nested — their children become child nodes with parentId set.
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
      type === ArchGroup ||
      (type as any)?.displayName === "ArchGroup"
    ) {
      const groupNode: Node = {
        id: props.id,
        type: "arch-group",
        position: { x: 0, y: 0 },
        data: { label: props.label, icon: props.icon },
        style: { width: 260, height: 160 },
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
      type === ArchService ||
      (type as any)?.displayName === "ArchService"
    ) {
      const node: Node = {
        id: props.id,
        type: "arch-service",
        position: { x: 0, y: 0 },
        data: { label: props.label, icon: props.icon },
      };

      if (parentId) {
        node.parentId = parentId;
        node.extent = "parent" as const;
      }

      nodes.push(node);
    } else if (
      (type as any)?.name === "ArchConnection" ||
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

function ArchitectureDiagramInner({
  direction = "TB",
  children,
  className,
  style,
}: Omit<ArchitectureDiagramProps, "theme">) {
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

export function ArchitectureDiagram({
  theme,
  ...props
}: ArchitectureDiagramProps) {
  const inner = (
    <ReactFlowProvider>
      <ArchitectureDiagramInner {...props} />
    </ReactFlowProvider>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

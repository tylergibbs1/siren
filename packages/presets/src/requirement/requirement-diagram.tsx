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
import { RequirementNode } from "./requirement-node";
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

interface RequirementDiagramProps {
  direction?: LayoutDirection;
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Hoisted module-level
const nodeTypes = {
  requirement: RequirementNode,
};

function RequirementDiagramInner({
  direction = "TB",
  children,
  className,
  style,
}: Omit<RequirementDiagramProps, "theme">) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;

      const type = child.type;
      const props = child.props as Record<string, any>;

      if (
        type === RequirementNode ||
        (type as any)?.displayName === "RequirementNode"
      ) {
        nodes.push({
          id: props.id,
          type: "requirement",
          position: { x: 0, y: 0 },
          data: {
            label: props.label,
            kind: props.kind,
            risk: props.risk,
            status: props.status,
            variant: props.variant,
          },
        });
      } else if (
        (type as any)?.name === "Relationship" ||
        (props.from && props.type)
      ) {
        edges.push({
          id: `${props.from}-${props.to}-${props.type}`,
          source: props.from,
          target: props.to,
          label: props.type,
          animated: false,
          style: EDGE_STYLE,
          markerEnd: EDGE_MARKER,
          labelStyle: EDGE_LABEL_STYLE,
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

export function RequirementDiagram({
  theme,
  ...props
}: RequirementDiagramProps) {
  const inner = (
    <ReactFlowProvider>
      <RequirementDiagramInner {...props} />
    </ReactFlowProvider>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

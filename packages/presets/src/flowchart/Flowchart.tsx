"use client";

import React, {
  Children,
  isValidElement,
  useMemo,
} from "react";
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
import { Step } from "./step";
import { Decision } from "./decision";
import { useAutoLayout } from "@siren/react";
import {
  EDGE_STYLE,
  EDGE_DASHED_STYLE,
  EDGE_MARKER,
  EDGE_LABEL_STYLE,
  PRO_OPTIONS,
} from "../shared/edge-styles";

function LayoutRunner({ direction }: { direction: LayoutDirection }) {
  useAutoLayout(direction);
  return null;
}

interface FlowchartProps {
  direction?: LayoutDirection;
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Hoisted module-level — React Flow docs: "define nodeTypes outside of the component"
const nodeTypes = {
  step: Step,
  decision: Decision,
};

// Hoisted static wrapper style (rendering-hoist-jsx)
const DEFAULT_WRAPPER_STYLE = { width: "100%", height: "100%" };

function FlowchartInner({
  direction = "TB",
  children,
  className,
  style,
}: Omit<FlowchartProps, "theme">) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;

      const type = child.type;
      const props = child.props as Record<string, any>;

      if (type === Step || (type as any)?.displayName === "Step") {
        nodes.push({
          id: props.id,
          type: "step",
          position: { x: 0, y: 0 },
          data: {
            label: props.label,
            variant: props.variant,
          },
        });
      } else if (type === Decision || (type as any)?.displayName === "Decision") {
        nodes.push({
          id: props.id,
          type: "decision",
          position: { x: 0, y: 0 },
          data: {
            label: props.label,
          },
        });
      } else if ((type as any)?.name === "FlowEdge" || props.from) {
        edges.push({
          id: `${props.from}-${props.to}`,
          source: props.from,
          target: props.to,
          label: props.label,
          animated: props.animated ?? false,
          style: props.dashed ? EDGE_DASHED_STYLE : EDGE_STYLE,
          markerEnd: EDGE_MARKER,
          labelStyle: EDGE_LABEL_STYLE,
        });
      }
    });

    return { nodes, edges };
  }, [children]);

  const wrapperStyle = style
    ? { ...DEFAULT_WRAPPER_STYLE, ...style }
    : DEFAULT_WRAPPER_STYLE;

  return (
    <div className={className} style={wrapperStyle}>
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
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="var(--siren-node-border, hsl(0 0% 18%))" />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export function Flowchart({ theme, ...props }: FlowchartProps) {
  const inner = (
    <ReactFlowProvider>
      <FlowchartInner {...props} />
    </ReactFlowProvider>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

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
import { StateNode } from "./state-node";
import { StateInitial } from "./state-initial";
import { StateFinal } from "./state-final";
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

interface StateDiagramProps {
  direction?: LayoutDirection;
  theme?: SirenTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Hoisted module-level — React Flow docs: "define nodeTypes outside of the component"
const nodeTypes = {
  state: StateNode,
  "state-initial": StateInitial,
  "state-final": StateFinal,
};

function StateDiagramInner({
  direction = "TB",
  children,
  className,
  style,
}: Omit<StateDiagramProps, "theme">) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) return;

      const type = child.type;
      const props = child.props as Record<string, any>;

      if (
        type === StateNode ||
        (type as any)?.displayName === "StateNode"
      ) {
        nodes.push({
          id: props.id,
          type: "state",
          position: { x: 0, y: 0 },
          data: {
            label: props.label,
            variant: props.variant,
          },
        });
      } else if (
        type === StateInitial ||
        (type as any)?.displayName === "StateInitial"
      ) {
        nodes.push({
          id: props.id,
          type: "state-initial",
          position: { x: 0, y: 0 },
          data: { label: props.label },
        });
      } else if (
        type === StateFinal ||
        (type as any)?.displayName === "StateFinal"
      ) {
        nodes.push({
          id: props.id,
          type: "state-final",
          position: { x: 0, y: 0 },
          data: { label: props.label },
        });
      } else if (
        (type as any)?.name === "Transition" ||
        props.from
      ) {
        const guardLabel = props.guard
          ? props.label
            ? `[${props.guard}] ${props.label}`
            : `[${props.guard}]`
          : props.label;

        edges.push({
          id: `${props.from}-${props.to}`,
          source: props.from,
          target: props.to,
          label: guardLabel,
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

export function StateDiagram({ theme, ...props }: StateDiagramProps) {
  const inner = (
    <ReactFlowProvider>
      <StateDiagramInner {...props} />
    </ReactFlowProvider>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

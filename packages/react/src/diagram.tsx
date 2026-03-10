"use client";

import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";
import type { LayoutDirection } from "@siren/core";
import { useAutoLayout } from "./use-auto-layout";

export interface DiagramProps {
  nodes: Node[];
  edges: Edge[];
  direction?: LayoutDirection;
  theme?: SirenTheme;
  nodeTypes?: NodeTypes;
  edgeTypes?: EdgeTypes;
  className?: string;
  style?: React.CSSProperties;
  showBackground?: boolean;
  showControls?: boolean;
  ariaLabel?: string;
}

function LayoutRunner({ direction }: { direction: LayoutDirection }) {
  useAutoLayout(direction);
  return null;
}

function DiagramInner({
  nodes,
  edges,
  direction = "TB",
  nodeTypes,
  edgeTypes,
  className,
  style,
  showBackground = true,
  showControls = false,
  ariaLabel,
}: Omit<DiagramProps, "theme">) {
  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        role="img"
        aria-roledescription="diagram"
        aria-label={ariaLabel ?? "Diagram"}
      >
        <LayoutRunner direction={direction} />
        {showBackground && (
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        )}
        {showControls && <Controls />}
      </ReactFlow>
    </div>
  );
}

export function Diagram({ theme, ...props }: DiagramProps) {
  const inner = (
    <ReactFlowProvider>
      <DiagramInner {...props} />
    </ReactFlowProvider>
  );

  if (theme) {
    return <SirenProvider theme={theme}>{inner}</SirenProvider>;
  }

  return inner;
}

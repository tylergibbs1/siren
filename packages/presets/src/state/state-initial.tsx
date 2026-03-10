"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { HIDDEN_HANDLE_STYLE } from "../shared/edge-styles";

export type StateInitialData = {
  label?: string;
};

export type StateInitialNodeType = Node<StateInitialData, "state-initial">;

function StateInitialComponent(_props: NodeProps<StateInitialNodeType>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={HIDDEN_HANDLE_STYLE}
      />
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "var(--siren-text, #1e293b)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={HIDDEN_HANDLE_STYLE}
      />
    </>
  );
}

export const StateInitial = memo(StateInitialComponent);
(StateInitial as any).displayName = "StateInitial";

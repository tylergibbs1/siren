"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

export type GitCommitData = {
  message: string;
  branch: string;
  color: string;
  merge?: boolean;
};

export type GitCommitNode = Node<GitCommitData, "git-commit">;

function GitCommitComponent({ data }: NodeProps<GitCommitNode>) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ visibility: "hidden" }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          position: "relative",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Commit circle */}
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            background: data.color,
            border: data.merge
              ? "3px solid var(--siren-text, hsl(0 0% 98%))"
              : `3px solid ${data.color}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            flexShrink: 0,
          }}
        />
        {/* Message label — always visible beside the commit */}
        <span
          style={{
            fontFamily: "var(--siren-font, system-ui)",
            fontSize: "11px",
            fontWeight: 400,
            color: "var(--siren-text, hsl(0 0% 98%))",
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
            opacity: hovered ? 1 : 0.7,
            transition: "opacity 150ms",
          }}
        >
          {data.message}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ visibility: "hidden" }}
      />
    </>
  );
}

export const GitCommit = memo(GitCommitComponent);
(GitCommit as any).displayName = "GitCommit";

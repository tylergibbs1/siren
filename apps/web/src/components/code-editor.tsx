"use client";

import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import type { Monaco } from "@monaco-editor/react";

// Dynamic import with ssr: false — Monaco is ~300KB+ (bundle-dynamic-imports)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
      Loading editor…
    </div>
  ),
});

// JSON schema for Siren diagrams — registered once via beforeMount
const SIREN_JSON_SCHEMA = {
  uri: "https://siren.dev/schema.json",
  fileMatch: ["*"],
  schema: {
    oneOf: [
      {
        type: "object",
        required: ["type", "nodes", "edges"],
        properties: {
          type: { const: "flowchart" },
          direction: { enum: ["TB", "BT", "LR", "RL"] },
          nodes: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "label"],
              properties: {
                id: { type: "string" },
                label: { type: "string" },
                shape: { enum: ["rounded", "rectangle", "diamond"] },
                variant: {
                  enum: ["default", "primary", "success", "warning", "danger"],
                },
              },
            },
          },
          edges: {
            type: "array",
            items: {
              type: "object",
              required: ["from", "to"],
              properties: {
                from: { type: "string" },
                to: { type: "string" },
                label: { type: "string" },
                dashed: { type: "boolean" },
                animated: { type: "boolean" },
              },
            },
          },
        },
      },
      {
        type: "object",
        required: ["type", "actors", "messages"],
        properties: {
          type: { const: "sequence" },
          actors: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "label"],
              properties: {
                id: { type: "string" },
                label: { type: "string" },
              },
            },
          },
          messages: {
            type: "array",
            items: {
              type: "object",
              required: ["from", "to"],
              properties: {
                from: { type: "string" },
                to: { type: "string" },
                label: { type: "string" },
                reply: { type: "boolean" },
              },
            },
          },
        },
      },
    ],
  },
};

// Hoisted editor options — avoids object recreation (rendering-hoist-jsx)
const EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  lineNumbers: "on" as const,
  scrollBeyondLastLine: false,
  renderLineHighlight: "none" as const,
  padding: { top: 16, bottom: 16 },
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder: false,
  scrollbar: {
    vertical: "hidden" as const,
    horizontal: "hidden" as const,
  },
  wordWrap: "on" as const,
  tabSize: 2,
  automaticLayout: true,
  formatOnPaste: true,
  suggest: {
    showKeywords: true,
    showSnippets: true,
  },
} as const;

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  const editorRef = useRef<unknown>(null);

  // Configure JSON schema validation before Monaco mounts
  const handleBeforeMount = useCallback((monaco: Monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [SIREN_JSON_SCHEMA],
      allowComments: false,
      trailingCommas: "error",
    });
  }, []);

  // Store editor ref for programmatic access (e.g., format on export)
  const handleMount = useCallback(
    (editor: unknown) => {
      editorRef.current = editor;
    },
    []
  );

  return (
    <MonacoEditor
      height="100%"
      language="json"
      theme="vs-dark"
      value={value}
      onChange={onChange}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      options={EDITOR_OPTIONS}
    />
  );
}

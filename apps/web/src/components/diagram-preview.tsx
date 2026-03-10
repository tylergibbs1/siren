"use client";

import React, { useMemo, useEffect, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useNodesInitialized,
  type Node,
  type Edge,
} from "@xyflow/react";
import { validate } from "@siren/schema";
import type { FlowchartSchema, SequenceSchema, SirenSchema } from "@siren/schema";
import { layoutGraph } from "@siren/core";
// Direct imports — avoid barrel re-exports for bundle size (bundle-barrel-imports)
import { Step } from "@siren/presets";
import { Decision } from "@siren/presets";
import { Actor } from "@siren/presets";

// Preset imports for all diagram types
import { StateDiagram } from "@siren/presets";
import { StateNode } from "@siren/presets";
import { StateInitial } from "@siren/presets";
import { StateFinal } from "@siren/presets";
import { Transition } from "@siren/presets";

import { ClassDiagram } from "@siren/presets";
import { ClassNode } from "@siren/presets";
import { ClassRelationship } from "@siren/presets";

import { ERDiagram } from "@siren/presets";
import { EREntity } from "@siren/presets";
import { ERRelationship } from "@siren/presets";

import { Timeline } from "@siren/presets";
import { TimelineEvent } from "@siren/presets";

import { Kanban } from "@siren/presets";
import { KanbanColumn } from "@siren/presets";
import { KanbanCard } from "@siren/presets";

import { QuadrantChart } from "@siren/presets";
import { QuadrantItem } from "@siren/presets";

import { PieChart } from "@siren/presets";

import { C4Diagram } from "@siren/presets";
import { C4Person } from "@siren/presets";
import { C4System } from "@siren/presets";
import { C4Boundary } from "@siren/presets";
import { C4Relationship } from "@siren/presets";

import { ArchitectureDiagram } from "@siren/presets";
import { ArchService } from "@siren/presets";
import { ArchGroup } from "@siren/presets";
import { ArchConnection } from "@siren/presets";

import { BlockDiagram } from "@siren/presets";
import { BlockNode } from "@siren/presets";
import { BlockGroup } from "@siren/presets";
import { Connection } from "@siren/presets";

import { RequirementDiagram } from "@siren/presets";
import { RequirementNode } from "@siren/presets";
import { Relationship } from "@siren/presets";

import { Mindmap } from "@siren/presets";
import { GitGraph } from "@siren/presets";

import { Gantt } from "@siren/presets";
import { GanttSection } from "@siren/presets";
import { GanttTask } from "@siren/presets";

import { SankeyDiagram } from "@siren/presets";
import { PacketDiagram } from "@siren/presets";

// Hoisted outside component to avoid recreation on every render (rendering-hoist-jsx)
const nodeTypes = {
  step: Step,
  decision: Decision,
  actor: Actor,
} as const;

// Hoisted static marker config — uses CSS vars from Radix design tokens
const EDGE_MARKER = { type: MarkerType.ArrowClosed, color: "var(--scale-8)" } as const;
const EDGE_LABEL_STYLE = { fontSize: 12, fill: "var(--scale-11)", fontWeight: 500 } as const;
const EDGE_LABEL_BG_STYLE = { fill: "var(--scale-1)" } as const;
const EDGE_STYLE = { stroke: "var(--scale-8)" } as const;
const EDGE_DASHED_STYLE = { strokeDasharray: "5 5", stroke: "var(--scale-8)" } as const;
const EDGE_REPLY_STYLE = { strokeDasharray: "6 4", stroke: "var(--scale-8)" } as const;
const BG_COLOR = "var(--scale-4)";

// Hoisted ReactFlow shared props to avoid object recreation (rerender-memo-with-default-value)
// onlyRenderVisibleElements for perf on large graphs (React Flow best practice)
const FLOW_PROPS = {
  fitView: true,
  proOptions: { hideAttribution: true },
  nodesDraggable: false,
  nodesConnectable: false,
  elementsSelectable: false,
  onlyRenderVisibleElements: true,
} as const;

interface DiagramPreviewProps {
  code: string;
  onError: (error: string | null) => void;
}

function schemaToNodesEdges(schema: FlowchartSchema | SequenceSchema) {
  if (schema.type === "flowchart") {
    const nodes: Node[] = schema.nodes.map((n) => ({
      id: n.id,
      type: n.shape === "diamond" ? "decision" : "step",
      position: { x: 0, y: 0 },
      data: { label: n.label, variant: n.variant },
    }));

    const edges: Edge[] = schema.edges.map((e, i) => ({
      id: `e-${i}`,
      source: e.from,
      target: e.to,
      label: e.label,
      animated: e.animated,
      style: e.dashed ? EDGE_DASHED_STYLE : EDGE_STYLE,
      markerEnd: EDGE_MARKER,
      labelStyle: EDGE_LABEL_STYLE,
      labelBgStyle: EDGE_LABEL_BG_STYLE,
    }));

    return { nodes, edges, direction: schema.direction ?? "TB" };
  }

  // Sequence — positioned manually, no ELK layout needed
  const spacing = 200;
  const nodes: Node[] = schema.actors.map((a, i) => ({
    id: a.id,
    type: "actor",
    position: { x: i * spacing, y: 0 },
    data: { label: a.label },
  }));

  const edges: Edge[] = schema.messages.map((m, i) => ({
    id: `msg-${i}`,
    source: m.from,
    target: m.to,
    label: m.label,
    type: "straight",
    style: m.reply ? EDGE_REPLY_STYLE : EDGE_STYLE,
    markerEnd: EDGE_MARKER,
    labelStyle: EDGE_LABEL_STYLE,
    labelBgStyle: EDGE_LABEL_BG_STYLE,
  }));

  return { nodes, edges, direction: null };
}

function AutoLayoutFlow({
  initialNodes,
  initialEdges,
  direction,
}: {
  initialNodes: Node[];
  initialEdges: Edge[];
  direction: string | null;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const hasLaidOut = useRef(false);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  // Reset layout flag when inputs change
  useEffect(() => {
    setNodes(initialNodes);
    hasLaidOut.current = false;
  }, [initialNodes, setNodes]);

  // Run ELK layout once nodes are measured (async-parallel: layout is already async)
  useEffect(() => {
    if (!nodesInitialized || hasLaidOut.current || !direction) return;
    const currentNodes = nodesRef.current;
    if (currentNodes.length === 0) return;

    const allMeasured = currentNodes.every((n) => n.measured?.width);
    if (!allMeasured) return;

    hasLaidOut.current = true;

    const sirenNodes = currentNodes.map((n) => ({
      id: n.id,
      width: n.measured?.width ?? 180,
      height: n.measured?.height ?? 60,
    }));

    const sirenEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    }));

    layoutGraph({
      nodes: sirenNodes,
      edges: sirenEdges,
      direction: direction as "TB" | "BT" | "LR" | "RL",
    }).then((result) => {
      setNodes((prev) =>
        prev.map((node) => {
          const laid = result.nodes.find((n) => n.id === node.id);
          if (!laid) return node;
          return { ...node, position: { x: laid.x, y: laid.y } };
        })
      );
      requestAnimationFrame(() => {
        fitView({ padding: 0.2, duration: 300 });
      });
    });
  }, [nodesInitialized, edges, direction, setNodes, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      {...FLOW_PROPS}
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} color={BG_COLOR} />
      <Controls />
    </ReactFlow>
  );
}

/** Wrapper div for preset components that fill their container */
const FILL_STYLE = { width: "100%", height: "100%" } as const;

/**
 * Helper to create a declarative child element.
 * Preset container components read props from children via child.props,
 * so the actual component type is used for identity matching but the extra
 * props are only read at runtime. We use a type assertion to satisfy TS.
 */
function el(Component: React.ComponentType<any>, props: Record<string, any>, children?: React.ReactNode): React.ReactNode {
  return React.createElement(Component, props, children);
}

/** Render the appropriate preset component based on schema type */
function renderDiagram(schema: SirenSchema): React.ReactNode {
  switch (schema.type) {
    case "flowchart":
    case "sequence": {
      // These use the existing AutoLayoutFlow approach
      const { nodes, edges, direction } = schemaToNodesEdges(schema);
      return (
        <ReactFlowProvider key={nodes.map((n) => n.id).join(",")}>
          <AutoLayoutFlow
            initialNodes={nodes}
            initialEdges={edges}
            direction={direction}
          />
        </ReactFlowProvider>
      );
    }

    case "state": {
      return (
        <div style={FILL_STYLE}>
          <StateDiagram direction={schema.direction}>
            {schema.states.map((st) => {
              if (st.initial) return el(StateInitial, { key: st.id, id: st.id });
              if (st.final) return el(StateFinal, { key: st.id, id: st.id });
              return el(StateNode, { key: st.id, id: st.id, label: st.label, variant: st.variant });
            })}
            {schema.transitions.map((t, i) => (
              <Transition key={`t-${i}`} from={t.from} to={t.to} label={t.label} guard={t.guard} />
            ))}
          </StateDiagram>
        </div>
      );
    }

    case "class": {
      return (
        <div style={FILL_STYLE}>
          <ClassDiagram direction={schema.direction}>
            {schema.classes.map((c) =>
              el(ClassNode, {
                key: c.id,
                id: c.id,
                label: c.name,
                attributes: c.attributes ?? [],
                methods: c.methods ?? [],
              })
            )}
            {schema.relationships.map((r, i) => (
              <ClassRelationship
                key={`r-${i}`}
                from={r.from}
                to={r.to}
                type={r.type}
                label={r.label}
              />
            ))}
          </ClassDiagram>
        </div>
      );
    }

    case "er": {
      return (
        <div style={FILL_STYLE}>
          <ERDiagram direction={schema.direction}>
            {schema.entities.map((e) =>
              el(EREntity, { key: e.id, id: e.id, label: e.name, columns: e.columns })
            )}
            {schema.relationships.map((r, i) => (
              <ERRelationship
                key={`r-${i}`}
                from={r.from}
                to={r.to}
                cardinality={r.cardinality}
                label={r.label}
              />
            ))}
          </ERDiagram>
        </div>
      );
    }

    case "timeline": {
      return (
        <div style={FILL_STYLE}>
          <Timeline>
            {schema.events.map((e) =>
              el(TimelineEvent, {
                key: e.id,
                id: e.id,
                date: e.date,
                label: e.label,
                description: e.description,
                variant: e.variant,
              })
            )}
          </Timeline>
        </div>
      );
    }

    case "kanban": {
      return (
        <div style={FILL_STYLE}>
          <Kanban>
            {schema.columns.flatMap((col) => [
              el(KanbanColumn, { key: col.id, id: col.id, label: col.label }),
              ...col.cards.map((card) =>
                el(KanbanCard, { key: card.id, id: card.id, label: card.label, tag: card.tag })
              ),
            ])}
          </Kanban>
        </div>
      );
    }

    case "quadrant": {
      const quadrants = schema.quadrants
        ? ([
            { label: schema.quadrants[0], color: "rgba(34, 197, 94, 0.12)" },
            { label: schema.quadrants[1], color: "rgba(59, 130, 246, 0.12)" },
            { label: schema.quadrants[2], color: "rgba(245, 158, 11, 0.12)" },
            { label: schema.quadrants[3], color: "rgba(239, 68, 68, 0.12)" },
          ] as [{ label: string; color: string }, { label: string; color: string }, { label: string; color: string }, { label: string; color: string }])
        : undefined;
      return (
        <div style={FILL_STYLE}>
          <QuadrantChart
            xAxis={schema.xLabel ? { label: schema.xLabel } : undefined}
            yAxis={schema.yLabel ? { label: schema.yLabel } : undefined}
            quadrants={quadrants}
          >
            {schema.items.map((item) =>
              el(QuadrantItem, { key: item.id, id: item.id, label: item.label, x: item.x, y: item.y })
            )}
          </QuadrantChart>
        </div>
      );
    }

    case "pie": {
      return (
        <div style={FILL_STYLE}>
          <PieChart title={schema.title} segments={schema.segments} />
        </div>
      );
    }

    case "c4": {
      return (
        <div style={FILL_STYLE}>
          <C4Diagram direction={schema.direction}>
            {schema.elements.map((elem) => {
              if (elem.type === "person") {
                return el(C4Person, { key: elem.id, id: elem.id, label: elem.label, description: elem.description });
              }
              if (elem.type === "boundary") {
                return el(
                  C4Boundary,
                  { key: elem.id, id: elem.id, label: elem.label },
                  elem.children?.map((child) => {
                    if (child.type === "person") {
                      return el(C4Person, { key: child.id, id: child.id, label: child.label, description: child.description });
                    }
                    return el(C4System, { key: child.id, id: child.id, label: child.label, description: child.description });
                  })
                );
              }
              return el(C4System, { key: elem.id, id: elem.id, label: elem.label, description: elem.description });
            })}
            {schema.relationships.map((r, i) => (
              <C4Relationship key={`r-${i}`} from={r.from} to={r.to} label={r.label} />
            ))}
          </C4Diagram>
        </div>
      );
    }

    case "architecture": {
      return (
        <div style={FILL_STYLE}>
          <ArchitectureDiagram direction={schema.direction}>
            {schema.groups.map((g) =>
              el(
                ArchGroup,
                { key: g.id, id: g.id, label: g.label, icon: g.icon },
                g.services.map((svc) =>
                  el(ArchService, { key: svc.id, id: svc.id, label: svc.label, icon: svc.icon })
                )
              )
            )}
            {schema.services?.map((svc) =>
              el(ArchService, { key: svc.id, id: svc.id, label: svc.label, icon: svc.icon })
            )}
            {schema.connections.map((c, i) => (
              <ArchConnection key={`c-${i}`} from={c.from} to={c.to} label={c.label} />
            ))}
          </ArchitectureDiagram>
        </div>
      );
    }

    case "block": {
      return (
        <div style={FILL_STYLE}>
          <BlockDiagram direction={schema.direction}>
            {schema.blocks.map((b) => {
              if (b.children && b.children.length > 0) {
                return el(
                  BlockGroup,
                  { key: b.id, id: b.id, label: b.label },
                  b.children.map((child) =>
                    el(BlockNode, { key: child.id, id: child.id, label: child.label })
                  )
                );
              }
              return el(BlockNode, { key: b.id, id: b.id, label: b.label });
            })}
            {schema.connections.map((c, i) => (
              <Connection key={`c-${i}`} from={c.from} to={c.to} label={c.label} />
            ))}
          </BlockDiagram>
        </div>
      );
    }

    case "requirement": {
      return (
        <div style={FILL_STYLE}>
          <RequirementDiagram direction={schema.direction}>
            {schema.requirements.map((r) =>
              el(RequirementNode, {
                key: r.id,
                id: r.id,
                label: r.label,
                kind: r.kind,
                risk: r.risk,
                status: r.status,
              })
            )}
            {schema.relationships.map((r, i) => (
              <Relationship key={`r-${i}`} from={r.from} to={r.to} type={r.type} />
            ))}
          </RequirementDiagram>
        </div>
      );
    }

    case "mindmap": {
      return (
        <div style={FILL_STYLE}>
          <Mindmap root={schema.root} />
        </div>
      );
    }

    case "gitgraph": {
      return (
        <div style={FILL_STYLE}>
          <GitGraph commits={schema.commits} />
        </div>
      );
    }

    case "gantt": {
      return (
        <div style={FILL_STYLE}>
          <Gantt title={schema.title}>
            {schema.sections.map((sec, si) => (
              <GanttSection key={`s-${si}`} label={sec.label}>
                {sec.tasks.map((t) => (
                  <GanttTask
                    key={t.id}
                    id={t.id}
                    label={t.label}
                    start={t.start}
                    end={t.end}
                  />
                ))}
              </GanttSection>
            ))}
          </Gantt>
        </div>
      );
    }

    case "sankey": {
      return (
        <div style={FILL_STYLE}>
          <SankeyDiagram nodes={schema.nodes} flows={schema.flows} />
        </div>
      );
    }

    case "packet": {
      return (
        <div style={FILL_STYLE}>
          <PacketDiagram title={schema.title} wordSize={schema.wordSize} rows={schema.rows} />
        </div>
      );
    }

    default:
      return (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
          Unsupported diagram type
        </div>
      );
  }
}

function PreviewInner({ code, onError }: DiagramPreviewProps) {
  // Pure computation: parse and validate (no side effects)
  const { schema, error } = useMemo(() => {
    try {
      const parsed = JSON.parse(code);
      const result = validate(parsed);
      if (!result.valid) {
        return { schema: null, error: result.errors?.join(", ") ?? "Invalid schema" };
      }
      return { schema: result.data!, error: null };
    } catch (e) {
      if (code.trim().length > 2) {
        return { schema: null, error: e instanceof Error ? e.message : "Parse error" };
      }
      return { schema: null, error: null };
    }
  }, [code]);

  // Side effect: notify parent of error changes
  useEffect(() => {
    onError(error);
  }, [error, onError]);

  const rendered = useMemo(() => {
    if (!schema) return null;
    return renderDiagram(schema);
  }, [schema]);

  if (!schema) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
        Write valid JSON to see a preview
      </div>
    );
  }

  return <>{rendered}</>;
}

export function DiagramPreview(props: DiagramPreviewProps) {
  return <PreviewInner {...props} />;
}

import React from "react";
import type { SirenSchema } from "./types";
import {
  Actor,
  ArchConnection,
  ArchGroup,
  ArchService,
  ArchitectureDiagram,
  BlockDiagram,
  BlockGroup,
  BlockNode,
  C4Boundary,
  C4Diagram,
  C4Person,
  C4Relationship,
  C4System,
  ClassDiagram,
  ClassNode,
  ClassRelationship,
  Connection,
  Decision,
  EREntity,
  ERDiagram,
  ERRelationship,
  FlowEdge,
  Flowchart,
  Gantt,
  GanttSection,
  GanttTask,
  GitGraph,
  Kanban,
  KanbanCard,
  KanbanColumn,
  Message,
  Mindmap,
  PacketDiagram,
  PieChart,
  QuadrantChart,
  QuadrantItem,
  Relationship,
  RequirementDiagram,
  RequirementNode,
  SankeyDiagram,
  Sequence,
  StateDiagram,
  StateFinal,
  StateInitial,
  StateNode,
  Step,
  Timeline,
  TimelineEvent,
  Transition,
} from "@siren/presets";

const FILL_STYLE = { width: "100%", height: "100%" } as const;

function el(
  Component: React.ComponentType<any>,
  props: Record<string, unknown>,
  children?: React.ReactNode
) {
  return React.createElement(Component, props, children);
}

export function fromJSON(schema: SirenSchema): React.ReactElement {
  switch (schema.type) {
    case "flowchart":
      return (
        <div style={FILL_STYLE}>
          <Flowchart direction={schema.direction} edgeType={schema.edgeType} mode={schema.interactive ? "interactive" : undefined}>
            {schema.nodes.map((node) =>
              node.shape === "diamond"
                ? el(Decision, { key: node.id, id: node.id, label: node.label })
                : el(Step, {
                    key: node.id,
                    id: node.id,
                    label: node.label,
                    variant: node.variant,
                  })
            )}
            {schema.edges.map((edge, index) => (
              <FlowEdge
                key={`edge-${index}`}
                from={edge.from}
                to={edge.to}
                label={edge.label}
                dashed={edge.dashed}
                animated={edge.animated}
                edgeType={edge.edgeType}
                bidirectional={edge.bidirectional}
                value={edge.value}
              />
            ))}
          </Flowchart>
        </div>
      );

    case "sequence":
      return (
        <div style={FILL_STYLE}>
          <Sequence>
            {schema.actors.map((actor) =>
              el(Actor, { key: actor.id, id: actor.id, label: actor.label })
            )}
            {schema.messages.map((message, index) => (
              <Message
                key={`msg-${index}`}
                from={message.from}
                to={message.to}
                label={message.label}
                reply={message.reply}
              />
            ))}
          </Sequence>
        </div>
      );

    case "state":
      return (
        <div style={FILL_STYLE}>
          <StateDiagram direction={schema.direction} edgeType={schema.edgeType} mode={schema.interactive ? "interactive" : undefined}>
            {schema.states.map((state) => {
              if (state.initial) return el(StateInitial, { key: state.id, id: state.id });
              if (state.final) return el(StateFinal, { key: state.id, id: state.id });
              return el(StateNode, {
                key: state.id,
                id: state.id,
                label: state.label,
                variant: state.variant,
              });
            })}
            {schema.transitions.map((transition, index) => (
              <Transition
                key={`transition-${index}`}
                from={transition.from}
                to={transition.to}
                label={transition.label}
                guard={transition.guard}
                edgeType={transition.edgeType}
                bidirectional={transition.bidirectional}
              />
            ))}
          </StateDiagram>
        </div>
      );

    case "class":
      return (
        <div style={FILL_STYLE}>
          <ClassDiagram direction={schema.direction} edgeType={schema.edgeType} mode={schema.interactive ? "interactive" : undefined}>
            {schema.classes.map((item) =>
              el(ClassNode, {
                key: item.id,
                id: item.id,
                label: item.name,
                attributes: item.attributes ?? [],
                methods: item.methods ?? [],
              })
            )}
            {schema.relationships.map((relationship, index) => (
              <ClassRelationship
                key={`relationship-${index}`}
                from={relationship.from}
                to={relationship.to}
                type={relationship.type}
                label={relationship.label}
                edgeType={relationship.edgeType}
                bidirectional={relationship.bidirectional}
              />
            ))}
          </ClassDiagram>
        </div>
      );

    case "er":
      return (
        <div style={FILL_STYLE}>
          <ERDiagram direction={schema.direction} edgeType={schema.edgeType} mode={schema.interactive ? "interactive" : undefined}>
            {schema.entities.map((entity) =>
              el(EREntity, {
                key: entity.id,
                id: entity.id,
                label: entity.name,
                columns: entity.columns,
              })
            )}
            {schema.relationships.map((relationship, index) => (
              <ERRelationship
                key={`relationship-${index}`}
                from={relationship.from}
                to={relationship.to}
                cardinality={relationship.cardinality}
                label={relationship.label}
                edgeType={relationship.edgeType}
                bidirectional={relationship.bidirectional}
              />
            ))}
          </ERDiagram>
        </div>
      );

    case "timeline":
      return (
        <div style={FILL_STYLE}>
          <Timeline>
            {schema.events.map((event) =>
              el(TimelineEvent, {
                key: event.id,
                id: event.id,
                date: event.date,
                label: event.label,
                description: event.description,
                variant: event.variant,
              })
            )}
          </Timeline>
        </div>
      );

    case "kanban":
      return (
        <div style={FILL_STYLE}>
          <Kanban>
            {schema.columns.flatMap((column) => [
              el(KanbanColumn, {
                key: column.id,
                id: column.id,
                label: column.label,
              }),
              ...column.cards.map((card) =>
                el(KanbanCard, {
                  key: card.id,
                  id: card.id,
                  label: card.label,
                  tag: card.tag,
                })
              ),
            ])}
          </Kanban>
        </div>
      );

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
              el(QuadrantItem, {
                key: item.id,
                id: item.id,
                label: item.label,
                x: item.x,
                y: item.y,
              })
            )}
          </QuadrantChart>
        </div>
      );
    }

    case "pie":
      return (
        <div style={FILL_STYLE}>
          <PieChart title={schema.title} segments={schema.segments} />
        </div>
      );

    case "c4":
      return (
        <div style={FILL_STYLE}>
          <C4Diagram direction={schema.direction} edgeType={schema.edgeType} mode={schema.interactive ? "interactive" : undefined}>
            {schema.elements.map((element) => {
              if (element.type === "person") {
                return el(C4Person, {
                  key: element.id,
                  id: element.id,
                  label: element.label,
                  description: element.description,
                });
              }

              if (element.type === "boundary") {
                return el(
                  C4Boundary,
                  { key: element.id, id: element.id, label: element.label, direction: element.direction },
                  element.children?.map((child) => {
                    if (child.type === "person") {
                      return el(C4Person, {
                        key: child.id,
                        id: child.id,
                        label: child.label,
                        description: child.description,
                      });
                    }

                    return el(C4System, {
                      key: child.id,
                      id: child.id,
                      label: child.label,
                      description: child.description,
                    });
                  })
                );
              }

              return el(C4System, {
                key: element.id,
                id: element.id,
                label: element.label,
                description: element.description,
              });
            })}
            {schema.relationships.map((relationship, index) => (
              <C4Relationship
                key={`relationship-${index}`}
                from={relationship.from}
                to={relationship.to}
                label={relationship.label}
                edgeType={relationship.edgeType}
                bidirectional={relationship.bidirectional}
              />
            ))}
          </C4Diagram>
        </div>
      );

    case "architecture":
      return (
        <div style={FILL_STYLE}>
          <ArchitectureDiagram direction={schema.direction} edgeType={schema.edgeType} mode={schema.interactive ? "interactive" : undefined}>
            {schema.groups.map((group) =>
              el(
                ArchGroup,
                { key: group.id, id: group.id, label: group.label, icon: group.icon, direction: group.direction },
                group.services.map((service) =>
                  el(ArchService, {
                    key: service.id,
                    id: service.id,
                    label: service.label,
                    icon: service.icon,
                  })
                )
              )
            )}
            {schema.services?.map((service) =>
              el(ArchService, {
                key: service.id,
                id: service.id,
                label: service.label,
                icon: service.icon,
              })
            )}
            {schema.connections.map((connection, index) => (
              <ArchConnection
                key={`connection-${index}`}
                from={connection.from}
                to={connection.to}
                label={connection.label}
                edgeType={connection.edgeType}
                bidirectional={connection.bidirectional}
              />
            ))}
          </ArchitectureDiagram>
        </div>
      );

    case "block":
      return (
        <div style={FILL_STYLE}>
          <BlockDiagram direction={schema.direction} edgeType={schema.edgeType} mode={schema.interactive ? "interactive" : undefined}>
            {schema.blocks.map((block) => {
              if (block.children && block.children.length > 0) {
                return el(
                  BlockGroup,
                  { key: block.id, id: block.id, label: block.label, direction: block.direction },
                  block.children.map((child) =>
                    el(BlockNode, { key: child.id, id: child.id, label: child.label })
                  )
                );
              }

              return el(BlockNode, { key: block.id, id: block.id, label: block.label });
            })}
            {schema.connections.map((connection, index) => (
              <Connection
                key={`connection-${index}`}
                from={connection.from}
                to={connection.to}
                label={connection.label}
                edgeType={connection.edgeType}
                bidirectional={connection.bidirectional}
              />
            ))}
          </BlockDiagram>
        </div>
      );

    case "requirement":
      return (
        <div style={FILL_STYLE}>
          <RequirementDiagram direction={schema.direction} edgeType={schema.edgeType} mode={schema.interactive ? "interactive" : undefined}>
            {schema.requirements.map((requirement) =>
              el(RequirementNode, {
                key: requirement.id,
                id: requirement.id,
                label: requirement.label,
                kind: requirement.kind,
                risk: requirement.risk,
                status: requirement.status,
              })
            )}
            {schema.relationships.map((relationship, index) => (
              <Relationship
                key={`relationship-${index}`}
                from={relationship.from}
                to={relationship.to}
                type={relationship.type}
                edgeType={relationship.edgeType}
                bidirectional={relationship.bidirectional}
              />
            ))}
          </RequirementDiagram>
        </div>
      );

    case "mindmap":
      return (
        <div style={FILL_STYLE}>
          <Mindmap root={schema.root} />
        </div>
      );

    case "gitgraph":
      return (
        <div style={FILL_STYLE}>
          <GitGraph commits={schema.commits} />
        </div>
      );

    case "gantt":
      return (
        <div style={FILL_STYLE}>
          <Gantt title={schema.title}>
            {schema.sections.map((section, index) => (
              <GanttSection key={`section-${index}`} label={section.label}>
                {section.tasks.map((task) => (
                  <GanttTask
                    key={task.id}
                    id={task.id}
                    label={task.label}
                    start={task.start}
                    end={task.end}
                  />
                ))}
              </GanttSection>
            ))}
          </Gantt>
        </div>
      );

    case "sankey":
      return (
        <div style={FILL_STYLE}>
          <SankeyDiagram nodes={schema.nodes} flows={schema.flows} />
        </div>
      );

    case "packet":
      return (
        <div style={FILL_STYLE}>
          <PacketDiagram
            title={schema.title}
            wordSize={schema.wordSize}
            rows={schema.rows}
          />
        </div>
      );
  }
}

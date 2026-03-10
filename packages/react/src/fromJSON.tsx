import React from 'react'
import type { DiagramDefinition } from '@siren/core'
import { Diagram } from './components/Diagram'
import { Node } from './components/Node'
import { Edge } from './components/Edge'
import { Group } from './components/Group'

/**
 * Convert a JSON diagram definition into a React element tree.
 * Useful for rendering LLM-generated diagrams.
 */
export function fromJSON(definition: DiagramDefinition): React.ReactElement {
  const { nodes, edges, groups, layout } = definition

  // Build a map of node IDs to their group
  const nodeToGroup = new Map<string, string>()
  if (groups) {
    for (const group of groups) {
      for (const childId of group.children) {
        nodeToGroup.set(childId, group.id)
      }
    }
  }

  // Nodes not in any group
  const ungroupedNodes = nodes.filter((n) => !nodeToGroup.has(n.id))

  return (
    <Diagram
      layout={layout?.algorithm}
      direction={layout?.direction}
    >
      {/* Render ungrouped nodes */}
      {ungroupedNodes.map((node) => (
        <Node
          key={node.id}
          id={node.id}
          label={node.label}
          shape={node.shape}
          variant={node.variant}
          width={node.width}
          height={node.height}
        />
      ))}

      {/* Render groups with their children */}
      {groups?.map((group) => (
        <Group
          key={group.id}
          id={group.id}
          label={group.label}
          collapsible={group.collapsible}
          defaultCollapsed={group.defaultCollapsed}
        >
          {group.children
            .map((childId) => nodes.find((n) => n.id === childId))
            .filter(Boolean)
            .map((node) => (
              <Node
                key={node!.id}
                id={node!.id}
                label={node!.label}
                shape={node!.shape}
                variant={node!.variant}
                width={node!.width}
                height={node!.height}
              />
            ))}
        </Group>
      ))}

      {/* Render edges */}
      {edges.map((edge) => (
        <Edge
          key={edge.id}
          from={edge.from}
          to={edge.to}
          fromPort={edge.fromPort}
          toPort={edge.toPort}
          label={edge.label}
          type={edge.type}
          animated={edge.animated}
          dashed={edge.dashed}
          bidirectional={edge.bidirectional}
          color={edge.color}
          thickness={edge.thickness}
        />
      ))}
    </Diagram>
  )
}

import { useMemo } from 'react'
import {
  Graph,
  createLayoutEngine,
  type LayoutOptions,
  type LayoutResult,
  type NodeDefinition,
  type EdgeDefinition,
  type GroupDefinition,
} from '@siren/core'

export function useLayout(
  nodes: NodeDefinition[],
  edges: EdgeDefinition[],
  groups: GroupDefinition[],
  options: LayoutOptions
): LayoutResult {
  return useMemo(() => {
    const graph = new Graph()

    for (const node of nodes) {
      graph.addNode(node)
    }
    for (const edge of edges) {
      graph.addEdge(edge)
    }
    for (const group of groups) {
      graph.addGroup(group)
    }

    const engine = createLayoutEngine(options.algorithm)
    return engine.layout(graph, options)
  }, [nodes, edges, groups, options])
}

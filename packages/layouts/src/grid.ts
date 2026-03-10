import type { LayoutEngine } from '@siren/core'
import type { LayoutOptions, LayoutResult, LayoutNode, LayoutEdge, Point } from '@siren/core'
import { Graph } from '@siren/core'

const DEFAULT_NODE_WIDTH = 160
const DEFAULT_NODE_HEIGHT = 48

/**
 * Grid layout: places nodes in a grid pattern.
 * Useful for node galleries, icon grids, or when you want uniform spacing.
 */
export class GridLayout implements LayoutEngine {
  layout(graph: Graph, options: LayoutOptions): LayoutResult {
    const nodes = graph.nodes
    const edges = graph.edges

    if (nodes.length === 0) {
      return { nodes: new Map(), edges: new Map(), groups: new Map(), width: 0, height: 0 }
    }

    const spacing = options.spacing?.node ?? 40
    const cols = Math.ceil(Math.sqrt(nodes.length))

    const layoutNodes = new Map<string, LayoutNode>()
    let maxX = 0, maxY = 0

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]!
      const col = i % cols
      const row = Math.floor(i / cols)
      const w = node.width ?? DEFAULT_NODE_WIDTH
      const h = node.height ?? DEFAULT_NODE_HEIGHT

      const x = col * (w + spacing) + 50
      const y = row * (h + spacing) + 50

      layoutNodes.set(node.id, { id: node.id, x, y, width: w, height: h })
      maxX = Math.max(maxX, x + w)
      maxY = Math.max(maxY, y + h)
    }

    // Route edges
    const layoutEdges = new Map<string, LayoutEdge>()
    for (const edge of edges) {
      const fromNode = layoutNodes.get(edge.from)
      const toNode = layoutNodes.get(edge.to)
      if (!fromNode || !toNode) continue

      const from: Point = { x: fromNode.x + fromNode.width / 2, y: fromNode.y + fromNode.height / 2 }
      const to: Point = { x: toNode.x + toNode.width / 2, y: toNode.y + toNode.height / 2 }

      layoutEdges.set(edge.id, {
        id: edge.id,
        points: [from, to],
        labelPosition: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 },
      })
    }

    return {
      nodes: layoutNodes,
      edges: layoutEdges,
      groups: new Map(),
      width: maxX + 50,
      height: maxY + 50,
    }
  }
}

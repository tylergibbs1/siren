import type { LayoutEngine } from '@siren/core'
import type { LayoutOptions, LayoutResult, LayoutNode, LayoutEdge, Point } from '@siren/core'
import { Graph } from '@siren/core'

const DEFAULT_NODE_WIDTH = 160
const DEFAULT_NODE_HEIGHT = 48

/**
 * Simple force-directed layout using velocity Verlet integration.
 * Nodes repel each other, edges act as springs.
 */
export class ForceLayout implements LayoutEngine {
  layout(graph: Graph, options: LayoutOptions): LayoutResult {
    const nodes = graph.nodes
    const edges = graph.edges

    if (nodes.length === 0) {
      return { nodes: new Map(), edges: new Map(), groups: new Map(), width: 0, height: 0 }
    }

    // Initialize positions randomly in a circle
    const positions = new Map<string, Point>()
    const velocities = new Map<string, Point>()
    const radius = Math.sqrt(nodes.length) * 80

    nodes.forEach((node, i) => {
      if (node.position) {
        positions.set(node.id, { ...node.position })
      } else {
        const angle = (2 * Math.PI * i) / nodes.length
        positions.set(node.id, {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        })
      }
      velocities.set(node.id, { x: 0, y: 0 })
    })

    // Simulation parameters
    const repulsionForce = 5000
    const springLength = options.spacing?.node ?? 120
    const springForce = 0.1
    const damping = 0.85
    const iterations = 300

    // Run simulation
    for (let iter = 0; iter < iterations; iter++) {
      const temperature = 1 - iter / iterations

      // Repulsion between all pairs
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]!.id
          const b = nodes[j]!.id
          const posA = positions.get(a)!
          const posB = positions.get(b)!

          const dx = posB.x - posA.x
          const dy = posB.y - posA.y
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
          const force = (repulsionForce * temperature) / (dist * dist)

          const fx = (dx / dist) * force
          const fy = (dy / dist) * force

          const velA = velocities.get(a)!
          const velB = velocities.get(b)!
          velA.x -= fx
          velA.y -= fy
          velB.x += fx
          velB.y += fy
        }
      }

      // Spring forces along edges
      for (const edge of edges) {
        const posFrom = positions.get(edge.from)
        const posTo = positions.get(edge.to)
        if (!posFrom || !posTo) continue

        const dx = posTo.x - posFrom.x
        const dy = posTo.y - posFrom.y
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
        const displacement = dist - springLength
        const force = springForce * displacement * temperature

        const fx = (dx / dist) * force
        const fy = (dy / dist) * force

        const velFrom = velocities.get(edge.from)!
        const velTo = velocities.get(edge.to)!
        velFrom.x += fx
        velFrom.y += fy
        velTo.x -= fx
        velTo.y -= fy
      }

      // Apply velocities with damping
      for (const node of nodes) {
        if (node.position) continue // Fixed nodes don't move

        const pos = positions.get(node.id)!
        const vel = velocities.get(node.id)!

        vel.x *= damping
        vel.y *= damping

        pos.x += vel.x
        pos.y += vel.y
      }
    }

    // Normalize positions to start from (0, 0)
    let minX = Infinity, minY = Infinity
    for (const pos of positions.values()) {
      minX = Math.min(minX, pos.x)
      minY = Math.min(minY, pos.y)
    }

    const layoutNodes = new Map<string, LayoutNode>()
    let maxX = 0, maxY = 0

    for (const node of nodes) {
      const pos = positions.get(node.id)!
      const w = node.width ?? DEFAULT_NODE_WIDTH
      const h = node.height ?? DEFAULT_NODE_HEIGHT
      const x = pos.x - minX + 50
      const y = pos.y - minY + 50

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
      const mid: Point = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }

      layoutEdges.set(edge.id, {
        id: edge.id,
        points: [from, to],
        labelPosition: mid,
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

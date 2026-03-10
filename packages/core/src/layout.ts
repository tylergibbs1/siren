import type {
  LayoutOptions,
  LayoutResult,
  LayoutNode,
  LayoutEdge,
  LayoutGroup,
  Direction,
  Point,
  NodeDefinition,
  EdgeDefinition,
  GroupDefinition,
} from './types'
import { Graph } from './graph'

const DEFAULT_NODE_WIDTH = 160
const DEFAULT_NODE_HEIGHT = 48
const DEFAULT_NODE_SPACING = 40
const DEFAULT_LAYER_SPACING = 60

export interface LayoutEngine {
  layout(graph: Graph, options: LayoutOptions): LayoutResult
}

/**
 * Basic hierarchical layout engine.
 * Assigns nodes to layers via topological sort,
 * then positions within layers to minimize edge crossings.
 */
export class HierarchicalLayout implements LayoutEngine {
  layout(graph: Graph, options: LayoutOptions): LayoutResult {
    const direction = options.direction ?? 'TB'
    const nodeSpacing = options.spacing?.node ?? DEFAULT_NODE_SPACING
    const layerSpacing = options.spacing?.layer ?? DEFAULT_LAYER_SPACING

    const nodes = graph.nodes
    const edges = graph.edges
    const groups = graph.groups

    if (nodes.length === 0) {
      return { nodes: new Map(), edges: new Map(), groups: new Map(), width: 0, height: 0 }
    }

    // Step 1: Assign layers using longest-path algorithm
    const layers = this.assignLayers(nodes, edges)

    // Step 2: Order nodes within layers to minimize crossings
    const orderedLayers = this.orderWithinLayers(layers, edges)

    // Step 3: Position nodes
    const layoutNodes = this.positionNodes(
      orderedLayers,
      nodes,
      direction,
      nodeSpacing,
      layerSpacing,
      options.constraints
    )

    // Step 4: Route edges
    const layoutEdges = this.routeEdges(edges, layoutNodes)

    // Step 5: Position groups
    const layoutGroups = this.positionGroups(groups, layoutNodes)

    // Calculate bounds
    let maxX = 0
    let maxY = 0
    for (const node of layoutNodes.values()) {
      maxX = Math.max(maxX, node.x + node.width)
      maxY = Math.max(maxY, node.y + node.height)
    }

    return {
      nodes: layoutNodes,
      edges: layoutEdges,
      groups: layoutGroups,
      width: maxX,
      height: maxY,
    }
  }

  private assignLayers(
    nodes: NodeDefinition[],
    edges: EdgeDefinition[]
  ): Map<string, number> {
    const layers = new Map<string, number>()
    const inDegree = new Map<string, number>()
    const adjacency = new Map<string, string[]>()

    // Initialize
    for (const node of nodes) {
      inDegree.set(node.id, 0)
      adjacency.set(node.id, [])
    }
    for (const edge of edges) {
      inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1)
      adjacency.get(edge.from)?.push(edge.to)
    }

    // BFS from roots (nodes with no incoming edges)
    const queue: string[] = []
    for (const node of nodes) {
      if ((inDegree.get(node.id) ?? 0) === 0) {
        queue.push(node.id)
        layers.set(node.id, 0)
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!
      const currentLayer = layers.get(current) ?? 0

      for (const neighbor of adjacency.get(current) ?? []) {
        const existingLayer = layers.get(neighbor)
        const newLayer = currentLayer + 1

        if (existingLayer === undefined || newLayer > existingLayer) {
          layers.set(neighbor, newLayer)
        }

        const remaining = (inDegree.get(neighbor) ?? 1) - 1
        inDegree.set(neighbor, remaining)
        if (remaining === 0) {
          queue.push(neighbor)
        }
      }
    }

    // Handle disconnected nodes (assign to layer 0)
    for (const node of nodes) {
      if (!layers.has(node.id)) {
        layers.set(node.id, 0)
      }
    }

    return layers
  }

  private orderWithinLayers(
    layers: Map<string, number>,
    edges: EdgeDefinition[]
  ): string[][] {
    // Group nodes by layer
    const layerGroups = new Map<number, string[]>()
    for (const [nodeId, layer] of layers) {
      if (!layerGroups.has(layer)) {
        layerGroups.set(layer, [])
      }
      layerGroups.get(layer)!.push(nodeId)
    }

    const maxLayer = Math.max(...layerGroups.keys(), 0)
    const result: string[][] = []

    for (let i = 0; i <= maxLayer; i++) {
      result.push(layerGroups.get(i) ?? [])
    }

    // Barycenter heuristic for crossing minimization
    for (let pass = 0; pass < 4; pass++) {
      for (let i = 1; i < result.length; i++) {
        const prevLayer = result[i - 1]!
        const currentLayer = result[i]!

        const positions = new Map<string, number>()
        prevLayer.forEach((id, idx) => positions.set(id, idx))

        currentLayer.sort((a, b) => {
          const aParents = edges
            .filter((e) => e.to === a && positions.has(e.from))
            .map((e) => positions.get(e.from)!)
          const bParents = edges
            .filter((e) => e.to === b && positions.has(e.from))
            .map((e) => positions.get(e.from)!)

          const aCenter =
            aParents.length > 0
              ? aParents.reduce((s, v) => s + v, 0) / aParents.length
              : 0
          const bCenter =
            bParents.length > 0
              ? bParents.reduce((s, v) => s + v, 0) / bParents.length
              : 0

          return aCenter - bCenter
        })
      }
    }

    return result
  }

  private positionNodes(
    layers: string[][],
    nodes: NodeDefinition[],
    direction: Direction,
    nodeSpacing: number,
    layerSpacing: number,
    constraints?: import('./types').LayoutConstraint[]
  ): Map<string, LayoutNode> {
    const result = new Map<string, LayoutNode>()
    const nodeMap = new Map(nodes.map((n) => [n.id, n]))

    const isVertical = direction === 'TB' || direction === 'BT'
    const isReversed = direction === 'BT' || direction === 'RL'

    for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
      const layer = layers[layerIdx]!
      const actualLayerIdx = isReversed ? layers.length - 1 - layerIdx : layerIdx

      // Calculate total layer width for centering
      let totalSize = 0
      for (const nodeId of layer) {
        const node = nodeMap.get(nodeId)
        const w = node?.width ?? DEFAULT_NODE_WIDTH
        const h = node?.height ?? DEFAULT_NODE_HEIGHT
        totalSize += isVertical ? w : h
      }
      totalSize += (layer.length - 1) * nodeSpacing

      let offset = -totalSize / 2

      for (const nodeId of layer) {
        const node = nodeMap.get(nodeId)
        const w = node?.width ?? DEFAULT_NODE_WIDTH
        const h = node?.height ?? DEFAULT_NODE_HEIGHT

        // Check for fixed position constraint
        const fixedConstraint = constraints?.find(
          (c) => c.type === 'fixed' && c.nodeIds.includes(nodeId)
        )
        if (fixedConstraint?.value && typeof fixedConstraint.value === 'object' && 'x' in fixedConstraint.value) {
          result.set(nodeId, {
            id: nodeId,
            x: (fixedConstraint.value as Point).x,
            y: (fixedConstraint.value as Point).y,
            width: w,
            height: h,
          })
        } else if (node?.position) {
          result.set(nodeId, {
            id: nodeId,
            x: node.position.x,
            y: node.position.y,
            width: w,
            height: h,
          })
        } else {
          const layerPos = actualLayerIdx * (layerSpacing + (isVertical ? h : w))

          result.set(nodeId, {
            id: nodeId,
            x: isVertical ? offset + totalSize / 2 : layerPos,
            y: isVertical ? layerPos : offset + totalSize / 2,
            width: w,
            height: h,
          })
        }

        offset += (isVertical ? w : h) + nodeSpacing
      }
    }

    return result
  }

  private routeEdges(
    edges: EdgeDefinition[],
    layoutNodes: Map<string, LayoutNode>
  ): Map<string, LayoutEdge> {
    const result = new Map<string, LayoutEdge>()

    for (const edge of edges) {
      const fromNode = layoutNodes.get(edge.from)
      const toNode = layoutNodes.get(edge.to)

      if (!fromNode || !toNode) continue

      const fromCenter: Point = {
        x: fromNode.x + fromNode.width / 2,
        y: fromNode.y + fromNode.height / 2,
      }
      const toCenter: Point = {
        x: toNode.x + toNode.width / 2,
        y: toNode.y + toNode.height / 2,
      }

      // Determine connection points based on ports or automatic
      const fromPoint = this.getConnectionPoint(fromNode, edge.fromPort, toCenter)
      const toPoint = this.getConnectionPoint(toNode, edge.toPort, fromCenter)

      // Route based on edge type
      const points = this.computeEdgePath(
        fromPoint,
        toPoint,
        edge.type ?? 'bezier'
      )

      // Label position at midpoint
      const mid = Math.floor(points.length / 2)
      const labelPosition = points[mid]

      result.set(edge.id, {
        id: edge.id,
        points,
        labelPosition,
      })
    }

    return result
  }

  private getConnectionPoint(
    node: LayoutNode,
    port: import('./types').Port | undefined,
    target: Point
  ): Point {
    const cx = node.x + node.width / 2
    const cy = node.y + node.height / 2

    if (port) {
      switch (port) {
        case 'top':
          return { x: cx, y: node.y }
        case 'bottom':
          return { x: cx, y: node.y + node.height }
        case 'left':
          return { x: node.x, y: cy }
        case 'right':
          return { x: node.x + node.width, y: cy }
      }
    }

    // Auto: pick the closest side
    const dx = target.x - cx
    const dy = target.y - cy
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (absDx > absDy) {
      return dx > 0
        ? { x: node.x + node.width, y: cy }
        : { x: node.x, y: cy }
    } else {
      return dy > 0
        ? { x: cx, y: node.y + node.height }
        : { x: cx, y: node.y }
    }
  }

  private computeEdgePath(
    from: Point,
    to: Point,
    type: import('./types').EdgeType
  ): Point[] {
    switch (type) {
      case 'straight':
        return [from, to]

      case 'step': {
        const midY = (from.y + to.y) / 2
        return [
          from,
          { x: from.x, y: midY },
          { x: to.x, y: midY },
          to,
        ]
      }

      case 'smoothstep': {
        const midY = (from.y + to.y) / 2
        const offset = 10
        return [
          from,
          { x: from.x, y: midY - offset },
          { x: from.x, y: midY },
          { x: to.x, y: midY },
          { x: to.x, y: midY + offset },
          to,
        ]
      }

      case 'bezier':
      default: {
        // Generate bezier control points
        const dx = to.x - from.x
        const dy = to.y - from.y
        const controlOffset = Math.max(Math.abs(dy) * 0.5, 30)

        // Determine if primarily vertical or horizontal flow
        if (Math.abs(dy) >= Math.abs(dx)) {
          const cp1: Point = { x: from.x, y: from.y + controlOffset * Math.sign(dy) }
          const cp2: Point = { x: to.x, y: to.y - controlOffset * Math.sign(dy) }
          return [from, cp1, cp2, to]
        } else {
          const cp1: Point = { x: from.x + controlOffset * Math.sign(dx), y: from.y }
          const cp2: Point = { x: to.x - controlOffset * Math.sign(dx), y: to.y }
          return [from, cp1, cp2, to]
        }
      }
    }
  }

  private positionGroups(
    groups: GroupDefinition[],
    layoutNodes: Map<string, LayoutNode>
  ): Map<string, LayoutGroup> {
    const result = new Map<string, LayoutGroup>()
    const padding = 24

    for (const group of groups) {
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity

      for (const childId of group.children) {
        const node = layoutNodes.get(childId)
        if (!node) continue
        minX = Math.min(minX, node.x)
        minY = Math.min(minY, node.y)
        maxX = Math.max(maxX, node.x + node.width)
        maxY = Math.max(maxY, node.y + node.height)
      }

      if (minX === Infinity) continue

      result.set(group.id, {
        id: group.id,
        x: minX - padding,
        y: minY - padding - 24, // extra space for label
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2 + 24,
      })
    }

    return result
  }
}

/** Create a layout engine for the given algorithm */
export function createLayoutEngine(algorithm?: string): LayoutEngine {
  // For now, all algorithms use the hierarchical layout
  // In Phase 3, force-directed and grid layouts will be added
  return new HierarchicalLayout()
}

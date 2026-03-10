import type {
  NodeDefinition,
  EdgeDefinition,
  GroupDefinition,
  DiagramDefinition,
} from './types'

export class Graph {
  private _nodes = new Map<string, NodeDefinition>()
  private _edges = new Map<string, EdgeDefinition>()
  private _groups = new Map<string, GroupDefinition>()

  // ── Nodes ──

  addNode(node: NodeDefinition): this {
    if (this._nodes.has(node.id)) {
      throw new Error(`Node with id "${node.id}" already exists`)
    }
    this._nodes.set(node.id, { ...node })
    return this
  }

  removeNode(id: string): this {
    this._nodes.delete(id)
    // Remove edges connected to this node
    for (const [edgeId, edge] of this._edges) {
      if (edge.from === id || edge.to === id) {
        this._edges.delete(edgeId)
      }
    }
    // Remove from groups
    for (const group of this._groups.values()) {
      group.children = group.children.filter((c) => c !== id)
    }
    return this
  }

  getNode(id: string): NodeDefinition | undefined {
    return this._nodes.get(id)
  }

  get nodes(): NodeDefinition[] {
    return Array.from(this._nodes.values())
  }

  // ── Edges ──

  addEdge(edge: EdgeDefinition): this {
    if (this._edges.has(edge.id)) {
      throw new Error(`Edge with id "${edge.id}" already exists`)
    }
    if (!this._nodes.has(edge.from)) {
      throw new Error(`Source node "${edge.from}" does not exist`)
    }
    if (!this._nodes.has(edge.to)) {
      throw new Error(`Target node "${edge.to}" does not exist`)
    }
    this._edges.set(edge.id, { ...edge })
    return this
  }

  removeEdge(id: string): this {
    this._edges.delete(id)
    return this
  }

  getEdge(id: string): EdgeDefinition | undefined {
    return this._edges.get(id)
  }

  get edges(): EdgeDefinition[] {
    return Array.from(this._edges.values())
  }

  /** Get all edges connected to a node */
  getNodeEdges(nodeId: string): EdgeDefinition[] {
    return this.edges.filter((e) => e.from === nodeId || e.to === nodeId)
  }

  /** Get edges going out from a node */
  getOutEdges(nodeId: string): EdgeDefinition[] {
    return this.edges.filter((e) => e.from === nodeId)
  }

  /** Get edges coming in to a node */
  getInEdges(nodeId: string): EdgeDefinition[] {
    return this.edges.filter((e) => e.to === nodeId)
  }

  // ── Groups ──

  addGroup(group: GroupDefinition): this {
    if (this._groups.has(group.id)) {
      throw new Error(`Group with id "${group.id}" already exists`)
    }
    this._groups.set(group.id, { ...group })
    return this
  }

  removeGroup(id: string): this {
    this._groups.delete(id)
    return this
  }

  getGroup(id: string): GroupDefinition | undefined {
    return this._groups.get(id)
  }

  get groups(): GroupDefinition[] {
    return Array.from(this._groups.values())
  }

  // ── Analysis ──

  /** Find nodes with no connections */
  getDisconnectedNodes(): NodeDefinition[] {
    return this.nodes.filter((node) => this.getNodeEdges(node.id).length === 0)
  }

  /** Get direct neighbors of a node */
  getNeighbors(nodeId: string): NodeDefinition[] {
    const neighborIds = new Set<string>()
    for (const edge of this.getNodeEdges(nodeId)) {
      if (edge.from === nodeId) neighborIds.add(edge.to)
      if (edge.to === nodeId) neighborIds.add(edge.from)
    }
    return Array.from(neighborIds)
      .map((id) => this._nodes.get(id))
      .filter((n): n is NodeDefinition => n !== undefined)
  }

  /** Topological sort (for hierarchical layout) */
  topologicalSort(): string[] {
    const visited = new Set<string>()
    const result: string[] = []

    const visit = (id: string) => {
      if (visited.has(id)) return
      visited.add(id)
      for (const edge of this.getOutEdges(id)) {
        visit(edge.to)
      }
      result.unshift(id)
    }

    for (const node of this.nodes) {
      visit(node.id)
    }

    return result
  }

  // ── Serialization ──

  toJSON(): DiagramDefinition {
    return {
      version: '0.1.0',
      nodes: this.nodes,
      edges: this.edges,
      groups: this.groups.length > 0 ? this.groups : undefined,
    }
  }

  static fromJSON(def: DiagramDefinition): Graph {
    const graph = new Graph()
    for (const node of def.nodes) {
      graph.addNode(node)
    }
    for (const edge of def.edges) {
      graph.addEdge(edge)
    }
    if (def.groups) {
      for (const group of def.groups) {
        graph.addGroup(group)
      }
    }
    return graph
  }

  /** Clone the graph */
  clone(): Graph {
    return Graph.fromJSON(this.toJSON())
  }
}

import { describe, test, expect } from 'bun:test'
import { Graph } from './graph'

describe('Graph', () => {
  test('add and retrieve nodes', () => {
    const g = new Graph()
    g.addNode({ id: 'a', label: 'Node A' })
    g.addNode({ id: 'b', label: 'Node B' })

    expect(g.nodes).toHaveLength(2)
    expect(g.getNode('a')?.label).toBe('Node A')
  })

  test('throws on duplicate node id', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    expect(() => g.addNode({ id: 'a' })).toThrow('already exists')
  })

  test('add and retrieve edges', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    g.addNode({ id: 'b' })
    g.addEdge({ id: 'e1', from: 'a', to: 'b' })

    expect(g.edges).toHaveLength(1)
    expect(g.getEdge('e1')?.from).toBe('a')
  })

  test('throws on edge with missing node', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    expect(() => g.addEdge({ id: 'e1', from: 'a', to: 'missing' })).toThrow('does not exist')
  })

  test('remove node also removes connected edges', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    g.addNode({ id: 'b' })
    g.addNode({ id: 'c' })
    g.addEdge({ id: 'e1', from: 'a', to: 'b' })
    g.addEdge({ id: 'e2', from: 'b', to: 'c' })

    g.removeNode('b')
    expect(g.nodes).toHaveLength(2)
    expect(g.edges).toHaveLength(0)
  })

  test('getNodeEdges returns all connected edges', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    g.addNode({ id: 'b' })
    g.addNode({ id: 'c' })
    g.addEdge({ id: 'e1', from: 'a', to: 'b' })
    g.addEdge({ id: 'e2', from: 'c', to: 'a' })

    expect(g.getNodeEdges('a')).toHaveLength(2)
    expect(g.getOutEdges('a')).toHaveLength(1)
    expect(g.getInEdges('a')).toHaveLength(1)
  })

  test('getNeighbors returns adjacent nodes', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    g.addNode({ id: 'b' })
    g.addNode({ id: 'c' })
    g.addEdge({ id: 'e1', from: 'a', to: 'b' })
    g.addEdge({ id: 'e2', from: 'a', to: 'c' })

    const neighbors = g.getNeighbors('a')
    expect(neighbors).toHaveLength(2)
    expect(neighbors.map((n) => n.id).sort()).toEqual(['b', 'c'])
  })

  test('getDisconnectedNodes', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    g.addNode({ id: 'b' })
    g.addNode({ id: 'lonely' })
    g.addEdge({ id: 'e1', from: 'a', to: 'b' })

    const disconnected = g.getDisconnectedNodes()
    expect(disconnected).toHaveLength(1)
    expect(disconnected[0]?.id).toBe('lonely')
  })

  test('topologicalSort', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    g.addNode({ id: 'b' })
    g.addNode({ id: 'c' })
    g.addEdge({ id: 'e1', from: 'a', to: 'b' })
    g.addEdge({ id: 'e2', from: 'b', to: 'c' })

    const sorted = g.topologicalSort()
    expect(sorted.indexOf('a')).toBeLessThan(sorted.indexOf('b'))
    expect(sorted.indexOf('b')).toBeLessThan(sorted.indexOf('c'))
  })

  test('groups', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    g.addNode({ id: 'b' })
    g.addGroup({ id: 'g1', label: 'Group 1', children: ['a', 'b'] })

    expect(g.groups).toHaveLength(1)
    expect(g.getGroup('g1')?.children).toEqual(['a', 'b'])
  })

  test('JSON serialization round-trip', () => {
    const g = new Graph()
    g.addNode({ id: 'a', label: 'A', shape: 'diamond' })
    g.addNode({ id: 'b', label: 'B', variant: 'success' })
    g.addEdge({ id: 'e1', from: 'a', to: 'b', label: 'connects' })
    g.addGroup({ id: 'g1', children: ['a', 'b'] })

    const json = g.toJSON()
    const g2 = Graph.fromJSON(json)

    expect(g2.nodes).toHaveLength(2)
    expect(g2.edges).toHaveLength(1)
    expect(g2.groups).toHaveLength(1)
    expect(g2.getNode('a')?.shape).toBe('diamond')
    expect(g2.getEdge('e1')?.label).toBe('connects')
  })

  test('clone creates independent copy', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    g.addNode({ id: 'b' })
    g.addEdge({ id: 'e1', from: 'a', to: 'b' })

    const g2 = g.clone()
    g2.removeNode('b')

    expect(g.nodes).toHaveLength(2)
    expect(g2.nodes).toHaveLength(1)
  })
})

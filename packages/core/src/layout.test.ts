import { describe, test, expect } from 'bun:test'
import { Graph } from './graph'
import { HierarchicalLayout } from './layout'
import type { LayoutOptions } from './types'

describe('HierarchicalLayout', () => {
  const layout = new HierarchicalLayout()
  const defaultOptions: LayoutOptions = {
    algorithm: 'dagre',
    direction: 'TB',
  }

  test('empty graph returns empty result', () => {
    const g = new Graph()
    const result = layout.layout(g, defaultOptions)

    expect(result.nodes.size).toBe(0)
    expect(result.edges.size).toBe(0)
    expect(result.width).toBe(0)
    expect(result.height).toBe(0)
  })

  test('single node gets positioned', () => {
    const g = new Graph()
    g.addNode({ id: 'a', label: 'A' })

    const result = layout.layout(g, defaultOptions)
    expect(result.nodes.size).toBe(1)

    const node = result.nodes.get('a')!
    expect(node.width).toBeGreaterThan(0)
    expect(node.height).toBeGreaterThan(0)
  })

  test('connected nodes are laid out in layers', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    g.addNode({ id: 'b' })
    g.addNode({ id: 'c' })
    g.addEdge({ id: 'e1', from: 'a', to: 'b' })
    g.addEdge({ id: 'e2', from: 'b', to: 'c' })

    const result = layout.layout(g, defaultOptions)

    const a = result.nodes.get('a')!
    const b = result.nodes.get('b')!
    const c = result.nodes.get('c')!

    // In TB direction, y should increase: a < b < c
    expect(a.y).toBeLessThan(b.y)
    expect(b.y).toBeLessThan(c.y)
  })

  test('LR direction puts nodes left to right', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    g.addNode({ id: 'b' })
    g.addEdge({ id: 'e1', from: 'a', to: 'b' })

    const result = layout.layout(g, { ...defaultOptions, direction: 'LR' })

    const a = result.nodes.get('a')!
    const b = result.nodes.get('b')!

    expect(a.x).toBeLessThan(b.x)
  })

  test('edges get routed between nodes', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    g.addNode({ id: 'b' })
    g.addEdge({ id: 'e1', from: 'a', to: 'b' })

    const result = layout.layout(g, defaultOptions)

    const edge = result.edges.get('e1')!
    expect(edge.points.length).toBeGreaterThanOrEqual(2)
    expect(edge.labelPosition).toBeDefined()
  })

  test('groups encompass their children', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    g.addNode({ id: 'b' })
    g.addEdge({ id: 'e1', from: 'a', to: 'b' })
    g.addGroup({ id: 'g1', children: ['a', 'b'] })

    const result = layout.layout(g, defaultOptions)

    const group = result.groups.get('g1')!
    const a = result.nodes.get('a')!
    const b = result.nodes.get('b')!

    // Group should encompass both nodes
    expect(group.x).toBeLessThanOrEqual(Math.min(a.x, b.x))
    expect(group.y).toBeLessThanOrEqual(Math.min(a.y, b.y))
    expect(group.x + group.width).toBeGreaterThanOrEqual(Math.max(a.x + a.width, b.x + b.width))
    expect(group.y + group.height).toBeGreaterThanOrEqual(Math.max(a.y + a.height, b.y + b.height))
  })

  test('branching graph positions siblings', () => {
    const g = new Graph()
    g.addNode({ id: 'root' })
    g.addNode({ id: 'left' })
    g.addNode({ id: 'right' })
    g.addEdge({ id: 'e1', from: 'root', to: 'left' })
    g.addEdge({ id: 'e2', from: 'root', to: 'right' })

    const result = layout.layout(g, defaultOptions)

    const root = result.nodes.get('root')!
    const left = result.nodes.get('left')!
    const right = result.nodes.get('right')!

    // Both children should be below root in TB
    expect(left.y).toBeGreaterThan(root.y)
    expect(right.y).toBeGreaterThan(root.y)

    // Siblings should be at the same layer (same y)
    expect(left.y).toBe(right.y)

    // Siblings should be side by side (different x)
    expect(left.x).not.toBe(right.x)
  })

  test('respects manual node positions', () => {
    const g = new Graph()
    g.addNode({ id: 'a', position: { x: 100, y: 200 } })
    g.addNode({ id: 'b' })
    g.addEdge({ id: 'e1', from: 'a', to: 'b' })

    const result = layout.layout(g, defaultOptions)

    const a = result.nodes.get('a')!
    expect(a.x).toBe(100)
    expect(a.y).toBe(200)
  })

  test('layout result has positive dimensions', () => {
    const g = new Graph()
    for (let i = 0; i < 10; i++) {
      g.addNode({ id: `n${i}` })
      if (i > 0) g.addEdge({ id: `e${i}`, from: `n${i - 1}`, to: `n${i}` })
    }

    const result = layout.layout(g, defaultOptions)

    expect(result.width).toBeGreaterThan(0)
    expect(result.height).toBeGreaterThan(0)
    expect(result.nodes.size).toBe(10)
    expect(result.edges.size).toBe(9)
  })
})

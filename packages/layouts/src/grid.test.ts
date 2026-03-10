import { describe, test, expect } from 'bun:test'
import { Graph } from '@siren/core'
import { GridLayout } from './grid'

describe('GridLayout', () => {
  const layout = new GridLayout()
  const opts = { algorithm: 'grid' as const, direction: 'TB' as const }

  test('empty graph', () => {
    const g = new Graph()
    const result = layout.layout(g, opts)
    expect(result.nodes.size).toBe(0)
  })

  test('single node', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })

    const result = layout.layout(g, opts)
    expect(result.nodes.size).toBe(1)
    const node = result.nodes.get('a')!
    expect(node.x).toBeGreaterThanOrEqual(0)
    expect(node.y).toBeGreaterThanOrEqual(0)
  })

  test('arranges nodes in grid', () => {
    const g = new Graph()
    for (let i = 0; i < 9; i++) g.addNode({ id: `n${i}` })

    const result = layout.layout(g, opts)
    expect(result.nodes.size).toBe(9)

    // 9 nodes -> 3x3 grid
    const positions = Array.from(result.nodes.values())
    const uniqueX = new Set(positions.map((n) => n.x))
    const uniqueY = new Set(positions.map((n) => n.y))

    expect(uniqueX.size).toBe(3)
    expect(uniqueY.size).toBe(3)
  })

  test('no overlapping nodes', () => {
    const g = new Graph()
    for (let i = 0; i < 16; i++) g.addNode({ id: `n${i}` })

    const result = layout.layout(g, opts)
    const nodes = Array.from(result.nodes.values())

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]!
        const b = nodes[j]!
        // Check no overlap (rects don't intersect)
        const noOverlap =
          a.x + a.width <= b.x ||
          b.x + b.width <= a.x ||
          a.y + a.height <= b.y ||
          b.y + b.height <= a.y
        expect(noOverlap).toBe(true)
      }
    }
  })

  test('routes edges', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    g.addNode({ id: 'b' })
    g.addEdge({ id: 'e1', from: 'a', to: 'b' })

    const result = layout.layout(g, opts)
    expect(result.edges.size).toBe(1)
    const edge = result.edges.get('e1')!
    expect(edge.points.length).toBeGreaterThanOrEqual(2)
  })
})

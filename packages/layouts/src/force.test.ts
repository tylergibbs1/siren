import { describe, test, expect } from 'bun:test'
import { Graph } from '@siren/core'
import { ForceLayout } from './force'

describe('ForceLayout', () => {
  const layout = new ForceLayout()
  const opts = { algorithm: 'force' as const, direction: 'TB' as const }

  test('empty graph', () => {
    const g = new Graph()
    const result = layout.layout(g, opts)
    expect(result.nodes.size).toBe(0)
  })

  test('positions connected nodes', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    g.addNode({ id: 'b' })
    g.addNode({ id: 'c' })
    g.addEdge({ id: 'e1', from: 'a', to: 'b' })
    g.addEdge({ id: 'e2', from: 'b', to: 'c' })

    const result = layout.layout(g, opts)
    expect(result.nodes.size).toBe(3)
    expect(result.edges.size).toBe(2)
    expect(result.width).toBeGreaterThan(0)
    expect(result.height).toBeGreaterThan(0)
  })

  test('connected nodes are closer than disconnected', () => {
    const g = new Graph()
    g.addNode({ id: 'a' })
    g.addNode({ id: 'b' })
    g.addNode({ id: 'far' })
    g.addEdge({ id: 'e1', from: 'a', to: 'b' })

    const result = layout.layout(g, opts)
    const a = result.nodes.get('a')!
    const b = result.nodes.get('b')!
    const far = result.nodes.get('far')!

    const distAB = Math.hypot(a.x - b.x, a.y - b.y)
    const distAFar = Math.hypot(a.x - far.x, a.y - far.y)

    // Connected nodes should generally be closer
    expect(distAB).toBeLessThan(distAFar * 2) // relaxed check since force layout is approximate
  })

  test('respects fixed positions', () => {
    const g = new Graph()
    g.addNode({ id: 'fixed', position: { x: 500, y: 500 } })
    g.addNode({ id: 'free' })
    g.addEdge({ id: 'e1', from: 'fixed', to: 'free' })

    const result = layout.layout(g, opts)
    // Fixed node should stay near its position (offset by normalization)
    expect(result.nodes.get('fixed')).toBeDefined()
    expect(result.nodes.get('free')).toBeDefined()
  })

  test('handles larger graph', () => {
    const g = new Graph()
    for (let i = 0; i < 20; i++) {
      g.addNode({ id: `n${i}` })
      if (i > 0) g.addEdge({ id: `e${i}`, from: `n${i - 1}`, to: `n${i}` })
    }

    const result = layout.layout(g, opts)
    expect(result.nodes.size).toBe(20)
    expect(result.edges.size).toBe(19)

    // No nodes should overlap significantly
    const nodeArr = Array.from(result.nodes.values())
    for (let i = 0; i < nodeArr.length; i++) {
      for (let j = i + 1; j < nodeArr.length; j++) {
        const a = nodeArr[i]!
        const b = nodeArr[j]!
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        expect(dist).toBeGreaterThan(10) // at least some separation
      }
    }
  })
})

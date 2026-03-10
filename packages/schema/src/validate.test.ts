import { describe, test, expect } from 'bun:test'
import { validate } from './validate'

describe('validate', () => {
  test('valid minimal diagram', () => {
    const result = validate({
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [{ id: 'e1', from: 'a', to: 'b' }],
    })

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.data).toBeDefined()
  })

  test('valid full diagram', () => {
    const result = validate({
      version: '0.1.0',
      nodes: [
        { id: 'a', label: 'Start', shape: 'pill', variant: 'primary' },
        { id: 'b', label: 'End', shape: 'rounded', variant: 'success' },
      ],
      edges: [
        { id: 'e1', from: 'a', to: 'b', type: 'bezier', animated: true, label: 'flow' },
      ],
      layout: { direction: 'TB', algorithm: 'dagre' },
    })

    expect(result.valid).toBe(true)
  })

  test('rejects non-object input', () => {
    const result = validate('not an object')
    expect(result.valid).toBe(false)
    expect(result.errors[0]?.message).toContain('must be an object')
  })

  test('rejects missing nodes', () => {
    const result = validate({ edges: [] })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.path === 'nodes')).toBe(true)
  })

  test('rejects missing edges', () => {
    const result = validate({ nodes: [{ id: 'a' }] })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.path === 'edges')).toBe(true)
  })

  test('rejects node without id', () => {
    const result = validate({
      nodes: [{ label: 'no id' }],
      edges: [],
    })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.path === 'nodes[0].id')).toBe(true)
  })

  test('rejects duplicate node ids', () => {
    const result = validate({
      nodes: [{ id: 'a' }, { id: 'a' }],
      edges: [],
    })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('Duplicate'))).toBe(true)
  })

  test('rejects invalid shape', () => {
    const result = validate({
      nodes: [{ id: 'a', shape: 'star' }],
      edges: [],
    })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('shape'))).toBe(true)
  })

  test('rejects invalid variant', () => {
    const result = validate({
      nodes: [{ id: 'a', variant: 'neon' }],
      edges: [],
    })
    expect(result.valid).toBe(false)
  })

  test('rejects edge referencing nonexistent node', () => {
    const result = validate({
      nodes: [{ id: 'a' }],
      edges: [{ id: 'e1', from: 'a', to: 'missing' }],
    })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('does not exist'))).toBe(true)
  })

  test('rejects invalid edge type', () => {
    const result = validate({
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [{ id: 'e1', from: 'a', to: 'b', type: 'zigzag' }],
    })
    expect(result.valid).toBe(false)
  })

  test('rejects invalid direction', () => {
    const result = validate({
      nodes: [{ id: 'a' }],
      edges: [],
      layout: { direction: 'DIAGONAL' },
    })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.path === 'layout.direction')).toBe(true)
  })

  test('rejects invalid port values', () => {
    const result = validate({
      nodes: [{ id: 'a', ports: ['top', 'middle'] }],
      edges: [],
    })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('port'))).toBe(true)
  })

  test('collects multiple errors', () => {
    const result = validate({
      nodes: [{ id: '' }, { shape: 'invalid' }],
      edges: [{ from: 'x', to: 'y' }],
    })
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(2)
  })
})

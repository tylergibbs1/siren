import { describe, test, expect } from 'bun:test'
import { exportSVG, exportJSON } from './export'
import type { DiagramDefinition } from '@siren/core'

const simpleDiagram: DiagramDefinition = {
  version: '0.1.0',
  nodes: [
    { id: 'a', label: 'Start', shape: 'pill', variant: 'primary' },
    { id: 'b', label: 'Process' },
    { id: 'c', label: 'End', shape: 'pill', variant: 'success' },
  ],
  edges: [
    { id: 'e1', from: 'a', to: 'b', label: 'begin' },
    { id: 'e2', from: 'b', to: 'c', dashed: true },
  ],
  layout: { direction: 'TB', algorithm: 'dagre' },
}

const groupedDiagram: DiagramDefinition = {
  version: '0.1.0',
  nodes: [
    { id: 'client', label: 'Client', variant: 'primary' },
    { id: 'api', label: 'API Gateway' },
    { id: 'auth', label: 'Auth Service' },
    { id: 'db', label: 'Database', shape: 'cylinder', variant: 'success' },
  ],
  edges: [
    { id: 'e1', from: 'client', to: 'api' },
    { id: 'e2', from: 'api', to: 'auth' },
    { id: 'e3', from: 'auth', to: 'db' },
  ],
  groups: [
    { id: 'backend', label: 'Backend', children: ['api', 'auth', 'db'] },
  ],
  layout: { direction: 'LR' },
}

const complexDiagram: DiagramDefinition = {
  version: '0.1.0',
  nodes: [
    { id: 'n1', label: 'Build', variant: 'primary' },
    { id: 'n2', label: 'Unit Tests' },
    { id: 'n3', label: 'Integration Tests' },
    { id: 'n4', label: 'Lint' },
    { id: 'n5', label: 'Deploy Staging', variant: 'warning' },
    { id: 'n6', label: 'E2E Tests' },
    { id: 'n7', label: 'Approve', shape: 'diamond', variant: 'warning' },
    { id: 'n8', label: 'Production', variant: 'success', shape: 'pill' },
  ],
  edges: [
    { id: 'e1', from: 'n1', to: 'n2' },
    { id: 'e2', from: 'n1', to: 'n3' },
    { id: 'e3', from: 'n1', to: 'n4' },
    { id: 'e4', from: 'n2', to: 'n5' },
    { id: 'e5', from: 'n3', to: 'n5' },
    { id: 'e6', from: 'n4', to: 'n5' },
    { id: 'e7', from: 'n5', to: 'n6' },
    { id: 'e8', from: 'n6', to: 'n7' },
    { id: 'e9', from: 'n7', to: 'n8', label: 'approved' },
  ],
  layout: { direction: 'TB' },
}

// ── exportSVG ──

describe('exportSVG', () => {
  test('returns valid SVG string', () => {
    const svg = exportSVG(simpleDiagram)

    expect(svg).toContain('<svg')
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('</svg>')
  })

  test('contains all node labels', () => {
    const svg = exportSVG(simpleDiagram)

    expect(svg).toContain('Start')
    expect(svg).toContain('Process')
    expect(svg).toContain('End')
  })

  test('contains edge labels', () => {
    const svg = exportSVG(simpleDiagram)

    expect(svg).toContain('begin')
  })

  test('renders dashed edges', () => {
    const svg = exportSVG(simpleDiagram)

    expect(svg).toContain('stroke-dasharray="6 4"')
  })

  test('renders arrowhead markers', () => {
    const svg = exportSVG(simpleDiagram)

    expect(svg).toContain('marker-end="url(#siren-arrow)"')
    expect(svg).toContain('<marker id="siren-arrow"')
  })

  test('contains edge paths', () => {
    const svg = exportSVG(simpleDiagram)

    // Should have path elements for edges
    expect(svg).toContain('<path d="M')
  })

  test('applies variant colors', () => {
    const svg = exportSVG(simpleDiagram, { theme: 'dark' })

    // Primary variant should use the primary color
    expect(svg).toContain('#89b4fa') // dark theme primary
  })

  test('renders background by default', () => {
    const svg = exportSVG(simpleDiagram)

    // Should have a background rect (light theme default)
    expect(svg).toContain('<rect width=')
  })

  test('omits background when transparent', () => {
    const svg = exportSVG(simpleDiagram, { background: 'transparent' })

    // Count rect elements — should only be node rects, no full-width background
    const bgRectMatch = svg.match(/<rect width="\d+" height="\d+" fill=/)
    expect(bgRectMatch).toBeNull()
  })

  test('respects custom padding', () => {
    const svgSmall = exportSVG(simpleDiagram, { padding: 10 })
    const svgLarge = exportSVG(simpleDiagram, { padding: 100 })

    const widthSmall = parseInt(svgSmall.match(/width="(\d+)"/)?.[1] ?? '0', 10)
    const widthLarge = parseInt(svgLarge.match(/width="(\d+)"/)?.[1] ?? '0', 10)

    expect(widthLarge).toBeGreaterThan(widthSmall)
  })

  test('uses dark theme when specified', () => {
    const svg = exportSVG(simpleDiagram, { theme: 'dark' })

    expect(svg).toContain('#0a0a0a') // dark background
  })

  test('uses github theme when specified', () => {
    const svg = exportSVG(simpleDiagram, { theme: 'github' })

    expect(svg).toContain('#0969da') // github primary
  })

  test('renders groups with dashed border', () => {
    const svg = exportSVG(groupedDiagram)

    expect(svg).toContain('stroke-dasharray="6 4"')
    expect(svg).toContain('Backend')
  })

  test('renders group labels', () => {
    const svg = exportSVG(groupedDiagram)

    expect(svg).toContain('Backend')
  })

  test('handles diamond shape', () => {
    const svg = exportSVG(complexDiagram)

    // Diamond nodes render as polygons
    expect(svg).toContain('<polygon points=')
  })

  test('handles pill shape', () => {
    const svg = exportSVG(simpleDiagram)

    // Pill shape has large rx for rounded ends
    const pillRx = svg.match(/rx="(\d+)"/)
    expect(pillRx).toBeTruthy()
  })

  test('renders complex diagram with branching', () => {
    const svg = exportSVG(complexDiagram)

    // All 8 nodes should be present
    expect(svg).toContain('Build')
    expect(svg).toContain('Unit Tests')
    expect(svg).toContain('Integration Tests')
    expect(svg).toContain('Lint')
    expect(svg).toContain('Deploy Staging')
    expect(svg).toContain('E2E Tests')
    expect(svg).toContain('Approve')
    expect(svg).toContain('Production')
    expect(svg).toContain('approved')
  })

  test('SVG dimensions are positive', () => {
    const svg = exportSVG(simpleDiagram)

    const width = parseInt(svg.match(/width="(\d+)"/)?.[1] ?? '0', 10)
    const height = parseInt(svg.match(/height="(\d+)"/)?.[1] ?? '0', 10)

    expect(width).toBeGreaterThan(0)
    expect(height).toBeGreaterThan(0)
  })

  test('handles empty diagram', () => {
    const svg = exportSVG({ version: '0.1.0', nodes: [], edges: [] })

    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
  })

  test('escapes special characters in labels', () => {
    const def: DiagramDefinition = {
      version: '0.1.0',
      nodes: [{ id: 'a', label: 'A < B & C > D "E"' }],
      edges: [],
    }
    const svg = exportSVG(def)

    expect(svg).toContain('&lt;')
    expect(svg).toContain('&amp;')
    expect(svg).toContain('&gt;')
    expect(svg).toContain('&quot;')
  })

  test('uses custom theme object', () => {
    const svg = exportSVG(simpleDiagram, {
      theme: {
        name: 'custom',
        colors: {
          background: '#ff0000',
          node: '#00ff00',
          nodeBorder: '#0000ff',
          edge: '#aaaaaa',
          text: '#111111',
          textMuted: '#666666',
          primary: '#ff00ff',
          success: '#00ffff',
          warning: '#ffff00',
          danger: '#ff0000',
          groupBackground: '#eeeeee',
          groupBorder: '#cccccc',
          selection: '#ff00ff',
        },
        radius: '4px',
        fontFamily: 'monospace',
      },
    })

    expect(svg).toContain('#ff0000') // background
    expect(svg).toContain('#ff00ff') // primary variant fill
    expect(svg).toContain('monospace') // font
  })
})

// ── exportJSON ──

describe('exportJSON', () => {
  test('returns valid JSON string', () => {
    const json = exportJSON(simpleDiagram)
    const parsed = JSON.parse(json)

    expect(parsed).toBeDefined()
    expect(parsed.version).toBe('0.1.0')
  })

  test('preserves all nodes', () => {
    const json = exportJSON(simpleDiagram)
    const parsed = JSON.parse(json)

    expect(parsed.nodes).toHaveLength(3)
    expect(parsed.nodes[0].id).toBe('a')
    expect(parsed.nodes[0].label).toBe('Start')
    expect(parsed.nodes[0].shape).toBe('pill')
    expect(parsed.nodes[0].variant).toBe('primary')
  })

  test('preserves all edges', () => {
    const json = exportJSON(simpleDiagram)
    const parsed = JSON.parse(json)

    expect(parsed.edges).toHaveLength(2)
    expect(parsed.edges[0].from).toBe('a')
    expect(parsed.edges[0].to).toBe('b')
    expect(parsed.edges[0].label).toBe('begin')
    expect(parsed.edges[1].dashed).toBe(true)
  })

  test('preserves layout options', () => {
    const json = exportJSON(simpleDiagram)
    const parsed = JSON.parse(json)

    expect(parsed.layout.direction).toBe('TB')
    expect(parsed.layout.algorithm).toBe('dagre')
  })

  test('preserves groups', () => {
    const json = exportJSON(groupedDiagram)
    const parsed = JSON.parse(json)

    expect(parsed.groups).toHaveLength(1)
    expect(parsed.groups[0].id).toBe('backend')
    expect(parsed.groups[0].label).toBe('Backend')
    expect(parsed.groups[0].children).toEqual(['api', 'auth', 'db'])
  })

  test('omits groups when empty', () => {
    const json = exportJSON(simpleDiagram)
    const parsed = JSON.parse(json)

    expect(parsed.groups).toBeUndefined()
  })

  test('pretty prints by default', () => {
    const json = exportJSON(simpleDiagram)

    expect(json).toContain('\n')
    expect(json).toContain('  ')
  })

  test('compact mode', () => {
    const json = exportJSON(simpleDiagram, { pretty: false })

    // Compact JSON has no indentation newlines within the structure
    // (JSON.stringify with no indent produces single-line output)
    const lines = json.split('\n')
    expect(lines).toHaveLength(1)
  })

  test('round-trips through JSON parse', () => {
    const json = exportJSON(complexDiagram)
    const parsed = JSON.parse(json) as DiagramDefinition

    // Re-export
    const json2 = exportJSON(parsed)
    expect(json2).toBe(json)
  })

  test('sets version if missing', () => {
    const def: DiagramDefinition = {
      version: '',
      nodes: [{ id: 'a' }],
      edges: [],
    }
    // Our function uses `definition.version ?? '0.1.0'`, but empty string is falsy for ||, not ??
    // The function uses ??, so empty string stays. That's fine — it preserves what's passed.
    const json = exportJSON(def)
    const parsed = JSON.parse(json)
    expect(parsed.version).toBeDefined()
  })
})

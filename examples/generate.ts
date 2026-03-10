import { Graph, HierarchicalLayout, type LayoutResult, type LayoutNode, type LayoutEdge } from '../packages/core/src/index'
import { dark, light } from '../packages/themes/src/index'
import { ForceLayout } from '../packages/layouts/src/force'
import { GridLayout } from '../packages/layouts/src/grid'

// ── Sample 1: Deployment Pipeline (TB) ──

const pipeline = new Graph()
pipeline.addNode({ id: 'code', label: 'Push Code' })
pipeline.addNode({ id: 'build', label: 'Build' })
pipeline.addNode({ id: 'unit', label: 'Unit Tests' })
pipeline.addNode({ id: 'integration', label: 'Integration Tests' })
pipeline.addNode({ id: 'lint', label: 'Lint & Format' })
pipeline.addNode({ id: 'staging', label: 'Deploy Staging' })
pipeline.addNode({ id: 'e2e', label: 'E2E Tests' })
pipeline.addNode({ id: 'approval', label: 'Manual Approval' })
pipeline.addNode({ id: 'prod', label: 'Deploy Production' })

pipeline.addEdge({ id: 'e1', from: 'code', to: 'build' })
pipeline.addEdge({ id: 'e2', from: 'build', to: 'unit' })
pipeline.addEdge({ id: 'e3', from: 'build', to: 'integration' })
pipeline.addEdge({ id: 'e4', from: 'build', to: 'lint' })
pipeline.addEdge({ id: 'e5', from: 'unit', to: 'staging' })
pipeline.addEdge({ id: 'e6', from: 'integration', to: 'staging' })
pipeline.addEdge({ id: 'e7', from: 'lint', to: 'staging' })
pipeline.addEdge({ id: 'e8', from: 'staging', to: 'e2e' })
pipeline.addEdge({ id: 'e9', from: 'e2e', to: 'approval' })
pipeline.addEdge({ id: 'e10', from: 'approval', to: 'prod' })

// ── Sample 2: Microservices Architecture (LR) ──

const microservices = new Graph()
microservices.addNode({ id: 'client', label: 'Web Client' })
microservices.addNode({ id: 'mobile', label: 'Mobile App' })
microservices.addNode({ id: 'gateway', label: 'API Gateway' })
microservices.addNode({ id: 'auth', label: 'Auth Service' })
microservices.addNode({ id: 'users', label: 'User Service' })
microservices.addNode({ id: 'orders', label: 'Order Service' })
microservices.addNode({ id: 'payments', label: 'Payment Service' })
microservices.addNode({ id: 'notifications', label: 'Notification Service' })
microservices.addNode({ id: 'postgres', label: 'PostgreSQL' })
microservices.addNode({ id: 'redis', label: 'Redis Cache' })
microservices.addNode({ id: 'queue', label: 'Message Queue' })

microservices.addEdge({ id: 'm1', from: 'client', to: 'gateway' })
microservices.addEdge({ id: 'm2', from: 'mobile', to: 'gateway' })
microservices.addEdge({ id: 'm3', from: 'gateway', to: 'auth' })
microservices.addEdge({ id: 'm4', from: 'gateway', to: 'users' })
microservices.addEdge({ id: 'm5', from: 'gateway', to: 'orders' })
microservices.addEdge({ id: 'm6', from: 'orders', to: 'payments' })
microservices.addEdge({ id: 'm7', from: 'orders', to: 'queue' })
microservices.addEdge({ id: 'm8', from: 'queue', to: 'notifications' })
microservices.addEdge({ id: 'm9', from: 'users', to: 'postgres' })
microservices.addEdge({ id: 'm10', from: 'orders', to: 'postgres' })
microservices.addEdge({ id: 'm11', from: 'auth', to: 'redis' })
microservices.addEdge({ id: 'm12', from: 'payments', to: 'postgres' })

microservices.addGroup({ id: 'frontend', label: 'Frontend', children: ['client', 'mobile'] })
microservices.addGroup({ id: 'services', label: 'Services', children: ['auth', 'users', 'orders', 'payments', 'notifications'] })
microservices.addGroup({ id: 'data', label: 'Data Layer', children: ['postgres', 'redis', 'queue'] })

// ── Sample 3: Decision Tree (TB) ──

const decision = new Graph()
decision.addNode({ id: 'start', label: 'New Feature Request' })
decision.addNode({ id: 'size', label: 'Is it a big change?' })
decision.addNode({ id: 'rfc', label: 'Write RFC' })
decision.addNode({ id: 'review_rfc', label: 'Team Review' })
decision.addNode({ id: 'approved', label: 'Approved?' })
decision.addNode({ id: 'branch', label: 'Create Branch' })
decision.addNode({ id: 'implement', label: 'Implement' })
decision.addNode({ id: 'pr', label: 'Open PR' })
decision.addNode({ id: 'review', label: 'Code Review' })
decision.addNode({ id: 'merge', label: 'Merge to Main' })
decision.addNode({ id: 'revise', label: 'Revise RFC' })
decision.addNode({ id: 'declined', label: 'Declined' })

decision.addEdge({ id: 'd1', from: 'start', to: 'size' })
decision.addEdge({ id: 'd2', from: 'size', to: 'rfc', label: 'Yes' })
decision.addEdge({ id: 'd3', from: 'size', to: 'branch', label: 'No' })
decision.addEdge({ id: 'd4', from: 'rfc', to: 'review_rfc' })
decision.addEdge({ id: 'd5', from: 'review_rfc', to: 'approved' })
decision.addEdge({ id: 'd6', from: 'approved', to: 'branch', label: 'Yes' })
decision.addEdge({ id: 'd7', from: 'approved', to: 'revise', label: 'Needs Work' })
decision.addEdge({ id: 'd8', from: 'approved', to: 'declined', label: 'No' })
decision.addEdge({ id: 'd9', from: 'revise', to: 'review_rfc' })
decision.addEdge({ id: 'd10', from: 'branch', to: 'implement' })
decision.addEdge({ id: 'd11', from: 'implement', to: 'pr' })
decision.addEdge({ id: 'd12', from: 'pr', to: 'review' })
decision.addEdge({ id: 'd13', from: 'review', to: 'merge' })

// ── Sample 4: Force-directed network ──

const network = new Graph()
const networkNodes = ['API', 'Auth', 'Users', 'Products', 'Cart', 'Search', 'Analytics', 'Logging', 'CDN', 'DB']
for (const name of networkNodes) {
  network.addNode({ id: name.toLowerCase(), label: name })
}
const networkEdges: [string, string][] = [
  ['api', 'auth'], ['api', 'users'], ['api', 'products'], ['api', 'cart'],
  ['api', 'search'], ['users', 'db'], ['products', 'db'], ['cart', 'db'],
  ['search', 'products'], ['api', 'analytics'], ['api', 'logging'],
  ['analytics', 'db'], ['products', 'cdn'], ['auth', 'db'],
]
networkEdges.forEach(([from, to], i) => {
  network.addEdge({ id: `ne${i}`, from, to })
})

// ── Run layouts ──

const hierarchical = new HierarchicalLayout()
const force = new ForceLayout()

const pipelineResult = hierarchical.layout(pipeline, { algorithm: 'dagre', direction: 'TB', spacing: { node: 40, layer: 70 } })
const microResult = hierarchical.layout(microservices, { algorithm: 'dagre', direction: 'LR', spacing: { node: 50, layer: 80 } })
const decisionResult = hierarchical.layout(decision, { algorithm: 'dagre', direction: 'TB', spacing: { node: 35, layer: 65 } })
const networkResult = force.layout(network, { algorithm: 'force', direction: 'TB', spacing: { node: 150 } })

// ── Node variant/shape assignments ──

interface NodeMeta { variant?: string; shape?: string }

const pipelineMeta: Record<string, NodeMeta> = {
  code: { variant: 'primary', shape: 'pill' },
  build: { variant: 'default' },
  unit: { variant: 'default' },
  integration: { variant: 'default' },
  lint: { variant: 'default' },
  staging: { variant: 'warning' },
  e2e: { variant: 'default' },
  approval: { variant: 'warning', shape: 'diamond' },
  prod: { variant: 'success', shape: 'pill' },
}

const microMeta: Record<string, NodeMeta> = {
  client: { variant: 'primary' },
  mobile: { variant: 'primary' },
  gateway: { variant: 'warning' },
  auth: { variant: 'default' },
  users: { variant: 'default' },
  orders: { variant: 'default' },
  payments: { variant: 'default' },
  notifications: { variant: 'default' },
  postgres: { variant: 'success', shape: 'cylinder' },
  redis: { variant: 'danger' },
  queue: { variant: 'ghost' },
}

const decisionMeta: Record<string, NodeMeta> = {
  start: { variant: 'primary', shape: 'pill' },
  size: { variant: 'warning', shape: 'diamond' },
  approved: { variant: 'warning', shape: 'diamond' },
  merge: { variant: 'success', shape: 'pill' },
  declined: { variant: 'danger', shape: 'pill' },
  revise: { variant: 'ghost' },
}

// ── Render to HTML ──

function edgePathD(edge: LayoutEdge): string {
  const pts = edge.points
  if (pts.length === 4) {
    return `M ${pts[0]!.x} ${pts[0]!.y} C ${pts[1]!.x} ${pts[1]!.y}, ${pts[2]!.x} ${pts[2]!.y}, ${pts[3]!.x} ${pts[3]!.y}`
  }
  if (pts.length < 2) return ''
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i]!.x} ${pts[i]!.y}`
  return d
}

const variantColors: Record<string, { bg: string; border: string; text: string }> = {
  default: { bg: dark.colors.node, border: dark.colors.nodeBorder, text: dark.colors.text },
  primary: { bg: dark.colors.primary, border: dark.colors.primary, text: '#fff' },
  success: { bg: dark.colors.success, border: dark.colors.success, text: '#1a1a2e' },
  warning: { bg: dark.colors.warning, border: dark.colors.warning, text: '#1a1a2e' },
  danger: { bg: dark.colors.danger, border: dark.colors.danger, text: '#fff' },
  ghost: { bg: 'transparent', border: dark.colors.nodeBorder, text: dark.colors.text },
}

const shapeRadius: Record<string, string> = {
  rounded: '8px',
  pill: '9999px',
  diamond: '4px',
  rectangle: '0px',
  cylinder: '8px',
}

function renderDiagram(
  title: string,
  subtitle: string,
  graph: Graph,
  result: LayoutResult,
  meta: Record<string, NodeMeta>,
  extraPadding = 100
): string {
  const nodes = graph.nodes
  const edges = graph.edges
  const groups = graph.groups
  const w = result.width + extraPadding
  const h = result.height + extraPadding

  let html = `<div class="diagram-section"><h2>${title}</h2><p class="subtitle">${subtitle}</p>`
  html += `<div class="diagram-container" style="width:${w}px;height:${h}px;">`

  // Groups
  for (const group of groups) {
    const lg = result.groups.get(group.id)
    if (!lg) continue
    html += `<div class="group" style="left:${lg.x}px;top:${lg.y}px;width:${lg.width}px;height:${lg.height}px;">
      <span class="group-label">${group.label ?? ''}</span></div>`
  }

  // SVG edges
  const markerId = `arrow-${title.replace(/\s/g, '')}`
  html += `<svg style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;">
    <defs><marker id="${markerId}" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
      <polygon points="0 0, 10 3.5, 0 7" fill="${dark.colors.edge}"/></marker></defs>`

  for (const edge of edges) {
    const le = result.edges.get(edge.id)
    if (!le) continue
    const d = edgePathD(le)
    const dashed = edge.dashed ? 'stroke-dasharray="6 4"' : ''
    const strokeColor = edge.color ?? dark.colors.edge
    html += `<path d="${d}" fill="none" stroke="${strokeColor}" stroke-width="1.5" ${dashed} marker-end="url(#${markerId})"/>`

    if (edge.label && le.labelPosition) {
      html += `<foreignObject x="${le.labelPosition.x - 40}" y="${le.labelPosition.y - 10}" width="80" height="20" style="overflow:visible;">
        <div class="edge-label">${edge.label}</div></foreignObject>`
    }
  }
  html += `</svg>`

  // Nodes
  for (const node of nodes) {
    const ln = result.nodes.get(node.id)
    if (!ln) continue
    const m = meta[node.id] ?? {}
    const v = variantColors[m.variant ?? 'default']!
    const r = shapeRadius[m.shape ?? 'rounded'] ?? '8px'
    const transform = m.shape === 'diamond' ? 'transform:rotate(45deg);' : ''
    const innerTransform = m.shape === 'diamond' ? 'transform:rotate(-45deg);' : ''

    html += `<div class="node" style="left:${ln.x}px;top:${ln.y}px;width:${ln.width}px;height:${ln.height}px;background:${v.bg};border-color:${v.border};color:${v.text};border-radius:${r};${transform}">
      <span style="${innerTransform}display:inline-block;">${node.label ?? node.id}</span></div>`
  }

  html += `</div></div>`
  return html
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Siren - Sample Diagrams</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: ${dark.colors.background};
    color: ${dark.colors.text};
    padding: 40px 20px;
  }

  .header {
    text-align: center;
    margin-bottom: 60px;
  }

  .header h1 {
    font-size: 48px;
    font-weight: 700;
    background: linear-gradient(135deg, ${dark.colors.primary}, ${dark.colors.success});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
  }

  .header p {
    color: ${dark.colors.textMuted};
    font-size: 18px;
  }

  .diagram-section {
    max-width: 1200px;
    margin: 0 auto 80px auto;
  }

  .diagram-section h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .subtitle {
    color: ${dark.colors.textMuted};
    font-size: 14px;
    margin-bottom: 24px;
  }

  .diagram-container {
    position: relative;
    background: ${dark.colors.groupBackground};
    border: 1px solid ${dark.colors.groupBorder};
    border-radius: 12px;
    overflow: auto;
    padding: 20px;
  }

  .node {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border: 1.5px solid;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    transition: box-shadow 0.15s ease;
    cursor: default;
    user-select: none;
    z-index: 1;
  }

  .node:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.5);
  }

  .group {
    position: absolute;
    border: 1.5px dashed ${dark.colors.groupBorder};
    border-radius: 12px;
    background: rgba(30, 30, 46, 0.3);
  }

  .group-label {
    position: absolute;
    top: 6px;
    left: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${dark.colors.textMuted};
  }

  .edge-label {
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${dark.colors.groupBackground};
    color: ${dark.colors.textMuted};
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 4px;
    white-space: nowrap;
    width: fit-content;
    margin: 0 auto;
  }

  .footer {
    text-align: center;
    color: ${dark.colors.textMuted};
    font-size: 13px;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid ${dark.colors.groupBorder};
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .footer a { color: ${dark.colors.primary}; text-decoration: none; }
  .footer a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class="header">
  <h1>Siren</h1>
  <p>Sample diagrams rendered by the Siren layout engine</p>
</div>

${renderDiagram(
  'CI/CD Pipeline',
  'Hierarchical layout (TB) &mdash; 9 nodes, 10 edges, auto-positioned with crossing minimization',
  pipeline, pipelineResult, pipelineMeta, 140
)}

${renderDiagram(
  'Microservices Architecture',
  'Hierarchical layout (LR) &mdash; 11 nodes, 12 edges, 3 groups',
  microservices, microResult, microMeta, 160
)}

${renderDiagram(
  'Feature Request Decision Tree',
  'Hierarchical layout (TB) &mdash; 12 nodes with branching and loops',
  decision, decisionResult, decisionMeta, 140
)}

${renderDiagram(
  'Service Network',
  'Force-directed layout &mdash; 10 nodes, 14 edges, physics simulation',
  network, networkResult, {}, 120
)}

<div class="footer">
  <p>Generated by <a href="https://github.com/tylergibbs1/siren">@siren/core</a> layout engine</p>
  <p style="margin-top:4px;">Layout computed in &lt;5ms per diagram</p>
</div>
</body>
</html>`

console.log(html)

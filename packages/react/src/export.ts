import {
  Graph,
  createLayoutEngine,
  type DiagramDefinition,
  type NodeDefinition,
  type EdgeDefinition,
  type GroupDefinition,
  type LayoutResult,
  type LayoutNode,
  type LayoutEdge,
  type LayoutGroup,
  type LayoutOptions,
  type Theme,
  type NodeVariant,
  type NodeShape,
  type Point,
} from '@siren/core'
import { light } from '@siren/themes'
import { resolveTheme, type ThemeName } from '@siren/themes'

// ── Types ──

export interface ExportOptions {
  /** Scale factor for PNG export (default: 2 for retina) */
  scale?: number
  /** Background color. Use 'transparent' for no background. */
  background?: string | 'transparent'
  /** Theme name or object (default: light) */
  theme?: ThemeName | Theme
  /** Padding around the diagram in pixels (default: 40) */
  padding?: number
}

export interface ExportPNGOptions extends ExportOptions {
  /** Image format (default: 'png') */
  format?: 'png' | 'jpeg' | 'webp'
  /** JPEG/WebP quality 0-1 (default: 0.92) */
  quality?: number
}

// ── SVG Rendering (headless, no DOM required for string output) ──

const VARIANT_FILLS: Record<NodeVariant, (theme: Theme) => { bg: string; border: string; text: string }> = {
  default: (t) => ({ bg: t.colors.node, border: t.colors.nodeBorder, text: t.colors.text }),
  primary: (t) => ({ bg: t.colors.primary, border: t.colors.primary, text: '#ffffff' }),
  success: (t) => ({ bg: t.colors.success, border: t.colors.success, text: '#1a1a2e' }),
  warning: (t) => ({ bg: t.colors.warning, border: t.colors.warning, text: '#1a1a2e' }),
  danger: (t) => ({ bg: t.colors.danger, border: t.colors.danger, text: '#ffffff' }),
  ghost: (t) => ({ bg: 'none', border: t.colors.nodeBorder, text: t.colors.text }),
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function shapeAttrs(shape: NodeShape, x: number, y: number, w: number, h: number): string {
  switch (shape) {
    case 'circle': {
      const r = Math.min(w, h) / 2
      const cx = x + w / 2
      const cy = y + h / 2
      return `<circle cx="${cx}" cy="${cy}" r="${r}"`
    }
    case 'diamond': {
      const cx = x + w / 2
      const cy = y + h / 2
      const points = `${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`
      return `<polygon points="${points}"`
    }
    case 'hexagon': {
      const cx = x + w / 2
      const q = w / 4
      const points = `${x + q},${y} ${x + w - q},${y} ${x + w},${y + h / 2} ${x + w - q},${y + h} ${x + q},${y + h} ${x},${y + h / 2}`
      return `<polygon points="${points}"`
    }
    case 'pill':
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"`
    case 'rounded':
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"`
    case 'cylinder': {
      // Approximate cylinder as rounded rect with extra rx
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"`
    }
    case 'parallelogram': {
      const skew = Math.min(w * 0.15, 12)
      const points = `${x + skew},${y} ${x + w},${y} ${x + w - skew},${y + h} ${x},${y + h}`
      return `<polygon points="${points}"`
    }
    case 'trapezoid': {
      const inset = Math.min(w * 0.1, 10)
      const points = `${x + inset},${y} ${x + w - inset},${y} ${x + w},${y + h} ${x},${y + h}`
      return `<polygon points="${points}"`
    }
    case 'rectangle':
    default:
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}"`
  }
}

function edgePathD(points: Point[]): string {
  if (points.length < 2) return ''
  if (points.length === 4) {
    return `M ${points[0]!.x} ${points[0]!.y} C ${points[1]!.x} ${points[1]!.y}, ${points[2]!.x} ${points[2]!.y}, ${points[3]!.x} ${points[3]!.y}`
  }
  let d = `M ${points[0]!.x} ${points[0]!.y}`
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i]!.x} ${points[i]!.y}`
  }
  return d
}

function renderSVGString(
  definition: DiagramDefinition,
  layout: LayoutResult,
  theme: Theme,
  options: ExportOptions
): string {
  const padding = options.padding ?? 40
  const background = options.background ?? theme.colors.background
  const width = layout.width + padding * 2
  const height = layout.height + padding * 2

  const nodeMap = new Map(definition.nodes.map((n) => [n.id, n]))
  const edgeMap = new Map(definition.edges.map((e) => [e.id, e]))

  const parts: string[] = []

  // SVG header
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
  )

  // Defs
  parts.push(`<defs>`)
  parts.push(`<marker id="siren-arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">`)
  parts.push(`<polygon points="0 0, 10 3.5, 0 7" fill="${theme.colors.edge}"/>`)
  parts.push(`</marker>`)
  // Font
  parts.push(`<style>text { font-family: ${theme.fontFamily}; }</style>`)
  parts.push(`</defs>`)

  // Background
  if (background !== 'transparent') {
    parts.push(`<rect width="${width}" height="${height}" fill="${background}"/>`)
  }

  // Offset group for padding
  parts.push(`<g transform="translate(${padding}, ${padding})">`)

  // Groups (render first, behind everything)
  for (const group of definition.groups ?? []) {
    const lg = layout.groups.get(group.id)
    if (!lg) continue
    parts.push(
      `<rect x="${lg.x}" y="${lg.y}" width="${lg.width}" height="${lg.height}" rx="12" fill="${theme.colors.groupBackground}" stroke="${theme.colors.groupBorder}" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.6"/>`
    )
    if (group.label) {
      parts.push(
        `<text x="${lg.x + 12}" y="${lg.y + 16}" font-size="11" font-weight="600" fill="${theme.colors.textMuted}" text-transform="uppercase" letter-spacing="0.08em">${escapeXml(group.label)}</text>`
      )
    }
  }

  // Edges
  for (const edge of definition.edges) {
    const le = layout.edges.get(edge.id)
    if (!le) continue

    const d = edgePathD(le.points)
    if (!d) continue

    const strokeColor = edge.color ?? theme.colors.edge
    const strokeWidth = edge.thickness ?? (theme.edgeWidth ?? 1.5)
    const dashArray = edge.dashed ? ' stroke-dasharray="6 4"' : ''
    const markerEnd = ` marker-end="url(#siren-arrow)"`
    const markerStart = edge.bidirectional ? ` marker-start="url(#siren-arrow)"` : ''

    parts.push(
      `<path d="${d}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"${dashArray}${markerEnd}${markerStart}/>`
    )

    // Edge label
    if (edge.label && le.labelPosition) {
      const lx = le.labelPosition.x
      const ly = le.labelPosition.y
      parts.push(
        `<rect x="${lx - 30}" y="${ly - 10}" width="60" height="20" rx="4" fill="${theme.colors.background}"/>`
      )
      parts.push(
        `<text x="${lx}" y="${ly + 4}" text-anchor="middle" font-size="11" fill="${theme.colors.textMuted}">${escapeXml(edge.label)}</text>`
      )
    }
  }

  // Nodes
  for (const node of definition.nodes) {
    const ln = layout.nodes.get(node.id)
    if (!ln) continue

    const variant = node.variant ?? 'default'
    const shape = node.shape ?? 'rounded'
    const colors = VARIANT_FILLS[variant](theme)

    // Shape
    const shapeStr = shapeAttrs(shape, ln.x, ln.y, ln.width, ln.height)
    parts.push(
      `${shapeStr} fill="${colors.bg}" stroke="${colors.border}" stroke-width="1.5"/>`
    )

    // Label
    if (node.label) {
      const cx = ln.x + ln.width / 2
      const cy = ln.y + ln.height / 2
      parts.push(
        `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="${theme.fontSize ?? '13'}" font-weight="500" fill="${colors.text}">${escapeXml(node.label)}</text>`
      )
    }
  }

  parts.push(`</g>`)
  parts.push(`</svg>`)

  return parts.join('\n')
}

// ── Layout helper ──

function computeLayout(definition: DiagramDefinition): LayoutResult {
  const graph = new Graph()
  for (const node of definition.nodes) graph.addNode(node)
  for (const edge of definition.edges) graph.addEdge(edge)
  if (definition.groups) {
    for (const group of definition.groups) graph.addGroup(group)
  }

  const engine = createLayoutEngine(definition.layout?.algorithm)
  return engine.layout(graph, {
    algorithm: definition.layout?.algorithm ?? 'dagre',
    direction: definition.layout?.direction ?? 'TB',
    spacing: definition.layout?.spacing,
  })
}

// ── Public API ──

/**
 * Export a diagram definition as a clean SVG string.
 * Runs layout and renders to SVG entirely in memory — no DOM needed.
 */
export function exportSVG(
  definition: DiagramDefinition,
  options: ExportOptions = {}
): string {
  const theme = options.theme ? resolveTheme(options.theme) : light
  const layout = computeLayout(definition)
  return renderSVGString(definition, layout, theme, options)
}

/**
 * Export a diagram definition as a PNG Blob.
 * Renders SVG to canvas, then converts to PNG.
 * Requires a browser environment (uses Canvas API).
 */
export async function exportPNG(
  definition: DiagramDefinition,
  options: ExportPNGOptions = {}
): Promise<Blob> {
  const scale = options.scale ?? 2
  const format = options.format ?? 'png'
  const quality = options.quality ?? 0.92

  const svgString = exportSVG(definition, options)

  // Parse dimensions from SVG
  const widthMatch = svgString.match(/width="(\d+)"/)
  const heightMatch = svgString.match(/height="(\d+)"/)
  const width = parseInt(widthMatch?.[1] ?? '800', 10)
  const height = parseInt(heightMatch?.[1] ?? '600', 10)

  // Create canvas
  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas 2d context')
  ctx.scale(scale, scale)

  // Render SVG to canvas via Image
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  try {
    const img = await loadImage(url)
    ctx.drawImage(img, 0, 0)
  } finally {
    URL.revokeObjectURL(url)
  }

  // Convert canvas to blob
  return new Promise<Blob>((resolve, reject) => {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png'
    canvas.toBlob(
      (result) => {
        if (result) resolve(result)
        else reject(new Error('Canvas toBlob returned null'))
      },
      mimeType,
      quality
    )
  })
}

/**
 * Export a diagram definition as a JSON string.
 * The output is re-importable via fromJSON().
 */
export function exportJSON(
  definition: DiagramDefinition,
  options?: { pretty?: boolean }
): string {
  const output: DiagramDefinition = {
    version: definition.version ?? '0.1.0',
    nodes: definition.nodes,
    edges: definition.edges,
    ...(definition.groups?.length ? { groups: definition.groups } : {}),
    ...(definition.layout ? { layout: definition.layout } : {}),
    ...(definition.theme ? { theme: definition.theme } : {}),
  }
  return JSON.stringify(output, null, options?.pretty !== false ? 2 : undefined)
}

/**
 * Download a blob as a file in the browser.
 * Convenience helper for exportPNG/exportSVG results.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Download an SVG string as a .svg file.
 */
export function downloadSVG(svgString: string, filename = 'diagram.svg'): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  downloadBlob(blob, filename)
}

/**
 * Download a JSON string as a .json file.
 */
export function downloadJSON(jsonString: string, filename = 'diagram.json'): void {
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' })
  downloadBlob(blob, filename)
}

/**
 * Copy an SVG string to clipboard.
 */
export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}

// ── Internal ──

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`))
    img.src = src
  })
}

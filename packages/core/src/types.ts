// ── Node Types ──

export type NodeShape =
  | 'rectangle'
  | 'rounded'
  | 'diamond'
  | 'circle'
  | 'hexagon'
  | 'pill'
  | 'cylinder'
  | 'parallelogram'
  | 'trapezoid'

export type NodeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'ghost'

export type Port = 'top' | 'right' | 'bottom' | 'left'

export interface NodeDefinition {
  id: string
  label?: string
  shape?: NodeShape
  variant?: NodeVariant
  ports?: Port[]
  width?: number
  height?: number
  /** Fixed position (overrides layout) */
  position?: Point
  /** Metadata for custom data */
  data?: Record<string, unknown>
}

// ── Edge Types ──

export type EdgeType = 'bezier' | 'straight' | 'step' | 'smoothstep'

export type ArrowType = 'arrow' | 'diamond' | 'circle' | 'none'

export interface EdgeDefinition {
  id: string
  from: string
  to: string
  fromPort?: Port
  toPort?: Port
  label?: string
  type?: EdgeType
  animated?: boolean
  dashed?: boolean
  bidirectional?: boolean
  color?: string
  thickness?: number
  data?: Record<string, unknown>
}

// ── Group Types ──

export interface GroupDefinition {
  id: string
  label?: string
  children: string[]
  collapsible?: boolean
  defaultCollapsed?: boolean
  data?: Record<string, unknown>
}

// ── Layout Types ──

export type LayoutAlgorithm = 'dagre' | 'elk' | 'force' | 'manual' | 'grid'

export type Direction = 'TB' | 'BT' | 'LR' | 'RL'

export interface LayoutOptions {
  algorithm: LayoutAlgorithm
  direction: Direction
  spacing?: { node?: number; layer?: number; group?: number }
  /** Fixed constraints: node IDs pinned to positions */
  constraints?: LayoutConstraint[]
}

export interface LayoutConstraint {
  type: 'fixed' | 'align-horizontal' | 'align-vertical' | 'relative'
  nodeIds: string[]
  value?: Point | number
}

// ── Geometry ──

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

// ── Layout Result ──

export interface LayoutNode {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface LayoutEdge {
  id: string
  points: Point[]
  labelPosition?: Point
}

export interface LayoutGroup {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface LayoutResult {
  nodes: Map<string, LayoutNode>
  edges: Map<string, LayoutEdge>
  groups: Map<string, LayoutGroup>
  width: number
  height: number
}

// ── Theme Types ──

export interface ThemeColors {
  background: string
  node: string
  nodeBorder: string
  edge: string
  text: string
  textMuted: string
  primary: string
  success: string
  warning: string
  danger: string
  groupBackground: string
  groupBorder: string
  selection: string
}

export interface Theme {
  name: string
  colors: ThemeColors
  radius: string
  fontFamily: string
  fontSize?: string
  edgeWidth?: number
}

// ── Diagram Definition (for JSON serialization) ──

export interface DiagramDefinition {
  version: string
  nodes: NodeDefinition[]
  edges: EdgeDefinition[]
  groups?: GroupDefinition[]
  layout?: Partial<LayoutOptions>
  theme?: string
}

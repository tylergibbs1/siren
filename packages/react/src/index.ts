// Components
export {
  Diagram,
  type DiagramProps,
  Node,
  type NodeProps,
  Edge,
  type EdgeProps,
  Group,
  type GroupProps,
  SirenProvider,
  type SirenProviderProps,
} from './components'

// Context
export { useDiagramContext } from './context/DiagramContext'

// Hooks
export { useLayout } from './hooks/useLayout'
export { useZoomPan } from './hooks/useZoomPan'

// Re-export core types for convenience
export type {
  NodeShape,
  NodeVariant,
  Port,
  Direction,
  LayoutAlgorithm,
  EdgeType,
  Theme,
  DiagramDefinition,
} from '@siren/core'

// Re-export schema utilities
export { validate, type ValidationResult } from '@siren/schema'

// Re-export themes
export { themes, type ThemeName } from '@siren/themes'

// fromJSON: convert a DiagramDefinition to React elements
export { fromJSON } from './fromJSON'

// Export utilities
export {
  exportSVG,
  exportPNG,
  exportJSON,
  downloadBlob,
  downloadSVG,
  downloadJSON,
  copyToClipboard,
  type ExportOptions,
  type ExportPNGOptions,
} from './export'

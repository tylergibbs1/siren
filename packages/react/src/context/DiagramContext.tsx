import { createContext, useContext } from 'react'
import type { Theme, LayoutResult, Direction, LayoutAlgorithm } from '@siren/core'

export interface DiagramState {
  /** Current layout result */
  layout: LayoutResult | null
  /** Theme */
  theme: Theme
  /** Layout direction */
  direction: Direction
  /** Layout algorithm */
  algorithm: LayoutAlgorithm
  /** Zoom level */
  zoom: number
  /** Pan offset */
  pan: { x: number; y: number }
  /** Selected node/edge IDs */
  selected: Set<string>
  /** Collapsed group IDs */
  collapsed: Set<string>
}

export interface DiagramActions {
  select(id: string, multi?: boolean): void
  deselect(id: string): void
  clearSelection(): void
  toggleCollapse(groupId: string): void
  setZoom(zoom: number): void
  setPan(x: number, y: number): void
}

export interface DiagramContextValue {
  state: DiagramState
  actions: DiagramActions
  /** Register a node for layout */
  registerNode(id: string, element: HTMLElement | null): void
  /** Register an edge */
  registerEdge(id: string): void
}

const DiagramContext = createContext<DiagramContextValue | null>(null)

export function useDiagramContext(): DiagramContextValue {
  const ctx = useContext(DiagramContext)
  if (!ctx) {
    throw new Error('Siren components must be used within a <Diagram> component')
  }
  return ctx
}

export { DiagramContext }

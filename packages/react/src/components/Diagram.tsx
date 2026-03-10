import React, {
  useRef,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from 'react'
import type {
  Direction,
  LayoutAlgorithm,
  Theme,
  NodeDefinition,
  EdgeDefinition,
  GroupDefinition,
  LayoutOptions,
} from '@siren/core'
import { light } from '@siren/themes'
import { themeToCSSVars } from '@siren/themes'
import { DiagramContext, type DiagramState, type DiagramContextValue } from '../context/DiagramContext'
import { useLayout } from '../hooks/useLayout'
import { useZoomPan } from '../hooks/useZoomPan'

export interface DiagramProps {
  /** Layout algorithm */
  layout?: LayoutAlgorithm
  /** Flow direction */
  direction?: Direction
  /** Spacing between nodes and layers */
  spacing?: number | { node?: number; layer?: number }
  /** Zoom config */
  zoom?: boolean | { min?: number; max?: number; controls?: boolean }
  /** Show minimap */
  minimap?: boolean
  /** Theme */
  theme?: Theme
  /** Node click handler */
  onNodeClick?: (id: string) => void
  /** Edge click handler */
  onEdgeClick?: (id: string) => void
  /** CSS class */
  className?: string
  /** Inline style */
  style?: CSSProperties
  children: ReactNode
}

interface CollectedElements {
  nodes: NodeDefinition[]
  edges: EdgeDefinition[]
  groups: GroupDefinition[]
}

/**
 * Collect node, edge, and group definitions from children.
 * This traverses the React element tree to extract declarative definitions.
 */
function collectElements(children: ReactNode): CollectedElements {
  const nodes: NodeDefinition[] = []
  const edges: EdgeDefinition[] = []
  const groups: GroupDefinition[] = []

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return

    const props = child.props as Record<string, unknown>
    const typeName =
      typeof child.type === 'string'
        ? child.type
        : (child.type as { displayName?: string })?.displayName ?? ''

    if (typeName === 'SirenNode') {
      nodes.push({
        id: props.id as string,
        label: props.label as string | undefined,
        shape: props.shape as NodeDefinition['shape'],
        variant: props.variant as NodeDefinition['variant'],
        width: props.width as number | undefined,
        height: props.height as number | undefined,
      })
    } else if (typeName === 'SirenEdge') {
      edges.push({
        id: `${props.from}-${props.to}`,
        from: props.from as string,
        to: props.to as string,
        fromPort: props.fromPort as EdgeDefinition['fromPort'],
        toPort: props.toPort as EdgeDefinition['toPort'],
        label: props.label as string | undefined,
        type: props.type as EdgeDefinition['type'],
        animated: props.animated as boolean | undefined,
        dashed: props.dashed as boolean | undefined,
        bidirectional: props.bidirectional as boolean | undefined,
        color: props.color as string | undefined,
        thickness: props.thickness as number | undefined,
      })
    } else if (typeName === 'SirenGroup') {
      // Recursively collect children of the group
      const groupChildren: string[] = []
      React.Children.forEach(props.children as ReactNode, (groupChild) => {
        if (React.isValidElement(groupChild)) {
          const gProps = groupChild.props as Record<string, unknown>
          const gTypeName =
            typeof groupChild.type === 'string'
              ? groupChild.type
              : (groupChild.type as { displayName?: string })?.displayName ?? ''
          if (gTypeName === 'SirenNode' && typeof gProps.id === 'string') {
            groupChildren.push(gProps.id)
            nodes.push({
              id: gProps.id,
              label: gProps.label as string | undefined,
              shape: gProps.shape as NodeDefinition['shape'],
              variant: gProps.variant as NodeDefinition['variant'],
              width: gProps.width as number | undefined,
              height: gProps.height as number | undefined,
            })
          }
        }
      })
      groups.push({
        id: props.id as string,
        label: props.label as string | undefined,
        children: groupChildren,
        collapsible: props.collapsible as boolean | undefined,
        defaultCollapsed: props.defaultCollapsed as boolean | undefined,
      })
    }
  })

  return { nodes, edges, groups }
}

export function Diagram({
  layout: algorithm = 'dagre',
  direction = 'TB',
  spacing,
  zoom: zoomConfig = true,
  minimap = false,
  theme = light,
  onNodeClick,
  onEdgeClick,
  className = '',
  style,
  children,
}: DiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const nodeRefs = useRef(new Map<string, HTMLElement>())

  // Parse zoom config
  const zoomOpts =
    typeof zoomConfig === 'object'
      ? zoomConfig
      : zoomConfig
        ? { min: 0.1, max: 4, controls: true }
        : { min: 1, max: 1, controls: false }

  const zoomPan = useZoomPan(containerRef, {
    minZoom: zoomOpts.min,
    maxZoom: zoomOpts.max,
  })

  // Collect diagram elements from JSX children
  const { nodes, edges, groups } = useMemo(() => collectElements(children), [children])

  // Compute layout
  const spacingObj =
    typeof spacing === 'number'
      ? { node: spacing, layer: spacing }
      : spacing ?? {}

  const layoutOptions: LayoutOptions = useMemo(
    () => ({
      algorithm,
      direction,
      spacing: spacingObj,
    }),
    [algorithm, direction, spacingObj.node, spacingObj.layer]
  )

  const layoutResult = useLayout(nodes, edges, groups, layoutOptions)

  // Actions
  const actions = useMemo(
    () => ({
      select: (id: string, multi?: boolean) => {
        setSelected((prev) => {
          const next = multi ? new Set(prev) : new Set<string>()
          next.add(id)
          return next
        })
      },
      deselect: (id: string) => {
        setSelected((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      },
      clearSelection: () => setSelected(new Set()),
      toggleCollapse: (groupId: string) => {
        setCollapsed((prev) => {
          const next = new Set(prev)
          if (next.has(groupId)) next.delete(groupId)
          else next.add(groupId)
          return next
        })
      },
      setZoom: zoomPan.setZoom,
      setPan: zoomPan.setPan,
    }),
    [zoomPan.setZoom, zoomPan.setPan]
  )

  const contextValue: DiagramContextValue = useMemo(
    () => ({
      state: {
        layout: layoutResult,
        theme,
        direction,
        algorithm,
        zoom: zoomPan.zoom,
        pan: zoomPan.pan,
        selected,
        collapsed,
      },
      actions,
      registerNode: (id: string, el: HTMLElement | null) => {
        if (el) nodeRefs.current.set(id, el)
        else nodeRefs.current.delete(id)
      },
      registerEdge: () => {},
    }),
    [layoutResult, theme, direction, algorithm, zoomPan.zoom, zoomPan.pan, selected, collapsed, actions]
  )

  const cssVars = themeToCSSVars(theme)

  // Calculate canvas size from layout
  const canvasWidth = layoutResult.width + 200
  const canvasHeight = layoutResult.height + 200

  return (
    <DiagramContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={`siren-diagram ${className}`}
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--siren-bg)',
          fontFamily: 'var(--siren-font)',
          fontSize: 'var(--siren-font-size)',
          color: 'var(--siren-text)',
          ...cssVars as unknown as CSSProperties,
          ...style,
        }}
        onClick={(e) => {
          // Click on background clears selection
          if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('siren-canvas')) {
            actions.clearSelection()
          }
        }}
        role="img"
        aria-label="Diagram"
      >
        <div
          className="siren-canvas"
          style={{
            transform: zoomPan.transform,
            transformOrigin: '0 0',
            position: 'relative',
            width: canvasWidth,
            height: canvasHeight,
          }}
        >
          {/* SVG layer for edges */}
          <svg
            className="siren-edges-layer"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            <defs>
              <marker
                id="siren-arrowhead"
                viewBox="0 0 10 7"
                refX="10"
                refY="3.5"
                markerWidth="10"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="var(--siren-edge)"
                />
              </marker>
            </defs>
            {children}
          </svg>

          {/* DOM layer for nodes */}
          <div
            className="siren-nodes-layer"
            style={{ position: 'relative', zIndex: 1 }}
          >
            {children}
          </div>
        </div>

        {/* Zoom controls */}
        {zoomOpts.controls && (
          <div
            className="siren-controls"
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              zIndex: 10,
            }}
          >
            <button
              onClick={zoomPan.zoomIn}
              style={controlButtonStyle}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              onClick={zoomPan.zoomOut}
              style={controlButtonStyle}
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              onClick={zoomPan.resetView}
              style={controlButtonStyle}
              aria-label="Reset view"
            >
              ⌂
            </button>
          </div>
        )}
      </div>
    </DiagramContext.Provider>
  )
}

const controlButtonStyle: CSSProperties = {
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--siren-node-border)',
  borderRadius: 'var(--siren-radius)',
  background: 'var(--siren-node-bg)',
  color: 'var(--siren-text)',
  cursor: 'pointer',
  fontSize: 16,
  lineHeight: 1,
}

Diagram.displayName = 'SirenDiagram'

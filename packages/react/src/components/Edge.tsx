import React, { useCallback, useMemo, type CSSProperties } from 'react'
import type { EdgeType, Port } from '@siren/core'
import { useDiagramContext } from '../context/DiagramContext'

export interface EdgeProps {
  from: string
  to: string
  fromPort?: Port
  toPort?: Port
  label?: string | React.ReactNode
  type?: EdgeType
  animated?: boolean
  dashed?: boolean
  color?: string
  thickness?: number
  bidirectional?: boolean
  className?: string
  onClick?: () => void
}

function pointsToPath(points: { x: number; y: number }[], type: EdgeType): string {
  if (points.length < 2) return ''

  if (type === 'straight') {
    return `M ${points[0]!.x} ${points[0]!.y} L ${points[points.length - 1]!.x} ${points[points.length - 1]!.y}`
  }

  if (type === 'step' || type === 'smoothstep') {
    let d = `M ${points[0]!.x} ${points[0]!.y}`
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i]!.x} ${points[i]!.y}`
    }
    return d
  }

  // Bezier: use cubic bezier with control points
  if (points.length === 4) {
    return `M ${points[0]!.x} ${points[0]!.y} C ${points[1]!.x} ${points[1]!.y}, ${points[2]!.x} ${points[2]!.y}, ${points[3]!.x} ${points[3]!.y}`
  }

  // Fallback: polyline
  let d = `M ${points[0]!.x} ${points[0]!.y}`
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i]!.x} ${points[i]!.y}`
  }
  return d
}

export function Edge({
  from,
  to,
  label,
  type = 'bezier',
  animated = false,
  dashed = false,
  color,
  thickness,
  bidirectional = false,
  className = '',
  onClick,
}: EdgeProps) {
  const { state } = useDiagramContext()
  const edgeId = `${from}-${to}`
  const layoutEdge = state.layout?.edges.get(edgeId)

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onClick?.()
    },
    [onClick]
  )

  const pathD = useMemo(() => {
    if (!layoutEdge?.points.length) return ''
    return pointsToPath(layoutEdge.points, type)
  }, [layoutEdge, type])

  if (!pathD) return null

  const strokeColor = color ?? 'var(--siren-edge)'
  const strokeWidth = thickness ?? parseFloat(String(state.theme.edgeWidth ?? 1.5))

  return (
    <g
      className={`siren-edge ${className}`}
      onClick={handleClick}
      style={{ cursor: onClick ? 'pointer' : 'default' } as CSSProperties}
      data-edge-id={edgeId}
    >
      {/* Invisible wider path for easier clicking */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={strokeWidth + 10}
        style={{ pointerEvents: 'stroke' }}
      />

      {/* Visible edge */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? '6 4' : undefined}
        markerEnd="url(#siren-arrowhead)"
        markerStart={bidirectional ? 'url(#siren-arrowhead)' : undefined}
        style={{ pointerEvents: 'none' }}
      >
        {animated && (
          <animate
            attributeName="stroke-dashoffset"
            from="24"
            to="0"
            dur="1s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Animated dots overlay */}
      {animated && !dashed && (
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray="4 16"
          style={{ pointerEvents: 'none' }}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="20"
            to="0"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </path>
      )}

      {/* Label */}
      {label && layoutEdge?.labelPosition && (
        <foreignObject
          x={layoutEdge.labelPosition.x - 50}
          y={layoutEdge.labelPosition.y - 12}
          width={100}
          height={24}
          style={{ pointerEvents: 'none', overflow: 'visible' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--siren-bg)',
              color: 'var(--siren-text-muted)',
              fontSize: 12,
              padding: '2px 8px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
              width: 'fit-content',
              margin: '0 auto',
            }}
          >
            {label}
          </div>
        </foreignObject>
      )}
    </g>
  )
}

Edge.displayName = 'SirenEdge'

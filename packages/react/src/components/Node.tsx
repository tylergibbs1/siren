import React, { useCallback, useRef, useEffect, type ReactNode, type CSSProperties } from 'react'
import type { NodeShape, NodeVariant, Port } from '@siren/core'
import { useDiagramContext } from '../context/DiagramContext'

export interface NodeProps {
  id: string
  label?: string | ReactNode
  variant?: NodeVariant
  shape?: NodeShape
  icon?: ReactNode
  badge?: string | number
  ports?: Port[]
  width?: number
  height?: number
  draggable?: boolean
  selectable?: boolean
  className?: string
  style?: CSSProperties
  onClick?: () => void
  children?: ReactNode
}

const shapeStyles: Record<NodeShape, CSSProperties> = {
  rectangle: { borderRadius: '0px' },
  rounded: { borderRadius: 'var(--siren-radius)' },
  diamond: { borderRadius: '0px', transform: 'rotate(45deg)', padding: 24 },
  circle: { borderRadius: '50%', aspectRatio: '1' },
  hexagon: { borderRadius: 'var(--siren-radius)', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' },
  pill: { borderRadius: '9999px' },
  cylinder: { borderRadius: 'var(--siren-radius)' },
  parallelogram: { borderRadius: '0px', transform: 'skewX(-10deg)' },
  trapezoid: { borderRadius: '0px', clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)' },
}

const variantColors: Record<NodeVariant, { bg: string; border: string }> = {
  default: { bg: 'var(--siren-node-bg)', border: 'var(--siren-node-border)' },
  primary: { bg: 'var(--siren-primary)', border: 'var(--siren-primary)' },
  success: { bg: 'var(--siren-success)', border: 'var(--siren-success)' },
  warning: { bg: 'var(--siren-warning)', border: 'var(--siren-warning)' },
  danger: { bg: 'var(--siren-danger)', border: 'var(--siren-danger)' },
  ghost: { bg: 'transparent', border: 'var(--siren-node-border)' },
}

export function Node({
  id,
  label,
  variant = 'default',
  shape = 'rounded',
  icon,
  badge,
  width,
  height,
  draggable: _draggable,
  selectable = true,
  className = '',
  style,
  onClick,
  children,
}: NodeProps) {
  const { state, actions, registerNode } = useDiagramContext()
  const ref = useRef<HTMLDivElement>(null)
  const layoutNode = state.layout?.nodes.get(id)
  const isSelected = state.selected.has(id)

  useEffect(() => {
    registerNode(id, ref.current)
    return () => registerNode(id, null)
  }, [id, registerNode])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (selectable) {
        actions.select(id, e.shiftKey)
      }
      onClick?.()
    },
    [id, selectable, actions, onClick]
  )

  const colors = variantColors[variant]
  const shapeStyle = shapeStyles[shape]
  const isColoredVariant = variant !== 'default' && variant !== 'ghost'

  const nodeStyle: CSSProperties = {
    position: 'absolute',
    left: layoutNode?.x ?? 0,
    top: layoutNode?.y ?? 0,
    width: width ?? layoutNode?.width ?? 'auto',
    height: height ?? layoutNode?.height ?? 'auto',
    minWidth: 80,
    minHeight: 36,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '8px 16px',
    background: colors.bg,
    border: `1.5px solid ${colors.border}`,
    color: isColoredVariant ? '#fff' : 'var(--siren-text)',
    cursor: selectable ? 'pointer' : 'default',
    userSelect: 'none',
    transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
    boxShadow: isSelected
      ? `0 0 0 2px var(--siren-selection)`
      : '0 1px 3px rgba(0,0,0,0.08)',
    ...shapeStyle,
    ...style,
  }

  return (
    <div
      ref={ref}
      className={`siren-node siren-node-${shape} siren-node-${variant} ${className}`}
      style={nodeStyle}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={typeof label === 'string' ? label : id}
      aria-selected={isSelected}
      data-node-id={id}
    >
      {badge !== undefined && (
        <span
          className="siren-node-badge"
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            minWidth: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 9999,
            background: 'var(--siren-primary)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            padding: '0 5px',
          }}
        >
          {badge}
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <span className="siren-node-icon">{icon}</span>}
        {label && (
          <span className="siren-node-label" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
            {label}
          </span>
        )}
      </div>

      {children && (
        <div className="siren-node-body" style={{ width: '100%' }}>
          {children}
        </div>
      )}
    </div>
  )
}

Node.displayName = 'SirenNode'

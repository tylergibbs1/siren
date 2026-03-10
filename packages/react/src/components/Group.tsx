import React, { useCallback, type ReactNode, type CSSProperties } from 'react'
import { useDiagramContext } from '../context/DiagramContext'

export interface GroupProps {
  id: string
  label?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export function Group({
  id,
  label,
  collapsible = false,
  className = '',
  style,
  children,
}: GroupProps) {
  const { state, actions } = useDiagramContext()
  const layoutGroup = state.layout?.groups.get(id)
  const isCollapsed = state.collapsed.has(id)

  const handleToggle = useCallback(() => {
    if (collapsible) {
      actions.toggleCollapse(id)
    }
  }, [id, collapsible, actions])

  if (!layoutGroup) return null

  return (
    <div
      className={`siren-group ${className}`}
      style={{
        position: 'absolute',
        left: layoutGroup.x,
        top: layoutGroup.y,
        width: layoutGroup.width,
        height: isCollapsed ? 48 : layoutGroup.height,
        background: 'var(--siren-group-bg)',
        border: '1.5px dashed var(--siren-group-border)',
        borderRadius: 'var(--siren-radius)',
        overflow: isCollapsed ? 'hidden' : 'visible',
        transition: 'height 0.2s ease',
        ...style,
      }}
      data-group-id={id}
    >
      {label && (
        <div
          className="siren-group-label"
          style={{
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--siren-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: collapsible ? 'pointer' : 'default',
            userSelect: 'none',
          }}
          onClick={handleToggle}
        >
          {collapsible && (
            <span
              style={{
                display: 'inline-block',
                transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease',
                fontSize: 10,
              }}
            >
              ▼
            </span>
          )}
          {label}
        </div>
      )}

      {!isCollapsed && children}
    </div>
  )
}

Group.displayName = 'SirenGroup'

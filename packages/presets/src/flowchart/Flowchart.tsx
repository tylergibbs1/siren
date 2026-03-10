import React, { type ReactNode, type CSSProperties } from 'react'
import { Diagram, Node, type DiagramProps } from '@siren/react'
import type { Direction } from '@siren/core'

export interface FlowchartProps {
  direction?: Direction
  spacing?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export function Flowchart({
  direction = 'TB',
  spacing = 24,
  className,
  style,
  children,
}: FlowchartProps) {
  return (
    <Diagram
      layout="dagre"
      direction={direction}
      spacing={spacing}
      className={className}
      style={style}
    >
      {children}
    </Diagram>
  )
}

// Sub-components for flowchart-specific nodes

export interface StepProps {
  id: string
  label: string
  icon?: ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  className?: string
}

export function Step({ id, label, icon, variant = 'default', className }: StepProps) {
  return <Node id={id} label={label} icon={icon} variant={variant} shape="rounded" className={className} />
}

Step.displayName = 'SirenNode'

export interface DecisionProps {
  id: string
  label: string
  className?: string
}

export function Decision({ id, label, className }: DecisionProps) {
  return <Node id={id} label={label} shape="diamond" className={className} />
}

Decision.displayName = 'SirenNode'

export interface TerminatorProps {
  id: string
  label: string
  variant?: 'default' | 'success' | 'danger'
  className?: string
}

export function Terminator({ id, label, variant = 'default', className }: TerminatorProps) {
  return <Node id={id} label={label} shape="pill" variant={variant} className={className} />
}

Terminator.displayName = 'SirenNode'

export interface ProcessProps {
  id: string
  label: string
  icon?: ReactNode
  className?: string
}

export function Process({ id, label, icon, className }: ProcessProps) {
  return <Node id={id} label={label} icon={icon} shape="rectangle" className={className} />
}

Process.displayName = 'SirenNode'

Flowchart.Step = Step
Flowchart.Decision = Decision
Flowchart.Terminator = Terminator
Flowchart.Process = Process

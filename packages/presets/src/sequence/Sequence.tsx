import React, { type ReactNode, type CSSProperties } from 'react'
import { Diagram, Node, Edge } from '@siren/react'

export interface SequenceProps {
  className?: string
  style?: CSSProperties
  children: ReactNode
}

/**
 * Sequence diagram preset.
 * Uses left-to-right layout with specialized actors and messages.
 */
export function Sequence({ className, style, children }: SequenceProps) {
  return (
    <Diagram
      layout="dagre"
      direction="LR"
      spacing={{ node: 60, layer: 80 }}
      className={className}
      style={style}
    >
      {children}
    </Diagram>
  )
}

// Sub-components

export interface ActorProps {
  id: string
  label: string
  icon?: ReactNode
  className?: string
}

export function Actor({ id, label, icon, className }: ActorProps) {
  return (
    <Node
      id={id}
      label={label}
      icon={icon}
      shape="rectangle"
      variant="primary"
      className={className}
      style={{
        minWidth: 100,
        borderRadius: 4,
      }}
    />
  )
}

Actor.displayName = 'SirenNode'

export interface ParticipantProps {
  id: string
  label: string
  icon?: ReactNode
  className?: string
}

export function Participant({ id, label, icon, className }: ParticipantProps) {
  return (
    <Node
      id={id}
      label={label}
      icon={icon}
      shape="rounded"
      className={className}
      style={{ minWidth: 100 }}
    />
  )
}

Participant.displayName = 'SirenNode'

export interface MessageProps {
  from: string
  to: string
  label: string
  dashed?: boolean
  className?: string
}

export function Message({ from, to, label, dashed = false, className }: MessageProps) {
  return (
    <Edge
      from={from}
      to={to}
      label={label}
      type="straight"
      dashed={dashed}
      className={className}
    />
  )
}

Message.displayName = 'SirenEdge'

Sequence.Actor = Actor
Sequence.Participant = Participant
Sequence.Message = Message

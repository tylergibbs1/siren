"use client";

/**
 * Transition is a declarative component for describing state transitions.
 * It's not rendered directly — it's collected by the StateDiagram parent
 * and converted to React Flow edge objects.
 */
export function Transition(_props: {
  from: string;
  to: string;
  label?: string;
  guard?: string;
  edgeType?: string;
  bidirectional?: boolean;
}) {
  return null;
}

Transition.displayName = "Transition";

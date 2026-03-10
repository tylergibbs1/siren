"use client";

/**
 * ArchConnection is a declarative component for describing connections.
 * It's not rendered directly — it's collected by the ArchitectureDiagram parent
 * and converted to React Flow edge objects.
 */
export function ArchConnection(_props: {
  from: string;
  to: string;
  label?: string;
}) {
  return null;
}

ArchConnection.displayName = "ArchConnection";

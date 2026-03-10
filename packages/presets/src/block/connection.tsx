"use client";

/**
 * Connection is a declarative component for describing block connections.
 * It's not rendered directly — it's collected by the BlockDiagram parent
 * and converted to React Flow edge objects.
 */
export function Connection(_props: {
  from: string;
  to: string;
  label?: string;
}) {
  return null;
}

Connection.displayName = "Connection";

"use client";

/**
 * C4Relationship is a declarative component for describing relationships.
 * It's not rendered directly — it's collected by the C4Diagram parent
 * and converted to React Flow edge objects.
 */
export function C4Relationship(_props: {
  from: string;
  to: string;
  label?: string;
}) {
  return null;
}

C4Relationship.displayName = "C4Relationship";

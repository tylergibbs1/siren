"use client";

/**
 * ERRelationship is a declarative component for describing entity relationships.
 * It's not rendered directly — it's collected by the ERDiagram parent
 * and converted to React Flow edge objects.
 */
export type ERCardinality = "1:1" | "1:N" | "N:1" | "M:N";

export function ERRelationship(_props: {
  from: string;
  to: string;
  cardinality?: ERCardinality;
  label?: string;
}) {
  return null;
}

ERRelationship.displayName = "ERRelationship";

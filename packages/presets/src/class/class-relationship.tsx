"use client";

/**
 * ClassRelationship is a declarative component for describing class relationships.
 * It's not rendered directly — it's collected by the ClassDiagram parent
 * and converted to React Flow edge objects.
 */
export type ClassRelationshipType =
  | "inheritance"
  | "composition"
  | "aggregation"
  | "association"
  | "dependency"
  | "realization";

export function ClassRelationship(_props: {
  from: string;
  to: string;
  type?: ClassRelationshipType;
  label?: string;
  edgeType?: string;
  bidirectional?: boolean;
}) {
  return null;
}

ClassRelationship.displayName = "ClassRelationship";

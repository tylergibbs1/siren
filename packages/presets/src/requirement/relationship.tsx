"use client";

export type RelationshipType =
  | "derives"
  | "satisfies"
  | "verifies"
  | "refines"
  | "traces"
  | "contains";

/**
 * Relationship is a declarative component for describing requirement relationships.
 * It's not rendered directly — it's collected by the RequirementDiagram parent
 * and converted to React Flow edge objects.
 */
export function Relationship(_props: {
  from: string;
  to: string;
  type: RelationshipType;
}) {
  return null;
}

Relationship.displayName = "Relationship";

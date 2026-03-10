"use client";

/**
 * Message is a declarative component for describing sequence messages.
 * It's not rendered directly — it's collected by the Sequence parent
 * and converted to React Flow edge objects.
 */
export function Message(_props: {
  from: string;
  to: string;
  label?: string;
  reply?: boolean;
}) {
  return null;
}

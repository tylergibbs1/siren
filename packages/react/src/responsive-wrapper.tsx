"use client";

import React from "react";

export interface ResponsiveDiagramProps {
  children: React.ReactNode;
  /** Maximum width in pixels. The diagram will not stretch beyond this. */
  maxWidth?: number;
  /** Width-to-height ratio. Defaults to 16/9. */
  aspectRatio?: number;
  /** Additional class name for the container. */
  className?: string;
  /** Additional inline styles for the container. */
  style?: React.CSSProperties;
}

/**
 * A responsive wrapper that constrains a diagram to a given aspect ratio
 * and optional maximum width. The diagram scales down with the container
 * but never stretches beyond its natural/max width.
 */
export function ResponsiveDiagram({
  children,
  maxWidth,
  aspectRatio = 16 / 9,
  className,
  style,
}: ResponsiveDiagramProps) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        ...(maxWidth ? { maxWidth } : {}),
        aspectRatio: String(aspectRatio),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

import React from "react";

export interface DiagramErrorFallbackProps {
  error: string;
}

/**
 * A styled fallback UI for diagram rendering errors.
 *
 * This is **not** an error boundary itself — it is the presentational
 * component you render inside an error boundary's fallback path.
 *
 * Styled with `--siren-*` CSS custom properties so it integrates with
 * any Siren theme without requiring Tailwind.
 */
export function DiagramErrorFallback({ error }: DiagramErrorFallbackProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          padding: "24px 32px",
          borderRadius: "var(--siren-radius, 8px)",
          background: "var(--siren-surface-raised, hsl(0 0% 12.2%))",
          maxWidth: "420px",
          textAlign: "center",
        }}
      >
        {/* Warning triangle icon */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="var(--siren-danger, #cd2b31)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="12"
            y1="9"
            x2="12"
            y2="13"
            stroke="var(--siren-danger, #cd2b31)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="17" r="1" fill="var(--siren-danger, #cd2b31)" />
        </svg>

        <span
          style={{
            color: "var(--siren-text, hsl(0 0% 98%))",
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: 1.5,
            wordBreak: "break-word",
          }}
        >
          {error}
        </span>

        <span
          style={{
            color: "var(--siren-text-muted, hsl(0 0% 70.6%))",
            fontSize: "12px",
            lineHeight: 1.4,
          }}
        >
          The diagram could not be rendered. Check your schema and try again.
        </span>
      </div>
    </div>
  );
}

"use client";

import { SirenProvider } from "@siren/themes";
import type { SirenTheme } from "@siren/themes";

interface PacketField {
  label: string;
  bits: number;
}

interface PacketRow {
  fields: PacketField[];
}

interface PacketDiagramProps {
  title?: string;
  wordSize?: number;
  rows: PacketRow[];
  theme?: SirenTheme;
  className?: string;
  style?: React.CSSProperties;
}

const ROW_HEIGHT = 40;
const BIT_ANNOTATION_HEIGHT = 20;
const TITLE_HEIGHT = 32;
const TOTAL_WIDTH = 640;

function PacketDiagramInner({
  title,
  wordSize = 32,
  rows,
  className,
  style,
}: Omit<PacketDiagramProps, "theme">) {
  const pixelsPerBit = TOTAL_WIDTH / wordSize;
  const totalRows = rows.length;
  const svgHeight =
    (title ? TITLE_HEIGHT : 0) +
    BIT_ANNOTATION_HEIGHT +
    totalRows * ROW_HEIGHT +
    8;

  const topOffset = (title ? TITLE_HEIGHT : 0) + BIT_ANNOTATION_HEIGHT;

  return (
    <div
      className={className}
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        overflowX: "auto",
        ...style,
      }}
    >
      <svg
        viewBox={`-1 0 ${TOTAL_WIDTH + 2} ${svgHeight}`}
        style={{ maxWidth: "100%", height: "auto", fontFamily: "var(--siren-font, system-ui)" }}
        role="img"
        aria-label={title ?? "Packet diagram"}
      >
        <title>{title ?? "Packet diagram"}</title>
        {/* Title */}
        {title && (
          <text
            x={TOTAL_WIDTH / 2}
            y={TITLE_HEIGHT - 8}
            textAnchor="middle"
            style={{
              fontSize: "16px",
              fontWeight: 700,
              fill: "var(--siren-text, #1e293b)",
            }}
          >
            {title}
          </text>
        )}

        {/* Bit position annotations */}
        {Array.from({ length: wordSize + 1 }, (_, i) => {
          // Show every 8 bits, plus 0 and wordSize
          if (i % 8 !== 0 && i !== wordSize) return null;
          return (
            <text
              key={`bit-${i}`}
              x={i * pixelsPerBit}
              y={topOffset - 4}
              textAnchor="middle"
              style={{
                fontSize: "10px",
                fill: "var(--siren-text-muted, #64748b)",
              }}
            >
              {i}
            </text>
          );
        })}

        {/* Rows */}
        {rows.map((row, rowIndex) => {
          const y = topOffset + rowIndex * ROW_HEIGHT;
          let bitOffset = 0;

          return (
            <g key={`row-${rowIndex}`}>
              {row.fields.map((field, fieldIndex) => {
                const x = bitOffset * pixelsPerBit;
                const width = field.bits * pixelsPerBit;
                bitOffset += field.bits;

                return (
                  <g key={`field-${rowIndex}-${fieldIndex}`}>
                    {/* Field rectangle */}
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={ROW_HEIGHT}
                      fill="var(--siren-node, #ffffff)"
                      stroke="var(--siren-node-border, #e2e8f0)"
                      strokeWidth={1.5}
                      rx={2}
                    />
                    {/* Field label */}
                    <text
                      x={x + width / 2}
                      y={y + ROW_HEIGHT / 2 - 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{
                        fontSize: width < 60 ? "9px" : "12px",
                        fontWeight: 500,
                        fill: "var(--siren-text, #1e293b)",
                      }}
                    >
                      {field.label}
                    </text>
                    {/* Bit count label */}
                    <text
                      x={x + width / 2}
                      y={y + ROW_HEIGHT / 2 + 12}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{
                        fontSize: "9px",
                        fill: "var(--siren-text-muted, #64748b)",
                      }}
                    >
                      {field.bits}b
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function PacketDiagram({ theme, ...props }: PacketDiagramProps) {
  if (theme) {
    return (
      <SirenProvider theme={theme}>
        <PacketDiagramInner {...props} />
      </SirenProvider>
    );
  }

  return <PacketDiagramInner {...props} />;
}

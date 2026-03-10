"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { HIDDEN_HANDLE_STYLE } from "../shared/edge-styles";
import { VARIANT_STYLES, BASE_TEXT_STYLE, type StepVariant } from "../shared/variant-styles";

// ── Shared ──────────────────────────────────────────────────────────

type ShapeNodeData = {
  label: string;
  variant?: StepVariant;
};

function useVariant(variant?: StepVariant) {
  return VARIANT_STYLES[variant ?? "default"];
}

// ── Stadium (pill) ──────────────────────────────────────────────────

export type StadiumNode = Node<ShapeNodeData, "stadium">;

function StadiumComponent({ data }: NodeProps<StadiumNode>) {
  const s = useVariant(data.variant);
  return (
    <>
      <Handle type="target" position={Position.Top} style={HIDDEN_HANDLE_STYLE} />
      <div
        style={{
          padding: "12px 28px",
          borderRadius: "9999px",
          background: s.bg,
          border: `1px solid ${s.border}`,
          color: s.text,
          ...BASE_TEXT_STYLE,
          minWidth: "120px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} style={HIDDEN_HANDLE_STYLE} />
    </>
  );
}

export const Stadium = memo(StadiumComponent);
(Stadium as any).displayName = "Stadium";

// ── Cylinder (database) ─────────────────────────────────────────────

export type CylinderNode = Node<ShapeNodeData, "cylinder">;

function CylinderComponent({ data }: NodeProps<CylinderNode>) {
  const s = useVariant(data.variant);
  return (
    <>
      <Handle type="target" position={Position.Top} style={HIDDEN_HANDLE_STYLE} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "120px" }}>
        <svg width="100%" height="100%" viewBox="0 0 120 80" style={{ minWidth: 120, minHeight: 80 }}>
          {/* Body */}
          <path
            d={`M 0,16 A 60,16 0 0,1 120,16 V 64 A 60,16 0 0,1 0,64 Z`}
            fill={s.bg}
            stroke={s.border}
            strokeWidth="1.5"
          />
          {/* Top ellipse */}
          <ellipse cx="60" cy="16" rx="60" ry="16" fill={s.bg} stroke={s.border} strokeWidth="1.5" />
          {/* Label */}
          <text
            x="60"
            y="48"
            textAnchor="middle"
            dominantBaseline="central"
            fill={s.text}
            style={{ ...BASE_TEXT_STYLE, fontSize: "13px" } as React.CSSProperties}
          >
            {data.label}
          </text>
        </svg>
      </div>
      <Handle type="source" position={Position.Bottom} style={HIDDEN_HANDLE_STYLE} />
    </>
  );
}

export const Cylinder = memo(CylinderComponent);
(Cylinder as any).displayName = "Cylinder";

// ── Hexagon ─────────────────────────────────────────────────────────

export type HexagonNode = Node<ShapeNodeData, "hexagon">;

function HexagonComponent({ data }: NodeProps<HexagonNode>) {
  const s = useVariant(data.variant);
  return (
    <>
      <Handle type="target" position={Position.Top} style={HIDDEN_HANDLE_STYLE} />
      <div style={{ position: "relative", minWidth: "140px", minHeight: "50px" }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 140 50"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <polygon
            points="20,0 120,0 140,25 120,50 20,50 0,25"
            fill={s.bg}
            stroke={s.border}
            strokeWidth="1.5"
          />
        </svg>
        <div
          style={{
            position: "relative",
            padding: "12px 32px",
            color: s.text,
            ...BASE_TEXT_STYLE,
            zIndex: 1,
          }}
        >
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={HIDDEN_HANDLE_STYLE} />
    </>
  );
}

export const Hexagon = memo(HexagonComponent);
(Hexagon as any).displayName = "Hexagon";

// ── Cloud ───────────────────────────────────────────────────────────

export type CloudNode = Node<ShapeNodeData, "cloud">;

function CloudComponent({ data }: NodeProps<CloudNode>) {
  const s = useVariant(data.variant);
  return (
    <>
      <Handle type="target" position={Position.Top} style={HIDDEN_HANDLE_STYLE} />
      <div style={{ position: "relative", minWidth: "160px", minHeight: "80px" }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 160 90"
          preserveAspectRatio="xMidYMid meet"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <path
            d="M 30,75 C -5,75 -5,45 15,38 C 0,12 35,-5 60,12 C 75,-2 115,-2 125,18 C 155,15 170,40 145,55 C 165,75 140,90 120,75 Z"
            fill={s.bg}
            stroke={s.border}
            strokeWidth="1.5"
          />
        </svg>
        <div
          style={{
            position: "relative",
            padding: "20px 30px",
            color: s.text,
            ...BASE_TEXT_STYLE,
            zIndex: 1,
          }}
        >
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={HIDDEN_HANDLE_STYLE} />
    </>
  );
}

export const Cloud = memo(CloudComponent);
(Cloud as any).displayName = "Cloud";

// ── Document (wavy bottom) ──────────────────────────────────────────

export type DocumentNode = Node<ShapeNodeData, "document">;

function DocumentComponent({ data }: NodeProps<DocumentNode>) {
  const s = useVariant(data.variant);
  return (
    <>
      <Handle type="target" position={Position.Top} style={HIDDEN_HANDLE_STYLE} />
      <div style={{ position: "relative", minWidth: "120px", minHeight: "60px" }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 120 65"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <path
            d="M 0,4 Q 0,0 4,0 L 116,0 Q 120,0 120,4 L 120,48 C 90,65 30,35 0,55 Z"
            fill={s.bg}
            stroke={s.border}
            strokeWidth="1.5"
          />
        </svg>
        <div
          style={{
            position: "relative",
            padding: "12px 24px 20px",
            color: s.text,
            ...BASE_TEXT_STYLE,
            zIndex: 1,
          }}
        >
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={HIDDEN_HANDLE_STYLE} />
    </>
  );
}

export const Document = memo(DocumentComponent);
(Document as any).displayName = "Document";

// ── Note (folded corner) ────────────────────────────────────────────

export type NoteNode = Node<ShapeNodeData, "note">;

function NoteComponent({ data }: NodeProps<NoteNode>) {
  const s = useVariant(data.variant);
  return (
    <>
      <Handle type="target" position={Position.Top} style={HIDDEN_HANDLE_STYLE} />
      <div style={{ position: "relative", minWidth: "120px", minHeight: "48px" }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 120 50"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          {/* Body with clipped corner */}
          <path
            d="M 0,0 L 106,0 L 120,14 L 120,50 L 0,50 Z"
            fill={s.bg}
            stroke={s.border}
            strokeWidth="1.5"
          />
          {/* Fold triangle */}
          <path
            d="M 106,0 L 106,14 L 120,14"
            fill="var(--siren-surface, hsl(0 0% 9%))"
            stroke={s.border}
            strokeWidth="1"
          />
        </svg>
        <div
          style={{
            position: "relative",
            padding: "12px 24px",
            color: s.text,
            ...BASE_TEXT_STYLE,
            zIndex: 1,
          }}
        >
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={HIDDEN_HANDLE_STYLE} />
    </>
  );
}

export const Note = memo(NoteComponent);
(Note as any).displayName = "Note";

// ── Subroutine (double-bordered rectangle) ──────────────────────────

export type SubroutineNode = Node<ShapeNodeData, "subroutine">;

function SubroutineComponent({ data }: NodeProps<SubroutineNode>) {
  const s = useVariant(data.variant);
  return (
    <>
      <Handle type="target" position={Position.Top} style={HIDDEN_HANDLE_STYLE} />
      <div
        style={{
          position: "relative",
          padding: "12px 32px",
          borderRadius: "var(--siren-radius, 8px)",
          background: s.bg,
          border: `1px solid ${s.border}`,
          color: s.text,
          ...BASE_TEXT_STYLE,
          minWidth: "140px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        {/* Left inner border */}
        <div
          style={{
            position: "absolute",
            left: "10px",
            top: 0,
            bottom: 0,
            width: "1px",
            background: s.border,
          }}
        />
        {/* Right inner border */}
        <div
          style={{
            position: "absolute",
            right: "10px",
            top: 0,
            bottom: 0,
            width: "1px",
            background: s.border,
          }}
        />
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} style={HIDDEN_HANDLE_STYLE} />
    </>
  );
}

export const Subroutine = memo(SubroutineComponent);
(Subroutine as any).displayName = "Subroutine";

// ── Trapezoid ───────────────────────────────────────────────────────

export type TrapezoidNode = Node<ShapeNodeData, "trapezoid">;

function TrapezoidComponent({ data }: NodeProps<TrapezoidNode>) {
  const s = useVariant(data.variant);
  return (
    <>
      <Handle type="target" position={Position.Top} style={HIDDEN_HANDLE_STYLE} />
      <div style={{ position: "relative", minWidth: "140px", minHeight: "48px" }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 140 48"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <polygon
            points="18,0 122,0 140,48 0,48"
            fill={s.bg}
            stroke={s.border}
            strokeWidth="1.5"
          />
        </svg>
        <div
          style={{
            position: "relative",
            padding: "12px 28px",
            color: s.text,
            ...BASE_TEXT_STYLE,
            zIndex: 1,
          }}
        >
          {data.label}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={HIDDEN_HANDLE_STYLE} />
    </>
  );
}

export const Trapezoid = memo(TrapezoidComponent);
(Trapezoid as any).displayName = "Trapezoid";

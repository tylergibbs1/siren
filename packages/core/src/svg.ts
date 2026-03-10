/**
 * Headless SVG renderer for Siren diagrams.
 *
 * Zero React dependency — works in Node.js, Deno, Bun, CI, or browser.
 * Takes a Siren JSON document and produces an SVG string.
 *
 * Usage:
 *   import { renderToSVG } from '@siren/core';
 *   const svg = await renderToSVG({ type: 'flowchart', nodes: [...], edges: [...] });
 */

import { layoutGraph } from "./layout";
import type { LayoutDirection, LayoutResult } from "./types";

// ── Theme ──────────────────────────────────────────────────────────

export interface SVGTheme {
  colors: {
    background: string;
    surface: string;
    surfaceRaised: string;
    node: string;
    nodeBorder: string;
    borderStrong: string;
    edge: string;
    text: string;
    textMuted: string;
    textSubtle: string;
    primary: string;
    primaryMuted: string;
    success: string;
    warning: string;
    danger: string;
  };
  radius: string;
  fontFamily: string;
  fontMono: string;
}

const DEFAULT_THEME: SVGTheme = {
  colors: {
    background: "hsl(0 0% 7.1%)",
    surface: "hsl(0 0% 9%)",
    surfaceRaised: "hsl(0 0% 12.2%)",
    node: "hsl(0 0% 12.2%)",
    nodeBorder: "hsl(0 0% 18%)",
    borderStrong: "hsl(0 0% 21.2%)",
    edge: "hsl(0 0% 40%)",
    text: "hsl(0 0% 98%)",
    textMuted: "hsl(0 0% 70.6%)",
    textSubtle: "hsl(0 0% 53.7%)",
    primary: "#0068b8",
    primaryMuted: "hsl(210 100% 12%)",
    success: "#18794e",
    warning: "#ffc53d",
    danger: "#cd2b31",
  },
  radius: "8px",
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  fontMono: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
};

// ── Options ────────────────────────────────────────────────────────

export interface RenderToSVGOptions {
  theme?: SVGTheme;
  padding?: number;
  background?: string | "transparent";
  /** Font size in px (default: 14) */
  fontSize?: number;
}

// ── Variant colors ─────────────────────────────────────────────────

type Variant = "default" | "primary" | "success" | "warning" | "danger";

function variantColors(v: Variant, t: SVGTheme) {
  switch (v) {
    case "primary":
      return { bg: t.colors.primary, border: t.colors.primary, text: "#ffffff" };
    case "success":
      return { bg: t.colors.success, border: t.colors.success, text: "#ffffff" };
    case "warning":
      return { bg: t.colors.warning, border: t.colors.warning, text: "hsl(0 0% 9%)" };
    case "danger":
      return { bg: t.colors.danger, border: t.colors.danger, text: "#ffffff" };
    default:
      return { bg: t.colors.node, border: t.colors.nodeBorder, text: t.colors.text };
  }
}

// ── Text measurement heuristic ─────────────────────────────────────

const SANS_RATIO = 0.55;

function fontRatio(fontFamily?: string): number {
  if (!fontFamily) return SANS_RATIO;
  const lower = fontFamily.toLowerCase();
  if (
    lower.includes("jetbrains") ||
    lower.includes("fira code") ||
    lower.includes("monospace") ||
    lower.includes("consolas") ||
    lower.includes("sfmono") ||
    lower.includes("menlo")
  ) {
    return 0.62;
  }
  if (
    lower.includes("inter") ||
    lower.includes("system-ui") ||
    lower.includes("sans-serif")
  ) {
    return 0.53;
  }
  return SANS_RATIO;
}

function estimateTextWidth(
  text: string,
  fontSize: number,
  fontFamily?: string,
): number {
  const primary = text.length * fontSize * fontRatio(fontFamily);
  const fallback = text.length * fontSize * SANS_RATIO;
  return Math.max(primary, fallback);
}

function wrapText(text: string, maxWidth: number, fontSize: number, fontFamily?: string): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (estimateTextWidth(candidate, fontSize, fontFamily) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

// ── XML helpers ────────────────────────────────────────────────────

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function radiusPx(theme: SVGTheme): number {
  return parseInt(theme.radius, 10) || 8;
}

// ── Node sizing ────────────────────────────────────────────────────

interface SizedNode {
  id: string;
  width: number;
  height: number;
  parentId?: string;
}

interface RenderedNode {
  id: string;
  label: string;
  shape: string;
  variant: Variant;
  /** Extra data for specialized rendering */
  meta?: Record<string, any>;
}

interface RenderedEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  dashed?: boolean;
}

interface RenderedGroup {
  id: string;
  label: string;
  childIds: string[];
}

interface DiagramParts {
  nodes: RenderedNode[];
  edges: RenderedEdge[];
  groups: RenderedGroup[];
  direction: LayoutDirection;
}

// ── Valid node shapes ───────────────────────────────────────────────

const VALID_SHAPES = new Set([
  "rounded", "diamond", "circle", "doublecircle", "entity", "class", "person",
  "stadium", "cylinder", "hexagon", "cloud", "document", "note", "subroutine", "trapezoid",
]);

// ── Schema → DiagramParts extraction ───────────────────────────────

function extractFlowchart(schema: any): DiagramParts {
  const nodes: RenderedNode[] = (schema.nodes ?? []).map((n: any) => ({
    id: n.id,
    label: n.label ?? n.id,
    shape: VALID_SHAPES.has(n.shape) ? n.shape : "rounded",
    variant: n.variant ?? "default",
  }));

  const edges: RenderedEdge[] = (schema.edges ?? []).map((e: any, i: number) => ({
    id: `e-${i}`,
    source: e.from,
    target: e.to,
    label: e.label,
    dashed: e.dashed,
  }));

  return { nodes, edges, groups: [], direction: schema.direction ?? "TB" };
}

function extractSequence(schema: any): DiagramParts {
  const nodes: RenderedNode[] = (schema.actors ?? []).map((a: any) => ({
    id: a.id,
    label: a.label ?? a.id,
    shape: "rounded",
    variant: "default" as Variant,
  }));

  const edges: RenderedEdge[] = (schema.messages ?? []).map((m: any, i: number) => ({
    id: `m-${i}`,
    source: m.from,
    target: m.to,
    label: m.label,
    dashed: m.reply,
  }));

  // Sequence diagrams are laid out LR with messages rendered specially
  return { nodes, edges, groups: [], direction: "LR" };
}

function extractER(schema: any): DiagramParts {
  const nodes: RenderedNode[] = (schema.entities ?? []).map((e: any) => ({
    id: e.id,
    label: e.name ?? e.id,
    shape: "entity",
    variant: "default" as Variant,
    meta: { columns: e.columns ?? [] },
  }));

  const edges: RenderedEdge[] = (schema.relationships ?? []).map((r: any, i: number) => ({
    id: `r-${i}`,
    source: r.from,
    target: r.to,
    label: r.label ? `${r.cardinality ?? ""} ${r.label}`.trim() : r.cardinality,
    dashed: false,
  }));

  return { nodes, edges, groups: [], direction: schema.direction ?? "LR" };
}

function extractArchitecture(schema: any): DiagramParts {
  const nodes: RenderedNode[] = [];
  const groups: RenderedGroup[] = [];

  for (const group of schema.groups ?? []) {
    const childIds: string[] = [];
    for (const svc of group.services ?? []) {
      nodes.push({
        id: svc.id,
        label: svc.label ?? svc.id,
        shape: VALID_SHAPES.has(svc.shape) ? svc.shape : "rounded",
        variant: svc.variant ?? "default",
      });
      childIds.push(svc.id);
    }
    groups.push({ id: group.id, label: group.label ?? group.id, childIds });
  }

  for (const svc of schema.services ?? []) {
    nodes.push({
      id: svc.id,
      label: svc.label ?? svc.id,
      shape: VALID_SHAPES.has(svc.shape) ? svc.shape : "rounded",
      variant: svc.variant ?? "default",
    });
  }

  const edges: RenderedEdge[] = (schema.connections ?? []).map((c: any, i: number) => ({
    id: `c-${i}`,
    source: c.from,
    target: c.to,
    label: c.label,
  }));

  return { nodes, edges, groups, direction: schema.direction ?? "TB" };
}

function extractState(schema: any): DiagramParts {
  const nodes: RenderedNode[] = (schema.states ?? []).map((s: any) => ({
    id: s.id,
    label: s.label ?? s.id,
    shape: s.initial ? "circle" : s.final ? "doublecircle" : "rounded",
    variant: s.variant ?? "default",
  }));

  const edges: RenderedEdge[] = (schema.transitions ?? []).map((t: any, i: number) => ({
    id: `t-${i}`,
    source: t.from,
    target: t.to,
    label: t.guard ? `[${t.guard}] ${t.label ?? ""}`.trim() : t.label,
  }));

  return { nodes, edges, groups: [], direction: schema.direction ?? "TB" };
}

function extractClass(schema: any): DiagramParts {
  const nodes: RenderedNode[] = (schema.classes ?? []).map((c: any) => ({
    id: c.id,
    label: c.name ?? c.id,
    shape: "class",
    variant: "default" as Variant,
    meta: { attributes: c.attributes ?? [], methods: c.methods ?? [] },
  }));

  const edges: RenderedEdge[] = (schema.relationships ?? []).map((r: any, i: number) => ({
    id: `r-${i}`,
    source: r.from,
    target: r.to,
    label: r.label,
    dashed: r.type === "dependency" || r.type === "realization",
  }));

  return { nodes, edges, groups: [], direction: schema.direction ?? "TB" };
}

function extractC4(schema: any): DiagramParts {
  const nodes: RenderedNode[] = [];
  const groups: RenderedGroup[] = [];

  for (const el of schema.elements ?? []) {
    if (el.type === "boundary") {
      const childIds: string[] = [];
      for (const child of el.children ?? []) {
        nodes.push({
          id: child.id,
          label: child.label ?? child.id,
          shape: child.type === "person" ? "person" : "rounded",
          variant: "default",
          meta: { description: child.description },
        });
        childIds.push(child.id);
      }
      groups.push({ id: el.id, label: el.label ?? el.id, childIds });
    } else {
      nodes.push({
        id: el.id,
        label: el.label ?? el.id,
        shape: el.type === "person" ? "person" : "rounded",
        variant: "default",
        meta: { description: el.description },
      });
    }
  }

  const edges: RenderedEdge[] = (schema.relationships ?? []).map((r: any, i: number) => ({
    id: `r-${i}`,
    source: r.from,
    target: r.to,
    label: r.label,
  }));

  return { nodes, edges, groups, direction: schema.direction ?? "TB" };
}

function extractBlock(schema: any): DiagramParts {
  const nodes: RenderedNode[] = [];
  const groups: RenderedGroup[] = [];

  for (const block of schema.blocks ?? []) {
    if (block.children && block.children.length > 0) {
      const childIds: string[] = [];
      for (const child of block.children) {
        nodes.push({ id: child.id, label: child.label ?? child.id, shape: "rounded", variant: "default" });
        childIds.push(child.id);
      }
      groups.push({ id: block.id, label: block.label ?? block.id, childIds });
    } else {
      nodes.push({ id: block.id, label: block.label ?? block.id, shape: "rounded", variant: "default" });
    }
  }

  const edges: RenderedEdge[] = (schema.connections ?? []).map((c: any, i: number) => ({
    id: `c-${i}`, source: c.from, target: c.to, label: c.label,
  }));

  return { nodes, edges, groups, direction: schema.direction ?? "TB" };
}

function extractRequirement(schema: any): DiagramParts {
  const nodes: RenderedNode[] = (schema.requirements ?? []).map((r: any) => ({
    id: r.id,
    label: r.label ?? r.id,
    shape: "rounded",
    variant: "default" as Variant,
    meta: { kind: r.kind, risk: r.risk, status: r.status },
  }));

  const edges: RenderedEdge[] = (schema.relationships ?? []).map((r: any, i: number) => ({
    id: `r-${i}`, source: r.from, target: r.to, label: r.type,
  }));

  return { nodes, edges, groups: [], direction: schema.direction ?? "TB" };
}

function extractTimeline(schema: any): DiagramParts {
  const events = schema.events ?? [];
  const nodes: RenderedNode[] = events.map((e: any) => ({
    id: e.id,
    label: `${e.date}\n${e.label}`,
    shape: "rounded",
    variant: e.variant ?? "default",
    meta: { description: e.description },
  }));

  // Timeline: chain events left-to-right
  const edges: RenderedEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({ id: `t-${i}`, source: nodes[i]!.id, target: nodes[i + 1]!.id });
  }

  return { nodes, edges, groups: [], direction: "LR" };
}

function extractMindmap(schema: any): DiagramParts {
  const nodes: RenderedNode[] = [];
  const edges: RenderedEdge[] = [];

  function walk(node: any, parentId?: string) {
    nodes.push({ id: node.id, label: node.label ?? node.id, shape: "rounded", variant: "default" });
    if (parentId) {
      edges.push({ id: `mm-${parentId}-${node.id}`, source: parentId, target: node.id });
    }
    for (const child of node.children ?? []) {
      walk(child, node.id);
    }
  }

  if (schema.root) walk(schema.root);
  return { nodes, edges, groups: [], direction: "LR" };
}

function extractGitGraph(schema: any): DiagramParts {
  const nodes: RenderedNode[] = (schema.commits ?? []).map((c: any) => ({
    id: c.id,
    label: `${c.id.slice(0, 7)}\n${c.message}`,
    shape: c.merge ? "diamond" : "circle",
    variant: "default" as Variant,
    meta: { branch: c.branch },
  }));

  const edges: RenderedEdge[] = [];
  for (const commit of schema.commits ?? []) {
    if (commit.parent) {
      edges.push({ id: `g-${commit.parent}-${commit.id}`, source: commit.parent, target: commit.id });
    }
    for (const p of commit.parents ?? []) {
      edges.push({ id: `g-${p}-${commit.id}`, source: p, target: commit.id });
    }
  }

  return { nodes, edges, groups: [], direction: "LR" };
}

function extractGantt(schema: any): DiagramParts {
  const nodes: RenderedNode[] = [];
  const groups: RenderedGroup[] = [];

  for (const section of schema.sections ?? []) {
    const childIds: string[] = [];
    for (const task of section.tasks ?? []) {
      nodes.push({
        id: task.id,
        label: `${task.label} (${task.start} → ${task.end})`,
        shape: "rounded",
        variant: "default",
      });
      childIds.push(task.id);
    }
    groups.push({ id: `section-${section.label}`, label: section.label, childIds });
  }

  return { nodes, edges: [], groups, direction: "LR" };
}

function extractSankey(schema: any): DiagramParts {
  const nodes: RenderedNode[] = (schema.nodes ?? []).map((n: any) => ({
    id: n.id, label: n.label ?? n.id, shape: "rounded", variant: "default" as Variant,
  }));

  const edges: RenderedEdge[] = (schema.flows ?? []).map((f: any, i: number) => ({
    id: `f-${i}`, source: f.from, target: f.to, label: String(f.value),
  }));

  return { nodes, edges, groups: [], direction: "LR" };
}

function extractKanban(schema: any): DiagramParts {
  const nodes: RenderedNode[] = [];
  const groups: RenderedGroup[] = [];

  for (const col of schema.columns ?? []) {
    const childIds: string[] = [];
    for (const card of col.cards ?? []) {
      nodes.push({ id: card.id, label: card.label ?? card.id, shape: "rounded", variant: "default" });
      childIds.push(card.id);
    }
    groups.push({ id: col.id, label: col.label ?? col.id, childIds });
  }

  return { nodes, edges: [], groups, direction: "LR" };
}

function extractPie(schema: any): DiagramParts {
  // Pie charts are non-graph; render as a simple node list
  const nodes: RenderedNode[] = (schema.segments ?? []).map((s: any, i: number) => ({
    id: `seg-${i}`,
    label: `${s.label}: ${s.value}`,
    shape: "rounded",
    variant: "default" as Variant,
  }));

  return { nodes, edges: [], groups: [], direction: "TB" };
}

function extractQuadrant(schema: any): DiagramParts {
  const nodes: RenderedNode[] = (schema.items ?? []).map((item: any) => ({
    id: item.id,
    label: item.label ?? item.id,
    shape: "rounded",
    variant: "default" as Variant,
  }));

  return { nodes, edges: [], groups: [], direction: "TB" };
}

function extractPacket(schema: any): DiagramParts {
  const nodes: RenderedNode[] = [];
  for (let i = 0; i < (schema.rows ?? []).length; i++) {
    const row = schema.rows[i];
    for (const field of row.fields ?? []) {
      nodes.push({
        id: `row${i}-${field.label}`,
        label: `${field.label} (${field.bits} bits)`,
        shape: "rounded",
        variant: "default",
      });
    }
  }

  return { nodes, edges: [], groups: [], direction: "LR" };
}

function extractDiagramParts(schema: any): DiagramParts {
  switch (schema.type) {
    case "flowchart": return extractFlowchart(schema);
    case "sequence": return extractSequence(schema);
    case "er": return extractER(schema);
    case "architecture": return extractArchitecture(schema);
    case "state": return extractState(schema);
    case "class": return extractClass(schema);
    case "c4": return extractC4(schema);
    case "block": return extractBlock(schema);
    case "requirement": return extractRequirement(schema);
    case "timeline": return extractTimeline(schema);
    case "mindmap": return extractMindmap(schema);
    case "gitgraph": return extractGitGraph(schema);
    case "gantt": return extractGantt(schema);
    case "sankey": return extractSankey(schema);
    case "kanban": return extractKanban(schema);
    case "pie": return extractPie(schema);
    case "quadrant": return extractQuadrant(schema);
    case "packet": return extractPacket(schema);
    default:
      throw new Error(`Unknown diagram type: '${schema.type}'`);
  }
}

// ── Node sizing ────────────────────────────────────────────────────

function sizeNode(node: RenderedNode, fontSize: number, theme: SVGTheme): SizedNode {
  const pad = { x: 48, y: 24 };
  const font = theme.fontFamily;
  const mono = theme.fontMono;

  if (node.shape === "diamond") {
    return { id: node.id, width: 140, height: 140 };
  }

  if (node.shape === "circle" || node.shape === "doublecircle") {
    const d = Math.max(40, estimateTextWidth(node.label, fontSize, font) + 24);
    return { id: node.id, width: d, height: d };
  }

  if (node.shape === "entity") {
    const columns: Array<{ name: string; type: string }> = node.meta?.columns ?? [];
    const headerW = estimateTextWidth(node.label, fontSize + 2, font) + pad.x;
    const colWidths = columns.map(
      (c) => estimateTextWidth(`${c.name}: ${c.type}`, fontSize - 1, mono) + pad.x
    );
    const width = Math.max(180, headerW, ...colWidths);
    const height = 36 + columns.length * 24 + 12;
    return { id: node.id, width, height };
  }

  if (node.shape === "class") {
    const attrs: string[] = node.meta?.attributes ?? [];
    const methods: string[] = node.meta?.methods ?? [];
    const headerW = estimateTextWidth(node.label, fontSize + 2, font) + pad.x;
    const memberWidths = [...attrs, ...methods].map(
      (m) => estimateTextWidth(m, fontSize - 1, mono) + pad.x
    );
    const width = Math.max(180, headerW, ...memberWidths);
    const sections = (attrs.length > 0 ? 1 : 0) + (methods.length > 0 ? 1 : 0);
    const height = 36 + (attrs.length + methods.length) * 22 + sections * 8 + 12;
    return { id: node.id, width, height };
  }

  if (node.shape === "person") {
    const width = Math.max(120, estimateTextWidth(node.label, fontSize, font) + pad.x);
    const desc = node.meta?.description;
    const height = desc ? 72 : 52;
    return { id: node.id, width, height };
  }

  if (node.shape === "stadium") {
    const lines = node.label.split("\n");
    const maxLineW = Math.max(...lines.map((l) => estimateTextWidth(l, fontSize, font)));
    const width = Math.max(120, maxLineW + pad.x + 20); // extra for pill ends
    const height = Math.max(44, lines.length * (fontSize + 6) + pad.y);
    return { id: node.id, width, height };
  }

  if (node.shape === "cylinder") {
    const lines = node.label.split("\n");
    const maxLineW = Math.max(...lines.map((l) => estimateTextWidth(l, fontSize, font)));
    const width = Math.max(120, maxLineW + pad.x);
    const height = Math.max(60, lines.length * (fontSize + 6) + pad.y + 24); // extra for top/bottom ellipses
    return { id: node.id, width, height };
  }

  if (node.shape === "hexagon") {
    const lines = node.label.split("\n");
    const maxLineW = Math.max(...lines.map((l) => estimateTextWidth(l, fontSize, font)));
    const width = Math.max(140, maxLineW + pad.x + 40); // extra for angled sides
    const height = Math.max(50, lines.length * (fontSize + 6) + pad.y);
    return { id: node.id, width, height };
  }

  if (node.shape === "cloud") {
    const lines = node.label.split("\n");
    const maxLineW = Math.max(...lines.map((l) => estimateTextWidth(l, fontSize, font)));
    const width = Math.max(160, maxLineW + pad.x + 40);
    const height = Math.max(80, lines.length * (fontSize + 6) + pad.y + 30);
    return { id: node.id, width, height };
  }

  if (node.shape === "document") {
    const lines = node.label.split("\n");
    const maxLineW = Math.max(...lines.map((l) => estimateTextWidth(l, fontSize, font)));
    const width = Math.max(120, maxLineW + pad.x);
    const height = Math.max(56, lines.length * (fontSize + 6) + pad.y + 16); // extra for wave bottom
    return { id: node.id, width, height };
  }

  if (node.shape === "note") {
    const lines = node.label.split("\n");
    const maxLineW = Math.max(...lines.map((l) => estimateTextWidth(l, fontSize, font)));
    const width = Math.max(120, maxLineW + pad.x);
    const height = Math.max(48, lines.length * (fontSize + 6) + pad.y);
    return { id: node.id, width, height };
  }

  if (node.shape === "subroutine") {
    const lines = node.label.split("\n");
    const maxLineW = Math.max(...lines.map((l) => estimateTextWidth(l, fontSize, font)));
    const width = Math.max(140, maxLineW + pad.x + 24); // extra for double borders
    const height = Math.max(48, lines.length * (fontSize + 6) + pad.y);
    return { id: node.id, width, height };
  }

  if (node.shape === "trapezoid") {
    const lines = node.label.split("\n");
    const maxLineW = Math.max(...lines.map((l) => estimateTextWidth(l, fontSize, font)));
    const width = Math.max(140, maxLineW + pad.x + 30); // extra for angled sides
    const height = Math.max(48, lines.length * (fontSize + 6) + pad.y);
    return { id: node.id, width, height };
  }

  // Default: rounded rectangle
  const lines = node.label.split("\n");
  const maxLineW = Math.max(...lines.map((l) => estimateTextWidth(l, fontSize, font)));
  const width = Math.max(120, maxLineW + pad.x);
  const height = Math.max(44, lines.length * (fontSize + 6) + pad.y);
  return { id: node.id, width, height };
}

// ── Centered text helper ────────────────────────────────────────────

function pushCenteredText(
  parts: string[],
  label: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fontSize: number,
  fill: string,
): void {
  const lines = label.split("\n");
  const lineH = fontSize + 6;
  const startY = y + h / 2 - ((lines.length - 1) * lineH) / 2;
  for (let i = 0; i < lines.length; i++) {
    parts.push(
      `<text x="${x + w / 2}" y="${startY + i * lineH + fontSize * 0.35}" text-anchor="middle" font-size="${fontSize}" font-weight="400" fill="${fill}">${esc(lines[i]!)}</text>`
    );
  }
}

// ── SVG shape rendering ────────────────────────────────────────────

function renderNodeSVG(
  node: RenderedNode,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: SVGTheme,
  fontSize: number,
): string {
  const parts: string[] = [];
  const colors = variantColors(node.variant, theme);
  const r = radiusPx(theme);

  if (node.shape === "diamond") {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const dx = w * 0.42;
    const dy = h * 0.42;
    parts.push(
      `<polygon points="${cx},${y + h / 2 - dy} ${x + w / 2 + dx},${cy} ${cx},${y + h / 2 + dy} ${x + w / 2 - dx},${cy}" fill="${colors.bg}" stroke="${theme.colors.primary}" stroke-width="1.5"/>`
    );
    const lines = wrapText(node.label, w * 0.55, fontSize, theme.fontFamily);
    const lineH = fontSize + 4;
    const startY = cy - ((lines.length - 1) * lineH) / 2;
    for (let i = 0; i < lines.length; i++) {
      parts.push(
        `<text x="${cx}" y="${startY + i * lineH + fontSize * 0.35}" text-anchor="middle" font-size="${fontSize}" fill="${colors.text}">${esc(lines[i]!)}</text>`
      );
    }
    return parts.join("\n");
  }

  if (node.shape === "circle" || node.shape === "doublecircle") {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r2 = Math.min(w, h) / 2;
    parts.push(
      `<circle cx="${cx}" cy="${cy}" r="${r2}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1.5"/>`
    );
    if (node.shape === "doublecircle") {
      parts.push(
        `<circle cx="${cx}" cy="${cy}" r="${r2 - 4}" fill="none" stroke="${colors.border}" stroke-width="1"/>`
      );
    }
    parts.push(
      `<text x="${cx}" y="${cy + fontSize * 0.35}" text-anchor="middle" font-size="${fontSize - 2}" fill="${colors.text}">${esc(node.label.split("\n")[0]!)}</text>`
    );
    return parts.join("\n");
  }

  if (node.shape === "entity") {
    const columns: Array<{ name: string; type: string; pk?: boolean; fk?: boolean }> = node.meta?.columns ?? [];
    // Header
    parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1.5"/>`);
    parts.push(`<text x="${x + w / 2}" y="${y + 24}" text-anchor="middle" font-size="${fontSize + 1}" font-weight="600" fill="${colors.text}">${esc(node.label)}</text>`);
    parts.push(`<line x1="${x}" y1="${y + 36}" x2="${x + w}" y2="${y + 36}" stroke="${colors.border}" stroke-width="1"/>`);
    // Columns
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i]!;
      const cy2 = y + 36 + (i + 1) * 24 - 6;
      const prefix = col.pk ? "PK " : col.fk ? "FK " : "   ";
      parts.push(
        `<text x="${x + 12}" y="${cy2}" font-size="${fontSize - 1}" font-family="${theme.fontMono}" fill="${theme.colors.textMuted}">${esc(prefix + col.name)}: <tspan fill="${theme.colors.textSubtle}">${esc(col.type)}</tspan></text>`
      );
    }
    return parts.join("\n");
  }

  if (node.shape === "class") {
    const attrs: string[] = node.meta?.attributes ?? [];
    const methods: string[] = node.meta?.methods ?? [];
    parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1.5"/>`);
    parts.push(`<text x="${x + w / 2}" y="${y + 24}" text-anchor="middle" font-size="${fontSize + 1}" font-weight="600" fill="${colors.text}">${esc(node.label)}</text>`);

    let curY = y + 36;
    parts.push(`<line x1="${x}" y1="${curY}" x2="${x + w}" y2="${curY}" stroke="${colors.border}" stroke-width="1"/>`);
    for (const attr of attrs) {
      curY += 22;
      parts.push(`<text x="${x + 12}" y="${curY}" font-size="${fontSize - 1}" font-family="${theme.fontMono}" fill="${theme.colors.textMuted}">${esc(attr)}</text>`);
    }
    if (methods.length > 0) {
      curY += 8;
      parts.push(`<line x1="${x}" y1="${curY}" x2="${x + w}" y2="${curY}" stroke="${colors.border}" stroke-width="1"/>`);
      for (const method of methods) {
        curY += 22;
        parts.push(`<text x="${x + 12}" y="${curY}" font-size="${fontSize - 1}" font-family="${theme.fontMono}" fill="${theme.colors.textMuted}">${esc(method)}</text>`);
      }
    }
    return parts.join("\n");
  }

  if (node.shape === "person") {
    const cx = x + w / 2;
    // Stick figure head
    parts.push(`<circle cx="${cx}" cy="${y + 12}" r="10" fill="${theme.colors.primary}" stroke="${theme.colors.primary}" stroke-width="1.5"/>`);
    // Body box
    parts.push(`<rect x="${x}" y="${y + 26}" width="${w}" height="${h - 26}" rx="${r}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1.5"/>`);
    parts.push(`<text x="${cx}" y="${y + 26 + (h - 26) / 2 + fontSize * 0.35}" text-anchor="middle" font-size="${fontSize}" fill="${colors.text}">${esc(node.label)}</text>`);
    if (node.meta?.description) {
      parts.push(`<text x="${cx}" y="${y + 26 + (h - 26) / 2 + fontSize * 1.5}" text-anchor="middle" font-size="${fontSize - 2}" fill="${theme.colors.textMuted}">${esc(node.meta.description)}</text>`);
    }
    return parts.join("\n");
  }

  // ── Stadium (pill) ──────────────────────────────────────────────
  if (node.shape === "stadium") {
    const ry = h / 2;
    parts.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${ry}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1.5"/>`
    );
    pushCenteredText(parts, node.label, x, y, w, h, fontSize, colors.text);
    return parts.join("\n");
  }

  // ── Cylinder (database) ───────────────────────────────────────
  if (node.shape === "cylinder") {
    const ry = 12; // ellipse vertical radius for top/bottom caps
    parts.push(
      `<path d="M ${x},${y + ry} A ${w / 2},${ry} 0 0,1 ${x + w},${y + ry} V ${y + h - ry} A ${w / 2},${ry} 0 0,1 ${x},${y + h - ry} Z" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1.5"/>`
    );
    // Top ellipse (drawn on top)
    parts.push(
      `<ellipse cx="${x + w / 2}" cy="${y + ry}" rx="${w / 2}" ry="${ry}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1.5"/>`
    );
    // Text centered in the body (below top ellipse)
    pushCenteredText(parts, node.label, x, y + ry, w, h - ry * 2, fontSize, colors.text);
    return parts.join("\n");
  }

  // ── Hexagon ───────────────────────────────────────────────────
  if (node.shape === "hexagon") {
    const dx = 20; // horizontal inset for angled sides
    const points = [
      `${x + dx},${y}`,
      `${x + w - dx},${y}`,
      `${x + w},${y + h / 2}`,
      `${x + w - dx},${y + h}`,
      `${x + dx},${y + h}`,
      `${x},${y + h / 2}`,
    ].join(" ");
    parts.push(
      `<polygon points="${points}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1.5"/>`
    );
    pushCenteredText(parts, node.label, x, y, w, h, fontSize, colors.text);
    return parts.join("\n");
  }

  // ── Cloud ─────────────────────────────────────────────────────
  if (node.shape === "cloud") {
    const cx = x + w / 2;
    const cy = y + h / 2;
    // Cloud shape using cubic bezier bumps
    const l = x + w * 0.08;
    const ri = x + w * 0.92;
    const t = y + h * 0.15;
    const b = y + h * 0.85;
    parts.push(
      `<path d="M ${l + w * 0.15},${b} C ${x - w * 0.05},${b} ${x - w * 0.05},${cy - h * 0.05} ${l},${cy - h * 0.05} C ${x - w * 0.02},${t - h * 0.1} ${cx - w * 0.15},${y - h * 0.05} ${cx},${t} C ${cx + w * 0.2},${y - h * 0.05} ${ri + w * 0.05},${t - h * 0.05} ${ri},${cy - h * 0.02} C ${x + w * 1.05},${cy + h * 0.05} ${x + w * 1.02},${b + h * 0.05} ${ri - w * 0.1},${b} Z" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1.5"/>`
    );
    pushCenteredText(parts, node.label, x, y, w, h, fontSize, colors.text);
    return parts.join("\n");
  }

  // ── Document (wavy bottom) ────────────────────────────────────
  if (node.shape === "document") {
    const waveH = 10;
    const bodyH = h - waveH;
    parts.push(
      `<path d="M ${x},${y + r} Q ${x},${y} ${x + r},${y} L ${x + w - r},${y} Q ${x + w},${y} ${x + w},${y + r} L ${x + w},${y + bodyH} C ${x + w * 0.7},${y + bodyH + waveH * 2} ${x + w * 0.3},${y + bodyH - waveH} ${x},${y + bodyH + waveH * 0.5} Z" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1.5"/>`
    );
    // Text centered in the flat portion
    pushCenteredText(parts, node.label, x, y, w, bodyH, fontSize, colors.text);
    return parts.join("\n");
  }

  // ── Note (folded corner) ──────────────────────────────────────
  if (node.shape === "note") {
    const fold = 14;
    parts.push(
      `<path d="M ${x},${y} L ${x + w - fold},${y} L ${x + w},${y + fold} L ${x + w},${y + h} L ${x},${y + h} Z" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1.5"/>`
    );
    // Fold triangle
    parts.push(
      `<path d="M ${x + w - fold},${y} L ${x + w - fold},${y + fold} L ${x + w},${y + fold}" fill="${theme.colors.surface}" stroke="${colors.border}" stroke-width="1"/>`
    );
    pushCenteredText(parts, node.label, x, y, w, h, fontSize, colors.text);
    return parts.join("\n");
  }

  // ── Subroutine (double-bordered rectangle) ────────────────────
  if (node.shape === "subroutine") {
    const inset = 8;
    parts.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1.5"/>`
    );
    // Left inner border
    parts.push(
      `<line x1="${x + inset}" y1="${y}" x2="${x + inset}" y2="${y + h}" stroke="${colors.border}" stroke-width="1"/>`
    );
    // Right inner border
    parts.push(
      `<line x1="${x + w - inset}" y1="${y}" x2="${x + w - inset}" y2="${y + h}" stroke="${colors.border}" stroke-width="1"/>`
    );
    pushCenteredText(parts, node.label, x, y, w, h, fontSize, colors.text);
    return parts.join("\n");
  }

  // ── Trapezoid ─────────────────────────────────────────────────
  if (node.shape === "trapezoid") {
    const dx = 18; // top inset
    const points = [
      `${x + dx},${y}`,
      `${x + w - dx},${y}`,
      `${x + w},${y + h}`,
      `${x},${y + h}`,
    ].join(" ");
    parts.push(
      `<polygon points="${points}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1.5"/>`
    );
    pushCenteredText(parts, node.label, x, y, w, h, fontSize, colors.text);
    return parts.join("\n");
  }

  // Default: rounded rectangle
  parts.push(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1.5"/>`
  );
  pushCenteredText(parts, node.label, x, y, w, h, fontSize, colors.text);
  return parts.join("\n");
}

// ── Edge rendering ─────────────────────────────────────────────────

function renderEdgeSVG(
  edge: RenderedEdge,
  layoutEdge: LayoutResult["edges"][number] | undefined,
  nodePositions: Map<string, { x: number; y: number; width: number; height: number }>,
  theme: SVGTheme,
  fontSize: number,
): string {
  const parts: string[] = [];

  // Determine path
  let pathD: string;

  if (layoutEdge?.sections && layoutEdge.sections.length > 0) {
    // Use ELK layout edge sections
    const section = layoutEdge.sections[0]!;
    const points = [
      section.startPoint,
      ...(section.bendPoints ?? []),
      section.endPoint,
    ];

    if (points.length === 2) {
      pathD = `M ${points[0]!.x} ${points[0]!.y} L ${points[1]!.x} ${points[1]!.y}`;
    } else if (points.length === 4) {
      pathD = `M ${points[0]!.x} ${points[0]!.y} C ${points[1]!.x} ${points[1]!.y}, ${points[2]!.x} ${points[2]!.y}, ${points[3]!.x} ${points[3]!.y}`;
    } else {
      pathD = `M ${points[0]!.x} ${points[0]!.y}`;
      for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i]!.x} ${points[i]!.y}`;
      }
    }
  } else {
    // Fallback: straight line between node centers
    const src = nodePositions.get(edge.source);
    const tgt = nodePositions.get(edge.target);
    if (!src || !tgt) return "";

    const sx = src.x + src.width / 2;
    const sy = src.y + src.height / 2;
    const tx = tgt.x + tgt.width / 2;
    const ty = tgt.y + tgt.height / 2;
    pathD = `M ${sx} ${sy} L ${tx} ${ty}`;
  }

  const dash = edge.dashed ? ` stroke-dasharray="6 4"` : "";
  parts.push(
    `<path d="${pathD}" fill="none" stroke="${theme.colors.edge}" stroke-width="1.5"${dash} marker-end="url(#siren-arrow)"/>`
  );

  // Edge label
  if (edge.label) {
    let lx: number, ly: number;

    if (layoutEdge?.sections && layoutEdge.sections.length > 0) {
      const section = layoutEdge.sections[0]!;
      const points = [section.startPoint, ...(section.bendPoints ?? []), section.endPoint];
      const mid = Math.floor(points.length / 2);
      lx = points[mid]!.x;
      ly = points[mid]!.y;
    } else {
      const src = nodePositions.get(edge.source);
      const tgt = nodePositions.get(edge.target);
      if (!src || !tgt) return parts.join("\n");
      lx = (src.x + src.width / 2 + tgt.x + tgt.width / 2) / 2;
      ly = (src.y + src.height / 2 + tgt.y + tgt.height / 2) / 2;
    }

    const labelW = estimateTextWidth(edge.label, fontSize - 1, theme.fontFamily) + 12;
    parts.push(
      `<rect x="${lx - labelW / 2}" y="${ly - 10}" width="${labelW}" height="20" rx="4" fill="${theme.colors.background}" stroke="${theme.colors.nodeBorder}" stroke-width="0.5"/>`
    );
    parts.push(
      `<text x="${lx}" y="${ly + (fontSize - 1) * 0.35}" text-anchor="middle" font-size="${fontSize - 1}" fill="${theme.colors.textMuted}">${esc(edge.label)}</text>`
    );
  }

  return parts.join("\n");
}

// ── Group rendering ────────────────────────────────────────────────

function renderGroupSVG(
  group: RenderedGroup,
  nodePositions: Map<string, { x: number; y: number; width: number; height: number }>,
  theme: SVGTheme,
  fontSize: number,
): string {
  // Calculate bounding box of children
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const childId of group.childIds) {
    const pos = nodePositions.get(childId);
    if (!pos) continue;
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + pos.width);
    maxY = Math.max(maxY, pos.y + pos.height);
  }

  if (!isFinite(minX)) return "";

  const pad = 20;
  const headerH = 28;
  const gx = minX - pad;
  const gy = minY - pad - headerH;
  const gw = maxX - minX + pad * 2;
  const gh = maxY - minY + pad * 2 + headerH;
  const r = radiusPx(theme);

  const parts: string[] = [];
  parts.push(
    `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="${r + 4}" fill="${theme.colors.surface}" stroke="${theme.colors.nodeBorder}" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.7"/>`
  );
  parts.push(
    `<text x="${gx + 12}" y="${gy + 18}" font-size="${fontSize - 2}" font-weight="600" letter-spacing="0.06em" fill="${theme.colors.textMuted}">${esc(group.label.toUpperCase())}</text>`
  );

  return parts.join("\n");
}

// ── Sequence diagram: custom layout ────────────────────────────────
// Sequences don't fit ELK well. We lay them out manually:
// actors left-to-right, messages as horizontal arrows with lifelines.

function renderSequenceSVG(
  schema: any,
  theme: SVGTheme,
  options: RenderToSVGOptions,
): string {
  const fontSize = options.fontSize ?? 14;
  const padding = options.padding ?? 40;
  const bg = options.background ?? theme.colors.background;
  const actors: Array<{ id: string; label: string }> = schema.actors ?? [];
  const messages: Array<{ from: string; to: string; label?: string; reply?: boolean }> = schema.messages ?? [];

  const actorSpacing = 200;
  const messageSpacing = 50;
  const actorBoxH = 44;
  const actorBoxW = 140;
  const r = radiusPx(theme);

  const actorX = new Map<string, number>();
  actors.forEach((a, i) => actorX.set(a.id, i * actorSpacing));

  const totalW = Math.max((actors.length - 1) * actorSpacing + actorBoxW, 300);
  const lifelineTop = actorBoxH + 20;
  const totalH = lifelineTop + messages.length * messageSpacing + 40;
  const width = totalW + padding * 2;
  const height = totalH + padding * 2;

  const parts: string[] = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(schema.title ?? "Sequence diagram")}">`);
  parts.push(`<defs>`);
  parts.push(`<marker id="siren-arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse"><polygon points="0 0, 10 3.5, 0 7" fill="${theme.colors.edge}"/></marker>`);
  parts.push(`<marker id="siren-arrow-reply" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse"><polygon points="0 0, 10 3.5, 0 7" fill="${theme.colors.textMuted}"/></marker>`);
  parts.push(`<style>text { font-family: ${theme.fontFamily}; }</style>`);
  parts.push(`</defs>`);

  if (bg !== "transparent") {
    parts.push(`<rect width="${width}" height="${height}" fill="${bg}"/>`);
  }

  parts.push(`<g transform="translate(${padding}, ${padding})">`);

  // Actor boxes + lifelines
  for (const actor of actors) {
    const ax = actorX.get(actor.id)!;
    const cx = ax + actorBoxW / 2;

    // Box
    parts.push(`<rect x="${ax}" y="0" width="${actorBoxW}" height="${actorBoxH}" rx="${r}" fill="${theme.colors.node}" stroke="${theme.colors.nodeBorder}" stroke-width="1.5"/>`);
    parts.push(`<text x="${cx}" y="${actorBoxH / 2 + fontSize * 0.35}" text-anchor="middle" font-size="${fontSize}" fill="${theme.colors.text}">${esc(actor.label)}</text>`);

    // Lifeline
    parts.push(`<line x1="${cx}" y1="${actorBoxH}" x2="${cx}" y2="${totalH}" stroke="${theme.colors.nodeBorder}" stroke-width="1" stroke-dasharray="4 4"/>`);
  }

  // Messages
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]!;
    const y = lifelineTop + i * messageSpacing + 20;
    const fromX = (actorX.get(msg.from) ?? 0) + actorBoxW / 2;
    const toX = (actorX.get(msg.to) ?? 0) + actorBoxW / 2;

    const dash = msg.reply ? ` stroke-dasharray="6 4"` : "";
    const marker = msg.reply ? "siren-arrow-reply" : "siren-arrow";
    const color = msg.reply ? theme.colors.textMuted : theme.colors.edge;
    parts.push(`<line x1="${fromX}" y1="${y}" x2="${toX}" y2="${y}" stroke="${color}" stroke-width="1.5"${dash} marker-end="url(#${marker})"/>`);

    if (msg.label) {
      const midX = (fromX + toX) / 2;
      parts.push(`<text x="${midX}" y="${y - 8}" text-anchor="middle" font-size="${fontSize - 1}" fill="${theme.colors.textMuted}">${esc(msg.label)}</text>`);
    }
  }

  parts.push(`</g>`);
  parts.push(`</svg>`);
  return parts.join("\n");
}

// ── Main renderer ──────────────────────────────────────────────────

/**
 * Render a Siren JSON document to an SVG string.
 *
 * Works headlessly — no React, no DOM, no browser required.
 * Uses ELK.js for automatic layout and produces a self-contained SVG.
 *
 * @param schema - A validated Siren JSON document (SirenSchema-compatible object)
 * @param options - Theme, padding, background, font size
 * @returns SVG string
 *
 * @example
 * ```ts
 * import { renderToSVG } from '@siren/core';
 *
 * const svg = await renderToSVG({
 *   type: 'flowchart',
 *   direction: 'TB',
 *   nodes: [
 *     { id: 'a', label: 'Start' },
 *     { id: 'b', label: 'End', variant: 'success' },
 *   ],
 *   edges: [{ from: 'a', to: 'b' }],
 * });
 * ```
 */
export async function renderToSVG(
  schema: Record<string, any>,
  options: RenderToSVGOptions = {},
): Promise<string> {
  const theme = options.theme ?? DEFAULT_THEME;
  const fontSize = options.fontSize ?? 14;
  const padding = options.padding ?? 40;
  const bg = options.background ?? theme.colors.background;

  // Sequence diagrams get custom layout
  if (schema.type === "sequence") {
    return renderSequenceSVG(schema, theme, options);
  }

  // Extract diagram parts
  const diagram = extractDiagramParts(schema);

  // Size nodes
  const sizedNodes = diagram.nodes.map((n) => sizeNode(n, fontSize, theme));
  const sizeMap = new Map(sizedNodes.map((n) => [n.id, n]));

  // Flat layout: all nodes at root level, groups rendered as visual overlays
  const layoutNodes = sizedNodes.map((n) => ({
    id: n.id,
    width: n.width,
    height: n.height,
  }));

  const layoutEdges = diagram.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
  }));

  // Run ELK layout
  const layout = await layoutGraph({
    nodes: layoutNodes,
    edges: layoutEdges,
    direction: diagram.direction,
  });

  // Build position maps
  const nodePositions = new Map<string, { x: number; y: number; width: number; height: number }>();
  for (const ln of layout.nodes) {
    nodePositions.set(ln.id, ln);
  }

  const layoutEdgeMap = new Map(layout.edges.map((e) => [e.id, e]));

  // Compute SVG dimensions
  let maxX = 0, maxY = 0;
  for (const pos of nodePositions.values()) {
    maxX = Math.max(maxX, pos.x + pos.width);
    maxY = Math.max(maxY, pos.y + pos.height);
  }

  const width = maxX + padding * 2;
  const height = maxY + padding * 2;

  // Build SVG
  const diagramLabel = schema.title ?? schema.type ?? "Diagram";
  const parts: string[] = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(diagramLabel)}">`);
  parts.push(`<defs>`);
  parts.push(`<marker id="siren-arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse"><polygon points="0 0, 10 3.5, 0 7" fill="${theme.colors.edge}"/></marker>`);
  parts.push(`<style>text { font-family: ${theme.fontFamily}; }</style>`);
  parts.push(`</defs>`);

  if (bg !== "transparent") {
    parts.push(`<rect width="${width}" height="${height}" fill="${bg}"/>`);
  }

  parts.push(`<g transform="translate(${padding}, ${padding})">`);

  // Render groups first (behind nodes)
  for (const group of diagram.groups) {
    parts.push(renderGroupSVG(group, nodePositions, theme, fontSize));
  }

  // Render edges
  for (const edge of diagram.edges) {
    const layoutEdge = layoutEdgeMap.get(edge.id);
    parts.push(renderEdgeSVG(edge, layoutEdge, nodePositions, theme, fontSize));
  }

  // Render nodes
  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));
  for (const [id, pos] of nodePositions) {
    const node = nodeMap.get(id);
    if (!node) continue; // Skip group container nodes
    parts.push(renderNodeSVG(node, pos.x, pos.y, pos.width, pos.height, theme, fontSize));
  }

  parts.push(`</g>`);
  parts.push(`</svg>`);
  return parts.join("\n");
}

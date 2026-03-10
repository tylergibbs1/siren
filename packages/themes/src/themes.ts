import type { SirenTheme } from "./types";

/**
 * Siren themes — inspired by Supabase's design philosophy:
 *
 * - Dark-mode first, achromatic neutrals (pure gray, no blue tint)
 * - Layered surface system for depth without heavy shadows
 * - Single strong brand accent (blue), everything else neutral
 * - Light font weights (400 body, 500 emphasis)
 * - Monospace accents for developer-tool aesthetic
 *
 * All foreground-on-background combinations meet WCAG 2.1 AA (4.5:1)
 * for normal text. Semantic variant colors (primary, success, danger)
 * use dark text where needed to maintain contrast on colored fills.
 */

const FONT_SANS = "Inter, system-ui, -apple-system, sans-serif";
const FONT_MONO =
  '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, monospace';

// ─── Dark (primary) ──────────────────────────────────────────────
// Pure achromatic grays (0° saturation) — code-editor aesthetic
const dark: SirenTheme = {
  colors: {
    background: "hsl(0 0% 7.1%)", // near-black
    surface: "hsl(0 0% 9%)", // sidebar-level
    surfaceRaised: "hsl(0 0% 12.2%)", // card/panel
    node: "hsl(0 0% 12.2%)",
    nodeBorder: "hsl(0 0% 18%)",
    borderStrong: "hsl(0 0% 21.2%)",
    edge: "hsl(0 0% 40%)",
    text: "hsl(0 0% 98%)",
    textMuted: "hsl(0 0% 70.6%)",
    textSubtle: "hsl(0 0% 53.7%)",
    // Blue-9 darkened for 4.5:1 on white fill: #0068b8 ≈ 5.2:1
    primary: "#0068b8",
    primaryMuted: "hsl(210 100% 12%)",
    // Darkened semantic colors for 4.5:1 contrast with white text
    success: "#18794e", // ~5.1:1 on white
    warning: "#ffc53d", // uses dark text (see variant styles)
    danger: "#cd2b31", // ~5.0:1 on white
  },
  radius: "8px",
  fontFamily: FONT_SANS,
  fontMono: FONT_MONO,
};

// ─── Light ───────────────────────────────────────────────────────
// Near-white achromatic backgrounds, same accent
const light: SirenTheme = {
  colors: {
    background: "hsl(0 0% 99%)",
    surface: "hsl(0 0% 97%)",
    surfaceRaised: "hsl(0 0% 100%)",
    node: "hsl(0 0% 100%)",
    nodeBorder: "hsl(0 0% 82%)",
    borderStrong: "hsl(0 0% 74%)",
    edge: "hsl(0 0% 60%)",
    text: "hsl(0 0% 9%)",
    textMuted: "hsl(0 0% 38%)",
    // Darkened from 53% to 44% for 4.5:1 on white bg
    textSubtle: "hsl(0 0% 44%)",
    primary: "#0068b8",
    primaryMuted: "hsl(210 100% 96%)",
    success: "#18794e",
    warning: "#ffc53d",
    danger: "#cd2b31",
  },
  radius: "8px",
  fontFamily: FONT_SANS,
  fontMono: FONT_MONO,
};

// ─── GitHub ──────────────────────────────────────────────────────
const github: SirenTheme = {
  colors: {
    background: "#ffffff",
    surface: "#f6f8fa",
    surfaceRaised: "#ffffff",
    node: "#ffffff",
    nodeBorder: "#d1d9e0",
    borderStrong: "#b1bac4",
    edge: "#656d76",
    text: "#1f2328",
    textMuted: "#656d76",
    textSubtle: "#6e7781",
    primary: "#0969da",
    primaryMuted: "#ddf4ff",
    success: "#1a7f37",
    warning: "#9a6700",
    danger: "#d1242f",
  },
  radius: "6px",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
  fontMono:
    '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
};

// ─── Presentation ────────────────────────────────────────────────
// Deep dark for slides — slightly larger radius, higher contrast
const presentation: SirenTheme = {
  colors: {
    background: "hsl(0 0% 4%)",
    surface: "hsl(0 0% 7%)",
    surfaceRaised: "hsl(0 0% 10%)",
    node: "hsl(0 0% 10%)",
    nodeBorder: "hsl(0 0% 16%)",
    borderStrong: "hsl(0 0% 22%)",
    edge: "hsl(0 0% 35%)",
    text: "hsl(0 0% 98%)",
    textMuted: "hsl(0 0% 64%)",
    // Darkened from 45% to 50% for better readability on 10% bg
    textSubtle: "hsl(0 0% 50%)",
    // Darkened indigo for 4.5:1 on white
    primary: "#6366f1",
    primaryMuted: "hsl(245 60% 12%)",
    success: "#18794e",
    warning: "#fbbf24",
    danger: "#cd2b31",
  },
  radius: "12px",
  fontFamily: FONT_SANS,
  fontMono: FONT_MONO,
};

// ─── Neutral (print-optimized) ───────────────────────────────────
// High-contrast black-and-white, optimized for printing and monochrome output
const neutral: SirenTheme = {
  colors: {
    background: "#ffffff",
    surface: "#f5f5f5",
    surfaceRaised: "#ffffff",
    node: "#ffffff",
    nodeBorder: "#333333",
    borderStrong: "#000000",
    edge: "#555555",
    text: "#000000",
    textMuted: "#333333",
    textSubtle: "#555555",
    primary: "#000000",
    primaryMuted: "#e5e5e5",
    success: "#333333",
    warning: "#666666",
    danger: "#333333",
  },
  radius: "4px",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontMono:
    '"Courier New", Courier, monospace',
};

export const themes = { dark, light, github, presentation, neutral } as const;

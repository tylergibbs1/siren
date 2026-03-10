import type { SirenTheme } from "./types";

// ── Color helpers (zero dependencies) ──────────────────────────────

/** Parse 3- or 6-digit hex to RGB [0-255]. Also handles hsl() strings. */
export function parseHex(color: string): [number, number, number] {
  // Handle hsl() format: convert via hslToRgb
  if (color.trim().startsWith("hsl")) {
    const match = color.match(/[\d.]+/g);
    if (match && match.length >= 3) {
      const h = parseFloat(match[0]!) / 360;
      const s = parseFloat(match[1]!) / 100;
      const l = parseFloat(match[2]!) / 100;
      return hslToRgb(h, s, l);
    }
  }

  let hex = color.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex[0]! + hex[0]! + hex[1]! + hex[1]! + hex[2]! + hex[2]!;
  }
  const n = parseInt(hex, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

/** Convert RGB [0-255] to HSL [0-1, 0-1, 0-1]. */
export function rgbToHsl(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

/** Convert HSL [0-1, 0-1, 0-1] to a 6-digit hex string. */
export function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return (
    "#" +
    [r, g, b]
      .map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0"))
      .join("")
  );
}

/**
 * Shift the lightness of a hex/hsl color by `amount` (positive = lighter,
 * negative = darker). Amount is in absolute lightness units (0-1 scale).
 */
export function adjustLightness(color: string, amount: number): string {
  const [r, g, b] = parseHex(color);
  const [h, s, l] = rgbToHsl(r, g, b);
  return hslToHex(h, s, Math.max(0, Math.min(1, l + amount)));
}

/**
 * Perceived luminance (0-1) using the sRGB formula.
 * Values < 0.5 are considered "dark".
 */
export function luminance(color: string): number {
  const [r, g, b] = parseHex(color);
  // Linearize sRGB
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Mix two colors. weight=0 gives color1, weight=1 gives color2. */
export function mixColors(
  color1: string,
  color2: string,
  weight: number,
): string {
  const [r1, g1, b1] = parseHex(color1);
  const [r2, g2, b2] = parseHex(color2);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * weight);
  const [r, g, b] = [mix(r1, r2), mix(g1, g2), mix(b1, b2)];
  return (
    "#" +
    [r, g, b]
      .map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0"))
      .join("")
  );
}

// ── Theme derivation ───────────────────────────────────────────────

export interface ThemeBase {
  /** Page background color (hex or hsl) */
  background: string;
  /** Brand accent color */
  primary: string;
  /** Primary text color */
  text?: string;
  /** Override any derived color */
  overrides?: Partial<SirenTheme["colors"]>;
}

const FONT_SANS = "Inter, system-ui, -apple-system, sans-serif";
const FONT_MONO =
  '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, monospace';

/**
 * Generate a full `SirenTheme` from a handful of base colors.
 *
 * The function inspects the perceived luminance of `background` to decide
 * whether to derive a dark or light palette, then builds every token from
 * simple lightness shifts. Pass `overrides` to replace any derived color.
 */
export function deriveTheme(base: ThemeBase): SirenTheme {
  const isDark = luminance(base.background) < 0.5;

  let colors: SirenTheme["colors"];

  if (isDark) {
    colors = {
      background: base.background,
      surface: adjustLightness(base.background, 0.03),
      surfaceRaised: adjustLightness(base.background, 0.06),
      node: adjustLightness(base.background, 0.06),
      nodeBorder: adjustLightness(base.background, 0.12),
      borderStrong: adjustLightness(base.background, 0.16),
      edge: adjustLightness(base.background, 0.35),
      text: base.text ?? "#fafafa",
      textMuted: adjustLightness(base.background, 0.65),
      textSubtle: adjustLightness(base.background, 0.48),
      primary: base.primary,
      primaryMuted: mixColors(base.background, base.primary, 0.12),
      success: "#18794e",
      warning: "#ffc53d",
      danger: "#cd2b31",
    };
  } else {
    colors = {
      background: base.background,
      surface: adjustLightness(base.background, -0.02),
      surfaceRaised: adjustLightness(base.background, 0.01), // toward white
      node: adjustLightness(base.background, 0.01),
      nodeBorder: adjustLightness(base.background, -0.18),
      borderStrong: adjustLightness(base.background, -0.26),
      edge: adjustLightness(base.background, -0.40),
      text: base.text ?? "#171717",
      textMuted: adjustLightness(base.background, -0.60),
      textSubtle: adjustLightness(base.background, -0.45),
      primary: base.primary,
      primaryMuted: mixColors(base.background, base.primary, 0.12),
      success: "#18794e",
      warning: "#ffc53d",
      danger: "#cd2b31",
    };
  }

  // Second pass: apply overrides
  if (base.overrides) {
    colors = { ...colors, ...base.overrides };
  }

  return {
    colors,
    radius: "8px",
    fontFamily: FONT_SANS,
    fontMono: FONT_MONO,
  };
}

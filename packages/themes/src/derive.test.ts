import { describe, it, expect } from "vitest";
import {
  parseHex,
  rgbToHsl,
  hslToHex,
  adjustLightness,
  luminance,
  mixColors,
  deriveTheme,
} from "./derive";

describe("parseHex", () => {
  it("parses 6-digit hex", () => {
    expect(parseHex("#ff0000")).toEqual([255, 0, 0]);
    expect(parseHex("#00ff00")).toEqual([0, 255, 0]);
    expect(parseHex("#0000ff")).toEqual([0, 0, 255]);
  });

  it("parses 3-digit hex", () => {
    expect(parseHex("#f00")).toEqual([255, 0, 0]);
    expect(parseHex("#fff")).toEqual([255, 255, 255]);
  });

  it("parses without hash", () => {
    expect(parseHex("ff0000")).toEqual([255, 0, 0]);
  });

  it("parses hsl() strings", () => {
    const [r, g, b] = parseHex("hsl(0 0% 0%)");
    expect(r).toBe(0);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });

  it("parses hsl with commas", () => {
    const [r, g, b] = parseHex("hsl(0, 100%, 50%)");
    expect(r).toBe(255);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });
});

describe("rgbToHsl", () => {
  it("converts pure red", () => {
    const [h, s, l] = rgbToHsl(255, 0, 0);
    expect(h).toBeCloseTo(0, 1);
    expect(s).toBeCloseTo(1, 1);
    expect(l).toBeCloseTo(0.5, 1);
  });

  it("converts white", () => {
    const [h, s, l] = rgbToHsl(255, 255, 255);
    expect(s).toBe(0);
    expect(l).toBe(1);
  });

  it("converts black", () => {
    const [h, s, l] = rgbToHsl(0, 0, 0);
    expect(s).toBe(0);
    expect(l).toBe(0);
  });
});

describe("hslToHex", () => {
  it("converts HSL red to hex", () => {
    expect(hslToHex(0, 1, 0.5)).toBe("#ff0000");
  });

  it("converts HSL white to hex", () => {
    expect(hslToHex(0, 0, 1)).toBe("#ffffff");
  });

  it("converts HSL black to hex", () => {
    expect(hslToHex(0, 0, 0)).toBe("#000000");
  });
});

describe("adjustLightness", () => {
  it("lightens a dark color", () => {
    const result = adjustLightness("#000000", 0.5);
    const [, , l] = rgbToHsl(...parseHex(result));
    expect(l).toBeCloseTo(0.5, 1);
  });

  it("darkens a light color", () => {
    const result = adjustLightness("#ffffff", -0.5);
    const [, , l] = rgbToHsl(...parseHex(result));
    expect(l).toBeCloseTo(0.5, 1);
  });

  it("clamps at 0", () => {
    const result = adjustLightness("#000000", -0.5);
    const [, , l] = rgbToHsl(...parseHex(result));
    expect(l).toBe(0);
  });

  it("clamps at 1", () => {
    const result = adjustLightness("#ffffff", 0.5);
    const [, , l] = rgbToHsl(...parseHex(result));
    expect(l).toBe(1);
  });
});

describe("luminance", () => {
  it("black has near-zero luminance", () => {
    expect(luminance("#000000")).toBeCloseTo(0, 2);
  });

  it("white has luminance ~1", () => {
    expect(luminance("#ffffff")).toBeCloseTo(1, 2);
  });

  it("dark backgrounds have luminance < 0.5", () => {
    expect(luminance("#121212")).toBeLessThan(0.5);
    expect(luminance("hsl(0 0% 7.1%)")).toBeLessThan(0.5);
  });

  it("light backgrounds have luminance >= 0.5", () => {
    expect(luminance("#f5f5f5")).toBeGreaterThanOrEqual(0.5);
  });
});

describe("mixColors", () => {
  it("weight=0 returns first color", () => {
    expect(mixColors("#ff0000", "#0000ff", 0)).toBe("#ff0000");
  });

  it("weight=1 returns second color", () => {
    expect(mixColors("#ff0000", "#0000ff", 1)).toBe("#0000ff");
  });

  it("weight=0.5 returns midpoint", () => {
    const result = mixColors("#000000", "#ffffff", 0.5);
    const [r, g, b] = parseHex(result);
    expect(r).toBeCloseTo(128, 0);
    expect(g).toBeCloseTo(128, 0);
    expect(b).toBeCloseTo(128, 0);
  });
});

describe("deriveTheme", () => {
  it("derives a dark theme from dark background", () => {
    const theme = deriveTheme({ background: "#121212", primary: "#0068b8" });
    expect(theme.colors.background).toBe("#121212");
    expect(theme.colors.primary).toBe("#0068b8");
    expect(theme.colors.text).toBe("#fafafa");
    expect(theme.radius).toBe("8px");
    expect(theme.fontFamily).toContain("Inter");
    expect(theme.fontMono).toContain("JetBrains");
  });

  it("derives a light theme from light background", () => {
    const theme = deriveTheme({ background: "#ffffff", primary: "#0068b8" });
    expect(theme.colors.background).toBe("#ffffff");
    expect(theme.colors.text).toBe("#171717");
  });

  it("uses custom text color when provided", () => {
    const theme = deriveTheme({
      background: "#121212",
      primary: "#0068b8",
      text: "#aabbcc",
    });
    expect(theme.colors.text).toBe("#aabbcc");
  });

  it("applies overrides", () => {
    const theme = deriveTheme({
      background: "#121212",
      primary: "#0068b8",
      overrides: { danger: "#ff0000", success: "#00ff00" },
    });
    expect(theme.colors.danger).toBe("#ff0000");
    expect(theme.colors.success).toBe("#00ff00");
  });

  it("returns all required SirenTheme color keys", () => {
    const theme = deriveTheme({ background: "#1a1a2e", primary: "#e94560" });
    const keys = Object.keys(theme.colors);
    const required = [
      "background", "surface", "surfaceRaised", "node", "nodeBorder",
      "borderStrong", "edge", "text", "textMuted", "textSubtle",
      "primary", "primaryMuted", "success", "warning", "danger",
    ];
    for (const k of required) {
      expect(keys).toContain(k);
      expect(theme.colors[k as keyof typeof theme.colors]).toBeTruthy();
    }
  });
});

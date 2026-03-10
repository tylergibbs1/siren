"use client";

import { createContext, useContext, useMemo } from "react";
import type { SirenTheme } from "./types";
import { themes } from "./themes";

const ThemeContext = createContext<SirenTheme>(themes.dark);

export function useSirenTheme(): SirenTheme {
  return useContext(ThemeContext);
}

export function SirenProvider({
  theme = themes.dark,
  children,
}: {
  theme?: SirenTheme;
  children: React.ReactNode;
}) {
  const cssVars = useMemo(
    () =>
      ({
        "--siren-bg": theme.colors.background,
        "--siren-surface": theme.colors.surface,
        "--siren-surface-raised": theme.colors.surfaceRaised,
        "--siren-node": theme.colors.node,
        "--siren-node-border": theme.colors.nodeBorder,
        "--siren-border-strong": theme.colors.borderStrong,
        "--siren-edge": theme.colors.edge,
        "--siren-text": theme.colors.text,
        "--siren-text-muted": theme.colors.textMuted,
        "--siren-text-subtle": theme.colors.textSubtle,
        "--siren-primary": theme.colors.primary,
        "--siren-primary-muted": theme.colors.primaryMuted,
        "--siren-success": theme.colors.success,
        "--siren-warning": theme.colors.warning,
        "--siren-danger": theme.colors.danger,
        "--siren-radius": theme.radius,
        "--siren-font": theme.fontFamily,
        "--siren-font-mono": theme.fontMono,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }) as React.CSSProperties,
    [theme]
  );

  return (
    <ThemeContext.Provider value={theme}>
      <div style={cssVars}>{children}</div>
    </ThemeContext.Provider>
  );
}

import type { Theme } from '@siren/core'

export const light: Theme = {
  name: 'light',
  colors: {
    background: '#ffffff',
    node: '#ffffff',
    nodeBorder: '#e2e8f0',
    edge: '#94a3b8',
    text: '#0f172a',
    textMuted: '#64748b',
    primary: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    groupBackground: '#f8fafc',
    groupBorder: '#e2e8f0',
    selection: '#3b82f6',
  },
  radius: '8px',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontSize: '14px',
  edgeWidth: 1.5,
}

export const dark: Theme = {
  name: 'dark',
  colors: {
    background: '#0a0a0a',
    node: '#1e1e2e',
    nodeBorder: '#313244',
    edge: '#6c7086',
    text: '#cdd6f4',
    textMuted: '#a6adc8',
    primary: '#89b4fa',
    success: '#a6e3a1',
    warning: '#f9e2af',
    danger: '#f38ba8',
    groupBackground: '#181825',
    groupBorder: '#313244',
    selection: '#89b4fa',
  },
  radius: '8px',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontSize: '14px',
  edgeWidth: 1.5,
}

export const github: Theme = {
  name: 'github',
  colors: {
    background: '#ffffff',
    node: '#ffffff',
    nodeBorder: '#d1d9e0',
    edge: '#656d76',
    text: '#1f2328',
    textMuted: '#656d76',
    primary: '#0969da',
    success: '#1a7f37',
    warning: '#9a6700',
    danger: '#d1242f',
    groupBackground: '#f6f8fa',
    groupBorder: '#d1d9e0',
    selection: '#0969da',
  },
  radius: '6px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
  fontSize: '14px',
  edgeWidth: 1.5,
}

export const presentation: Theme = {
  name: 'presentation',
  colors: {
    background: '#0f172a',
    node: '#1e293b',
    nodeBorder: '#475569',
    edge: '#94a3b8',
    text: '#f8fafc',
    textMuted: '#cbd5e1',
    primary: '#60a5fa',
    success: '#4ade80',
    warning: '#fbbf24',
    danger: '#f87171',
    groupBackground: '#1e293b',
    groupBorder: '#475569',
    selection: '#60a5fa',
  },
  radius: '12px',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontSize: '16px',
  edgeWidth: 2,
}

export const themes = { light, dark, github, presentation } as const

export type ThemeName = keyof typeof themes

/** Resolve a theme by name or return a custom theme object */
export function resolveTheme(theme: ThemeName | Theme): Theme {
  if (typeof theme === 'string') {
    return themes[theme]
  }
  return theme
}

/** Generate CSS custom properties from a theme */
export function themeToCSSVars(theme: Theme): Record<string, string> {
  return {
    '--siren-bg': theme.colors.background,
    '--siren-node-bg': theme.colors.node,
    '--siren-node-border': theme.colors.nodeBorder,
    '--siren-edge': theme.colors.edge,
    '--siren-text': theme.colors.text,
    '--siren-text-muted': theme.colors.textMuted,
    '--siren-primary': theme.colors.primary,
    '--siren-success': theme.colors.success,
    '--siren-warning': theme.colors.warning,
    '--siren-danger': theme.colors.danger,
    '--siren-group-bg': theme.colors.groupBackground,
    '--siren-group-border': theme.colors.groupBorder,
    '--siren-selection': theme.colors.selection,
    '--siren-radius': theme.radius,
    '--siren-font': theme.fontFamily,
    '--siren-font-size': theme.fontSize ?? '14px',
    '--siren-edge-width': `${theme.edgeWidth ?? 1.5}px`,
  }
}

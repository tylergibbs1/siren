import { describe, test, expect } from 'bun:test'
import { themes, resolveTheme, themeToCSSVars, light, dark, github, presentation } from './index'

describe('themes', () => {
  test('exports four themes', () => {
    expect(Object.keys(themes)).toEqual(['light', 'dark', 'github', 'presentation'])
  })

  test('each theme has required color properties', () => {
    const requiredColors = [
      'background', 'node', 'nodeBorder', 'edge', 'text', 'textMuted',
      'primary', 'success', 'warning', 'danger', 'groupBackground', 'groupBorder', 'selection',
    ]

    for (const theme of Object.values(themes)) {
      for (const color of requiredColors) {
        expect(theme.colors).toHaveProperty(color)
        expect(typeof (theme.colors as Record<string, string>)[color]).toBe('string')
      }
      expect(theme.radius).toBeDefined()
      expect(theme.fontFamily).toBeDefined()
      expect(theme.name).toBeDefined()
    }
  })

  test('resolveTheme by name', () => {
    expect(resolveTheme('dark')).toBe(dark)
    expect(resolveTheme('light')).toBe(light)
    expect(resolveTheme('github')).toBe(github)
    expect(resolveTheme('presentation')).toBe(presentation)
  })

  test('resolveTheme with custom theme object', () => {
    const custom = { ...light, name: 'custom' }
    expect(resolveTheme(custom)).toBe(custom)
  })

  test('themeToCSSVars generates all variables', () => {
    const vars = themeToCSSVars(dark)

    expect(vars['--siren-bg']).toBe(dark.colors.background)
    expect(vars['--siren-node-bg']).toBe(dark.colors.node)
    expect(vars['--siren-text']).toBe(dark.colors.text)
    expect(vars['--siren-primary']).toBe(dark.colors.primary)
    expect(vars['--siren-radius']).toBe(dark.radius)
    expect(vars['--siren-font']).toBe(dark.fontFamily)
    expect(vars['--siren-edge-width']).toContain('px')
  })

  test('light and dark themes have different backgrounds', () => {
    expect(light.colors.background).not.toBe(dark.colors.background)
  })

  test('presentation theme has larger font', () => {
    expect(parseInt(presentation.fontSize ?? '14')).toBeGreaterThan(parseInt(light.fontSize ?? '14'))
  })
})

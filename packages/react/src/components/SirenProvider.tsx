import React, { type ReactNode, type CSSProperties } from 'react'
import type { Theme } from '@siren/core'
import { resolveTheme, themeToCSSVars, type ThemeName } from '@siren/themes'

export interface SirenProviderProps {
  theme: ThemeName | Theme
  children: ReactNode
}

export function SirenProvider({ theme, children }: SirenProviderProps) {
  const resolved = resolveTheme(theme)
  const cssVars = themeToCSSVars(resolved)

  return (
    <div className="siren-root" style={cssVars as unknown as CSSProperties}>
      {children}
    </div>
  )
}

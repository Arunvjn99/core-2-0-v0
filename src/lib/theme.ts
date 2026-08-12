/**
 * Applies a client theme (from core2.client_themes.tokens) onto :root as
 * CSS custom properties, overriding the defaults in design-tokens/tokens.css.
 * This is the mechanism that makes the portal "white label" — swap the
 * theme row per client, no rebuild required.
 */
export type ThemeTokens = Partial<{
  'core-color-primary': string
  'core-color-primary-contrast': string
  'core-color-secondary': string
  'core-color-bg': string
  'core-color-surface': string
  'core-color-border': string
  'core-color-text': string
  'core-color-text-muted': string
  'core-font-display': string
  'core-font-body': string
}>

export function applyTheme(tokens: ThemeTokens) {
  const root = document.documentElement
  for (const [key, value] of Object.entries(tokens)) {
    if (value) root.style.setProperty(`--${key}`, value)
  }
}

export function resetTheme(tokens: ThemeTokens) {
  const root = document.documentElement
  for (const key of Object.keys(tokens)) {
    root.style.removeProperty(`--${key}`)
  }
}

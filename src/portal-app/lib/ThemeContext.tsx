import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
const STORAGE_KEY = 'core2-theme-mode'

type ThemeState = {
  mode: ThemeMode
  resolved: 'light' | 'dark'
  setMode: (m: ThemeMode) => void
  toggle: () => void
}

const ThemeCtx = createContext<ThemeState | null>(null)

function systemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function apply(mode: ThemeMode) {
  const root = document.documentElement
  if (mode === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', mode)
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    return stored ?? 'system'
  })
  const [resolved, setResolved] = useState<'light' | 'dark'>(() =>
    mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode,
  )

  useEffect(() => {
    apply(mode)
    setResolved(mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode)
    localStorage.setItem(STORAGE_KEY, mode)

    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setResolved(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode])

  function setMode(m: ThemeMode) {
    setModeState(m)
  }
  function toggle() {
    setModeState(resolved === 'dark' ? 'light' : 'dark')
  }

  return <ThemeCtx.Provider value={{ mode, resolved, setMode, toggle }}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

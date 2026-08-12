import { useTheme } from '../../portal-app/lib/ThemeContext'
import { IconSun, IconMoon, IconDesktop } from '../icons'

const NEXT: Record<string, 'light' | 'dark' | 'system'> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
}
const ICON = { light: IconSun, dark: IconMoon, system: IconDesktop }
const LABEL = { light: 'Light theme', dark: 'Dark theme', system: 'System theme' }

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { mode, setMode } = useTheme()
  const Icon = ICON[mode]

  return (
    <button
      onClick={() => setMode(NEXT[mode])}
      className={`rounded-full p-2 text-core-text hover:bg-core-bg ${className}`}
      aria-label={`${LABEL[mode]} — click to change`}
      title={LABEL[mode]}
    >
      <Icon className="size-4" />
    </button>
  )
}

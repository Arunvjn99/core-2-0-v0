import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  IconGrid,
  IconEnrollment,
  IconProfile,
  IconTransaction,
  IconStatements,
  IconInvestment,
  IconBell,
  IconGear,
  IconMenu,
  IconClose,
} from '../icons'
import { ThemeToggle } from '../primitives/ThemeToggle'
import { useAuth } from '../../portal-app/lib/AuthContext'
import { useTheme } from '../../portal-app/lib/ThemeContext'
import wordmark from '../../assets/login/wordmark.svg'

/**
 * Figma: Navbar (node 2870:766) + Menubar (node 2893:57019), shared across
 * all authenticated portal screens. Module visibility is admin-config-gated
 * (see admin-app plan) — for now all six modules render.
 *
 * Responsive: sidebar is icon+label rail at lg+ (matches Figma desktop),
 * collapses to a slide-out drawer behind a hamburger below lg (no mobile
 * nav frame in the source file for this shell, so this is our own call).
 */
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: IconGrid },
  { to: '/enrollment', label: 'Enrollment', icon: IconEnrollment },
  { to: '/profile', label: 'Profile', icon: IconProfile },
  { to: '/transactions', label: 'Transaction', icon: IconTransaction },
  { to: '/statements', label: 'Account Statements', icon: IconStatements },
  { to: '/investments', label: 'Investment Portfolio', icon: IconInvestment },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { session, signOut } = useAuth()
  const { resolved } = useTheme()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const name = (session?.user.user_metadata?.full_name as string | undefined) ?? session?.user.email ?? 'Participant'

  return (
    <div className="min-h-svh bg-core-bg">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-core-border bg-core-surface px-4 shadow-[0_1px_5px_rgba(0,0,0,0.05),0_4px_2.5px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.12)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-full p-2 text-core-text hover:bg-core-bg lg:hidden"
            aria-label="Open menu"
          >
            <IconMenu className="size-4" />
          </button>
          <img src={wordmark} alt="" className="h-7" style={resolved === 'dark' ? { filter: 'invert(1)' } : undefined} />
        </div>
        <div className="flex h-full items-center gap-1">
          <ThemeToggle />
          <button className="rounded-full p-2 text-core-text hover:bg-core-bg" aria-label="Notifications">
            <IconBell className="size-4" />
          </button>
          <button className="rounded-full p-2 text-core-text hover:bg-core-bg" aria-label="Settings">
            <IconGear className="size-4" />
          </button>
          <button
            onClick={() => void signOut()}
            className="flex items-center gap-2 rounded-full border border-core-border p-1 pr-3 text-[14px] font-medium text-core-text hover:bg-core-bg"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-core-primary/15 text-[13px] font-semibold text-core-primary">
              {name.slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden sm:inline">{name}</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Desktop rail */}
        <nav className="sticky top-[72px] hidden h-[calc(100svh-72px)] w-24 shrink-0 flex-col border-r border-core-border bg-core-surface shadow-[1px_4px_6px_rgba(0,0,0,0.14)] lg:flex">
          <NavItems />
        </nav>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <button
              className="absolute inset-0 bg-black/40"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            />
            <nav className="relative flex h-full w-64 flex-col bg-core-surface shadow-xl">
              <div className="flex items-center justify-between border-b border-core-border p-4">
                <img src={wordmark} alt="" className="h-7" style={resolved === 'dark' ? { filter: 'invert(1)' } : undefined} />
                <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="p-1 text-core-text">
                  <IconClose className="size-4" />
                </button>
              </div>
              <NavItems horizontal onNavigate={() => setDrawerOpen(false)} />
            </nav>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  )
}

function NavItems({ horizontal = false, onNavigate }: { horizontal?: boolean; onNavigate?: () => void }) {
  return (
    <>
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-4 text-[14px] font-medium ${
              horizontal ? 'flex-row justify-start' : 'flex-col justify-center text-center'
            } ${
              isActive
                ? 'border-r-4 border-[#05eded] bg-core-info/10 text-core-text'
                : 'text-core-text-muted hover:bg-core-bg'
            }`
          }
        >
          <Icon className="size-4 shrink-0" />
          <span className="leading-tight">{label}</span>
        </NavLink>
      ))}
    </>
  )
}

import type { ReactNode } from 'react'
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
} from '../icons'
import { useAuth } from '../../portal-app/lib/AuthContext'
import wordmark from '../../assets/login/wordmark.svg'

/**
 * Figma: Navbar (node 2870:766) + Menubar (node 2893:57019), shared across
 * all authenticated portal screens. Module visibility is admin-config-gated
 * (see admin-app plan) — for now all six modules render.
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
  const name = (session?.user.user_metadata?.full_name as string | undefined) ?? session?.user.email ?? 'Participant'

  return (
    <div className="min-h-svh bg-[#f2f4f6]">
      <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-core-border bg-core-surface px-4 shadow-[0_1px_5px_rgba(0,0,0,0.05),0_4px_2.5px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.12)]">
        <img src={wordmark} alt="" className="h-8" />
        <div className="flex h-full items-center gap-2">
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
            {name}
          </button>
        </div>
      </header>

      <div className="flex">
        <nav className="sticky top-[72px] flex h-[calc(100svh-72px)] w-24 shrink-0 flex-col border-r border-core-border bg-core-surface shadow-[1px_4px_6px_rgba(0,0,0,0.14)]">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-2 px-2 py-6 text-center text-[14px] font-medium ${
                  isActive
                    ? 'border-r-4 border-[#05eded] bg-[#e6f7fd] text-core-text'
                    : 'text-core-text/70 hover:bg-core-bg'
                }`
              }
            >
              <Icon className="size-4" />
              <span className="leading-tight">{label}</span>
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  )
}

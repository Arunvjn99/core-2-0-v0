import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../../ui-kit/primitives/ThemeToggle'
import { useAuth } from '../../portal-app/lib/AuthContext'
import wordmark from '../../assets/login/wordmark.svg'

/**
 * Net-new — no Figma source for the admin console. Built to match the
 * participant portal's design system (same tokens, same primitives) so the
 * two feel like one product. Any authenticated user can reach this today;
 * see adminApi.ts for the RBAC TODO before this ships for real.
 */
const NAV = [
  { to: '/admin/clients', label: 'Clients' },
  { to: '/admin/theme', label: 'Theming' },
  { to: '/admin/modules', label: 'Modules' },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-svh bg-core-bg">
      <header className="sticky top-0 z-10 flex h-[64px] items-center justify-between border-b border-core-border bg-core-surface px-4">
        <div className="flex items-center gap-3">
          <img src={wordmark} alt="" className="h-6" />
          <span className="rounded-full bg-core-warning-bg px-2 py-1 text-[11px] font-semibold uppercase text-core-warning">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-2 text-[14px] font-medium text-core-info"
          >
            ‹ Back to portal
          </button>
          <ThemeToggle />
          <button
            onClick={() => void signOut()}
            className="rounded-[4px] border border-core-border px-3 py-1.5 text-[13px] font-medium text-core-text hover:bg-core-bg"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex">
        <nav className="sticky top-[64px] flex h-[calc(100svh-64px)] w-52 shrink-0 flex-col gap-1 border-r border-core-border bg-core-surface p-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-[6px] px-3 py-2.5 text-[14px] font-medium ${
                  isActive ? 'bg-core-info/10 text-core-info' : 'text-core-text-muted hover:bg-core-bg'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

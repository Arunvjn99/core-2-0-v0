import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabaseClient'

type AuthState = {
  session: Session | null
  loading: boolean
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthCtx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
      if (data.session) void ensureParticipantRow(data.session.user)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s) void ensureParticipantRow(s.user)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // core2.saved_plans / core2.feedback FK to core2.participants — make sure
  // the row exists the first time we see this user, instead of requiring a
  // separate signup step.
  async function ensureParticipantRow(user: Session['user']) {
    const meta = user.user_metadata as { first_name?: string; last_name?: string; full_name?: string }
    await supabase.from('participants').upsert(
      {
        id: user.id,
        first_name: meta?.first_name ?? meta?.full_name?.split(' ')[0] ?? null,
        last_name: meta?.last_name ?? meta?.full_name?.split(' ').slice(1).join(' ') ?? null,
      },
      { onConflict: 'id', ignoreDuplicates: true },
    )
  }

  async function signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthCtx.Provider value={{ session, loading, signInWithPassword, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

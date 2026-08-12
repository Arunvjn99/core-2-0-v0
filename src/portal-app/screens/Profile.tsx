import { useEffect, useState, type FormEvent } from 'react'
import { AppShell } from '../../ui-kit/patterns/AppShell'
import { TextField } from '../../ui-kit/primitives/TextField'
import { Button } from '../../ui-kit/primitives/Button'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../../ui-kit/lib/ToastContext'

/**
 * Not present as a standalone screen in the Figma file (only referenced as
 * a sidebar nav item) — built to match the design system established by
 * the other screens. Reads/writes core2.participants for real.
 */
export default function Profile() {
  const { session } = useAuth()
  const { show } = useToast()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    supabase
      .from('participants')
      .select('first_name, last_name')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        setFirstName(data?.first_name ?? '')
        setLastName(data?.last_name ?? '')
        setLoading(false)
      })
  }, [session])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!session) return
    setSaving(true)
    setError(null)
    const { error: updateError } = await supabase
      .from('participants')
      .update({ first_name: firstName, last_name: lastName, updated_at: new Date().toISOString() })
      .eq('id', session.user.id)
    setSaving(false)
    if (updateError) {
      setError(updateError.message)
      show(updateError.message, 'error')
      return
    }
    show('Profile saved')
  }

  return (
    <AppShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-[22px] font-semibold text-core-text">Profile</h1>
          <p className="text-[16px] text-core-text-muted">Your personal details</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-core-md bg-core-surface p-6 shadow-core-sm">
          <div className="flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-full bg-core-primary/15 text-[22px] font-semibold text-core-primary">
              {firstName.slice(0, 1).toUpperCase() || session?.user.email?.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="font-semibold text-core-text">{firstName} {lastName}</p>
              <p className="text-[14px] text-core-text-muted">{session?.user.email}</p>
            </div>
          </div>

          {loading ? (
            <p className="text-core-text-muted">Loading…</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              <TextField label="Email" value={session?.user.email ?? ''} disabled className="opacity-70" />
            </div>
          )}

          {error && <p className="text-[14px] text-core-critical">{error}</p>}

          <div>
            <Button type="submit" variant="cta" loading={saving} disabled={loading}>
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}

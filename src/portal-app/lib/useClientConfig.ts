import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { applyTheme } from '../../lib/theme'
import { useAuth } from './AuthContext'

/**
 * The runtime half of white-labeling: loads the logged-in participant's
 * client_id, applies that client's active theme (CSS vars, see
 * lib/theme.ts) and returns which modules are enabled so AppShell can hide
 * nav items the admin console turned off. Falls back to "everything on,
 * default theme" if the participant has no client assigned yet.
 */
export type ClientLogo = { light: string | null; dark: string | null }

export function useClientConfig() {
  const { session } = useAuth()
  const [enabledModules, setEnabledModules] = useState<Set<string> | null>(null)
  const [logo, setLogo] = useState<ClientLogo | null>(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false

    async function load() {
      const { data: participant } = await supabase
        .from('participants')
        .select('client_id')
        .eq('id', session!.user.id)
        .maybeSingle()

      const clientId = participant?.client_id
      if (!clientId) {
        if (!cancelled) {
          setEnabledModules(null) // null = show everything
          setLogo(null) // null = use the default CORE wordmark
        }
        return
      }

      const [{ data: theme }, { data: modules }] = await Promise.all([
        supabase
          .from('client_themes')
          .select('tokens, logo_url, logo_url_dark')
          .eq('client_id', clientId)
          .eq('is_active', true)
          .maybeSingle(),
        supabase.from('module_config').select('module_key, enabled').eq('client_id', clientId),
      ])

      if (cancelled) return
      if (theme?.tokens) applyTheme(theme.tokens)
      setLogo(theme?.logo_url ? { light: theme.logo_url, dark: theme.logo_url_dark ?? theme.logo_url } : null)
      if (modules) {
        setEnabledModules(new Set(modules.filter((m) => m.enabled).map((m) => m.module_key)))
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [session])

  return { enabledModules, logo }
}

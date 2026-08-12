import { supabase } from '../../lib/supabaseClient'

export type Client = { id: string; name: string; slug: string; created_at: string }
export type ClientTheme = {
  id: string
  client_id: string
  name: string
  tokens: Record<string, string>
  logo_url: string | null
  is_active: boolean
}
export type ModuleConfigRow = { id: string; client_id: string; module_key: string; enabled: boolean }

export const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'enrollment', label: 'Enrollment (risk questionnaire)' },
  { key: 'profile', label: 'Profile' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'statements', label: 'Account Statements' },
  { key: 'investments', label: 'Investment Portfolio' },
] as const

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createClient(name: string, slug: string): Promise<Client> {
  const { data, error } = await supabase.from('clients').insert({ name, slug }).select().single()
  if (error) throw error
  // Seed default theme + all modules enabled so a new client is usable immediately.
  await supabase.from('client_themes').insert({ client_id: data.id, name: 'default', tokens: {}, is_active: true })
  await supabase.from('module_config').insert(MODULES.map((m) => ({ client_id: data.id, module_key: m.key, enabled: true })))
  return data
}

export async function fetchTheme(clientId: string): Promise<ClientTheme | null> {
  const { data, error } = await supabase
    .from('client_themes')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function saveTheme(themeId: string, tokens: Record<string, string>) {
  const { error } = await supabase.from('client_themes').update({ tokens, updated_at: new Date().toISOString() }).eq('id', themeId)
  if (error) throw error
}

export async function fetchModuleConfig(clientId: string): Promise<ModuleConfigRow[]> {
  const { data, error } = await supabase.from('module_config').select('*').eq('client_id', clientId)
  if (error) throw error
  return data ?? []
}

export async function setModuleEnabled(rowId: string, enabled: boolean) {
  const { error } = await supabase.from('module_config').update({ enabled }).eq('id', rowId)
  if (error) throw error
}

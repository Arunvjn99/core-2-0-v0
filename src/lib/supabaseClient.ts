import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // Deliberately still throws here — main.tsx checks these same env vars
  // BEFORE importing App (and therefore before this module ever loads), so
  // in practice this throw is unreachable in normal operation and only
  // guards against this module being imported some other way. See
  // main.tsx's isConfigured check for the actual missing-env-var UX.
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — copy .env.example to .env.local (or set them as environment variables on your host) and rebuild.',
  )
}

// All CORE 2.0 tables live in the isolated `core2` Postgres schema —
// this client is scoped to it so we never accidentally read/write `public.*`.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'core2' },
})

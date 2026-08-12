import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — copy .env.example to .env.local and fill in values from the Core-Claude Supabase project.',
  )
}

// All CORE 2.0 tables live in the isolated `core2` Postgres schema —
// this client is scoped to it so we never accidentally read/write `public.*`.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'core2' },
})

import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL が設定されていません')
  }

  if (!SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されていません')
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export const supabaseClient = createSupabaseClient()

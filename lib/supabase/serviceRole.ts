import { createClient } from '@supabase/supabase-js'

// Server-only, trusted code path. Bypasses RLS entirely — the same
// escape hatch the edge functions use for `integrations`, brought into
// the Next.js server runtime for app/mediakit/[shareToken]/page.tsx, the
// one route in this app that has to read another account's data without
// that account's own session. Callers must scope every query themselves
// (by share_token / resolved user_id) and only select the columns the
// public page actually needs — this client has no RLS to fall back on.
export function createSupabaseServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return null

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

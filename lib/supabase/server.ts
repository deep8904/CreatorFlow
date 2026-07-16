import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Ignore write errors in server components; middleware will refresh the session.
        }
      },
    },
  })
}

// Server-only (reads next/headers via createSupabaseServerClient). Keep out of
// lib/supabase/auth.ts, which client components import for signIn/signUp/signOut —
// mixing the two in one module drags next/headers into the client bundle.
export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return { user: null, error: null }
  }

  const { data, error } = await supabase.auth.getUser()
  return { user: data.user, error }
}

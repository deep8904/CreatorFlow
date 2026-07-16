// Client-safe only (createSupabaseBrowserClient has no server-only imports). The
// server-only getAuthenticatedUser lives in ./server so client components can
// import from this file without pulling next/headers into the browser bundle.
import { createSupabaseBrowserClient } from './client'

export async function signInWithEmail(email: string, password: string) {
  const supabase = createSupabaseBrowserClient()
  if (!supabase) {
    throw new Error('Supabase environment variables are not configured.')
  }

  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithEmail(email: string, password: string, options?: { full_name?: string }) {
  const supabase = createSupabaseBrowserClient()
  if (!supabase) {
    throw new Error('Supabase environment variables are not configured.')
  }

  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: options?.full_name ?? null,
      },
    },
  })
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient()
  if (!supabase) {
    return { error: null }
  }

  return supabase.auth.signOut()
}

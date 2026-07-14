import { createSupabaseBrowserClient } from './client'
import { createSupabaseServerClient } from './server'

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

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return { user: null, error: null }
  }

  const { data, error } = await supabase.auth.getUser()
  return { user: data.user, error }
}

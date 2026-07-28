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

export async function signUpWithEmail(
  email: string,
  password: string,
  options?: { full_name?: string },
  emailRedirectTo?: string,
) {
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
      // Without this, Supabase falls back to the project's default Site
      // URL/redirect setting, which sends a confirmed signup straight to
      // whatever that's configured to (often just "/") — skipping the
      // onboarding wizard's YouTube/Gmail steps entirely for anyone whose
      // project requires email confirmation (the default). Explicitly
      // routing back through /onboarding is what lets OnboardingFlow resume
      // the wizard once the user returns with a real session.
      emailRedirectTo,
    },
  })
}

export async function resendConfirmationEmail(email: string) {
  const supabase = createSupabaseBrowserClient()
  if (!supabase) {
    throw new Error('Supabase environment variables are not configured.')
  }

  return supabase.auth.resend({ type: 'signup', email })
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient()
  if (!supabase) {
    return { error: null }
  }

  return supabase.auth.signOut()
}

export async function requestPasswordReset(email: string) {
  const supabase = createSupabaseBrowserClient()
  if (!supabase) {
    throw new Error('Supabase environment variables are not configured.')
  }

  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
  })
}

export async function updatePassword(password: string) {
  const supabase = createSupabaseBrowserClient()
  if (!supabase) {
    throw new Error('Supabase environment variables are not configured.')
  }

  return supabase.auth.updateUser({ password })
}

export async function updateEmail(email: string) {
  const supabase = createSupabaseBrowserClient()
  if (!supabase) {
    throw new Error('Supabase environment variables are not configured.')
  }

  return supabase.auth.updateUser({ email })
}

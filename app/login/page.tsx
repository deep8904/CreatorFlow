'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithEmail } from '@/lib/supabase/auth'
import { AuthShell, AuthHeading, AuthCard, AuthField, AuthPasswordField, AuthAlert, AuthButton, AuthLink } from '@/components/auth'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setIsSubmitting(true)
    setError(null)
    try {
      const { error: signInError } = await signInWithEmail(email.trim(), password)
      if (signInError) {
        setError(
          signInError.message.toLowerCase().includes('invalid login credentials')
            ? "That email and password don't match. Check for typos, or reset your password below."
            : signInError.message,
        )
        return
      }
      router.push(searchParams.get('next') || '/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const next = searchParams.get('next')
  const onboardingHref = next ? `/onboarding?next=${encodeURIComponent(next)}` : '/onboarding'

  return (
    <AuthShell
      topRight={
        <AuthLink href={onboardingHref}>
          <span className="hidden sm:inline">Don&apos;t have an account? </span>
          <span className="text-white">Start free</span>
        </AuthLink>
      }
      footnote="Free and open source. No cut of your deals, ever."
    >
      <AuthHeading title="Welcome back" subtitle="Sign in to pick up where you left off." />

      <AuthCard as="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@gmail.com"
        />

        <AuthPasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          labelSuffix={<AuthLink href="/forgot-password">Forgot password?</AuthLink>}
        />

        <AuthAlert message={error} />

        <AuthButton type="submit" isComplete={Boolean(email.trim() && password)} disabled={isSubmitting || !email.trim() || !password} loading={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </AuthButton>
      </AuthCard>
    </AuthShell>
  )
}

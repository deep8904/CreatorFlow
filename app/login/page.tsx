'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { signInWithEmail } from '@/lib/supabase/auth'
import { Logo } from '@/components/ui/logo'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

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
        setError(signInError.message)
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

  return (
    <div className="flex min-h-screen flex-col bg-linen">
      <header className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-fog px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Logo size={24} />
          <span className="text-[15px] font-semibold text-carbon">CreatorFlow</span>
        </Link>
        <Link
          href={searchParams.get('next') ? `/onboarding?next=${encodeURIComponent(searchParams.get('next')!)}` : '/onboarding'}
          className="text-[13px] font-medium text-graphite transition-colors hover:text-carbon"
        >
          Don&apos;t have an account? Start free
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 text-center">
            <h1 className="text-auth-h1 mb-3 text-carbon">Welcome back</h1>
            <p className="font-body-editorial text-[15px] leading-relaxed text-graphite">
              Sign in to pick up where you left off.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass-panel flex flex-col gap-4 rounded-xl p-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-[12px] font-medium text-graphite hover:text-carbon transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-[13px] font-semibold text-carbon">{error}</p>}

            <Button
              type="submit"
              size="lg"
              className="mt-2 w-full"
              disabled={isSubmitting || !email.trim() || !password}
              loading={isSubmitting}
              iconRight={!isSubmitting ? <ArrowRight size={15} /> : undefined}
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-[12px] text-ash">
            Free means free — no percentage of your deals, no credit card to start.
          </p>
        </div>
      </main>
    </div>
  )
}

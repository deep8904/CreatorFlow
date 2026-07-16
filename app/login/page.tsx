'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { signInWithEmail } from '@/lib/supabase/auth'

export default function LoginPage() {
  const router = useRouter()
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
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-linen">
      <header className="flex w-full items-center justify-between border-b border-fog px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" stroke="#F97316" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="4" fill="#F97316" />
          </svg>
          <span className="text-[15px] font-semibold text-white">CreatorFlow</span>
        </Link>
        <Link href="/onboarding" className="text-[13px] font-medium text-graphite transition-colors hover:text-white">
          Don&apos;t have an account? Start free
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-[26px] font-semibold leading-tight tracking-tight text-white">
              Welcome back
            </h1>
            <p className="font-body-editorial text-[15px] leading-relaxed text-graphite">
              Sign in to pick up where you left off.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass-panel flex flex-col gap-4 rounded-lg p-6">
            <div>
              <label htmlFor="email" className="font-label mb-1.5 block text-[11px] uppercase tracking-widest text-ash">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full border border-fog bg-linen px-3.5 py-2.5 text-[14px] text-white placeholder-ash outline-none transition-colors focus:border-lavender/60"
              />
            </div>

            <div>
              <label htmlFor="password" className="font-label mb-1.5 block text-[11px] uppercase tracking-widest text-ash">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-fog bg-linen px-3.5 py-2.5 text-[14px] text-white placeholder-ash outline-none transition-colors focus:border-lavender/60"
              />
            </div>

            {error && <p className="text-[13px] text-ember">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting || !email.trim() || !password}
              className="btn-editorial mt-2 w-full disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? 'Signing in…' : 'Sign in'}
                {!isSubmitting && <ArrowRight size={15} className="icon-arrow" />}
              </span>
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] text-ash">
            Free means free — no percentage of your deals, no credit card to start.
          </p>
        </div>
      </main>
    </div>
  )
}

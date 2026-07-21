'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { requestPasswordReset } from '@/lib/supabase/auth'
import { Logo } from '@/components/ui/logo'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setIsSubmitting(true)
    setError(null)
    try {
      const { error: resetError } = await requestPasswordReset(email.trim())
      if (resetError) {
        setError(resetError.message)
        return
      }
      setSent(true)
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
        <Link href="/login" className="text-[13px] font-medium text-graphite transition-colors hover:text-carbon">
          Back to sign in
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          {sent ? (
            <div className="text-center">
              <h1 className="text-auth-h1 mb-3 text-carbon">Check your email</h1>
              <p className="font-body-editorial text-[15px] leading-relaxed text-graphite">
                If an account exists for <span className="text-carbon">{email.trim()}</span>, we&apos;ve sent a link to reset your password.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-auth-h1 mb-3 text-carbon">Reset your password</h1>
                <p className="font-body-editorial text-[15px] leading-relaxed text-graphite">
                  Enter your email and we&apos;ll send you a link to set a new one.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="glass-panel flex flex-col gap-4 rounded-xl p-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                  />
                </div>

                {error && <p className="text-[13px] font-semibold text-carbon">{error}</p>}

                <Button
                  type="submit"
                  size="lg"
                  className="mt-2 w-full"
                  disabled={isSubmitting || !email.trim()}
                  loading={isSubmitting}
                  iconRight={!isSubmitting ? <ArrowRight size={15} /> : undefined}
                >
                  {isSubmitting ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

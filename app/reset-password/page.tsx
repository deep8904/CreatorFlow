'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { updatePassword } from '@/lib/supabase/auth'
import { Logo } from '@/components/ui/logo'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords don’t match.')
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const { error: updateError } = await updatePassword(password)
      if (updateError) {
        setError(updateError.message)
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
      <header className="flex w-full items-center gap-2.5 border-b border-fog px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={24} />
          <span className="text-[15px] font-semibold text-carbon">CreatorFlow</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 text-center">
            <h1 className="text-auth-h1 mb-3 text-carbon">Set a new password</h1>
            <p className="font-body-editorial text-[15px] leading-relaxed text-graphite">
              Choose something you haven&apos;t used before.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="glass-panel flex flex-col gap-4 rounded-xl p-6">
            <div>
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-[13px] font-semibold text-carbon">{error}</p>}

            <Button
              type="submit"
              size="lg"
              className="mt-2 w-full"
              disabled={isSubmitting || !password || !confirm}
              loading={isSubmitting}
              iconRight={!isSubmitting ? <ArrowRight size={15} /> : undefined}
            >
              {isSubmitting ? 'Saving…' : 'Save new password'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}

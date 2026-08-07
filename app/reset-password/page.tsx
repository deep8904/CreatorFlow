'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { updatePassword } from '@/lib/supabase/auth'
import { AuthShell, AuthHeading, AuthCard, AuthPasswordField, AuthAlert, AuthButton, AuthLink } from '@/components/auth'

const LENGTH_ERROR = 'Password must be at least 8 characters.'
const MATCH_ERROR = 'Passwords don’t match.'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError(LENGTH_ERROR)
      return
    }
    if (password !== confirm) {
      setError(MATCH_ERROR)
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const { error: updateError } = await updatePassword(password)
      if (updateError) {
        setError(
          updateError.message.toLowerCase().includes('session')
            ? "This reset link has expired or was already used. Request a new one to continue."
            : updateError.message,
        )
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

  // Purely presentational: which field(s) the current error message concerns.
  const passwordInvalid = error === LENGTH_ERROR || error === MATCH_ERROR
  const confirmInvalid = error === MATCH_ERROR

  return (
    <AuthShell
      footnote={
        <>
          Reset links expire. If this one doesn&apos;t work, <AuthLink href="/forgot-password">request a new one</AuthLink>.
        </>
      }
    >
      <AuthHeading title="Set a new password" subtitle="Choose something you haven't used before." />

      <AuthCard as="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthPasswordField
          id="new-password"
          label="New password"
          autoComplete="new-password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          invalid={passwordInvalid}
        />

        <AuthPasswordField
          id="confirm-password"
          label="Confirm password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat the password"
          invalid={confirmInvalid}
        />

        <AuthAlert message={error} />

        <AuthButton type="submit" isComplete={Boolean(password && confirm)} disabled={isSubmitting || !password || !confirm} loading={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save new password'}
        </AuthButton>
      </AuthCard>
    </AuthShell>
  )
}

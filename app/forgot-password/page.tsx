'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { MailCheck } from 'lucide-react'
import { requestPasswordReset } from '@/lib/supabase/auth'
import { AuthShell, AuthHeading, AuthCard, AuthField, AuthAlert, AuthButton, AuthResendButton, AuthLink, AuthNotice } from '@/components/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const noticeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sent) noticeRef.current?.focus()
  }, [sent])

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
    <AuthShell topRight={<AuthLink href="/login">Back to sign in</AuthLink>}>
      {sent ? (
        <AuthNotice
          ref={noticeRef}
          icon={MailCheck}
          tone="neutral"
          title="Check your email"
          body={
            <>
              If an account exists for <span className="text-zinc-100">{email.trim()}</span>, we&apos;ve sent a link to reset
              your password. Links expire after a while, so if yours doesn&apos;t work, send another below.
            </>
          }
        >
          <AuthResendButton sentLabel="Sent" onResend={() => requestPasswordReset(email.trim())} />
        </AuthNotice>
      ) : (
        <>
          <AuthHeading title="Reset your password" subtitle="Enter your email and we'll send you a link to set a new one." />

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

            <AuthAlert message={error} />

            <AuthButton type="submit" isComplete={Boolean(email.trim())} disabled={isSubmitting || !email.trim()} loading={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </AuthButton>
          </AuthCard>
        </>
      )}
    </AuthShell>
  )
}

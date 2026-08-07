'use client'

import { useEffect, useState } from 'react'
import { AuthButton } from './AuthButton'

const COOLDOWN_SECONDS = 20

/**
 * A resend action a user might genuinely click more than once (link didn't
 * arrive, went to spam, they mistyped the request) — always the calm static
 * variant, never the one-time spinning CTA. A short cooldown after each send
 * discourages accidental double-sends without needing any server-side rate
 * limiting of its own (Supabase still rate-limits the underlying call).
 */
export function AuthResendButton({ onResend, sentLabel = 'Sent' }: { onResend: () => Promise<unknown>; sentLabel?: string }) {
  const [isSending, setIsSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleClick = async () => {
    setIsSending(true)
    try {
      await onResend()
      setCooldown(COOLDOWN_SECONDS)
    } finally {
      setIsSending(false)
    }
  }

  const disabled = isSending || cooldown > 0

  return (
    <AuthButton variant="calm" type="button" onClick={handleClick} disabled={disabled}>
      {isSending ? 'Sending…' : cooldown > 0 ? `${sentLabel}, resend in ${cooldown}s` : 'Resend email'}
    </AuthButton>
  )
}

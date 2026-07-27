import Link from 'next/link'
import type { ReactNode } from 'react'
import { FOCUS } from '@/components/dash/tokens'

const SHARED = 'inline-flex h-12 w-full items-center justify-center gap-2 rounded-[9999px] px-8 font-nebula-tech text-[13px] font-medium uppercase tracking-[0.14em]'

/**
 * The auth tier's one button component, in two motion variants:
 *
 * - `primary` — the flow's single most-important, click-once action (sign in,
 *   create account, send reset link, accept an invite). Gets the tier's full
 *   spinning-border `.nebula-cta` treatment — a decorative, one-time moment,
 *   not something clicked repeatedly.
 * - `calm` — everything a user might click more than once in the same flow
 *   (Continue between onboarding steps, Back, Resend). Uses `.nebula-cta-static`:
 *   same gradient-border language, no looping animation.
 *
 * `isComplete` only applies to `primary`: before the form has enough input to
 * submit, it renders as an inert pill instead of the shiny CTA, so the flashy
 * treatment reads as "ready to go," not decoration on a button that will just
 * reject the click.
 */
export function AuthButton({
  children,
  variant = 'primary',
  href,
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  isComplete = true,
}: {
  children: ReactNode
  variant?: 'primary' | 'calm'
  href?: string
  type?: 'submit' | 'button'
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  isComplete?: boolean
}) {
  if (variant === 'primary' && !isComplete) {
    return (
      <button type={type} disabled className={`${SHARED} cursor-not-allowed bg-white/[0.04] text-zinc-500 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]`}>
        {children}
      </button>
    )
  }

  const variantClass =
    variant === 'primary'
      ? `nebula-cta nebula-cta--wide text-white transition-[transform,box-shadow] duration-500 hover:shadow-[0_0_40px_-12px_rgba(234,88,12,0.55)]`
      : `nebula-cta-static text-zinc-100`

  const cls = `${SHARED} ${variantClass} ${FOCUS}`
  const label = <span className="nebula-cta__label gap-2">{children}</span>

  if (href) {
    return (
      <Link href={href} className={cls}>
        {label}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} aria-busy={loading || undefined} className={cls}>
      {label}
    </button>
  )
}

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

/**
 * The one pill/badge recipe, replacing 5 different variants that had
 * drifted across TrustBand (bordered uppercase mono), LandingPricing
 * (filled non-uppercase, no border), and the Pricing page's hero badge
 * (a fifth variant matching neither). Standardized on TrustBand's
 * bordered-uppercase-mono recipe — the more distinctive, on-brand one.
 */
export function Badge({
  children,
  variant = 'outline',
  className,
}: {
  children: ReactNode
  variant?: 'outline' | 'filled'
  className?: string
}) {
  return (
    <span
      className={cn(
        'font-label inline-flex items-center rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-wide',
        variant === 'filled' ? 'border border-lavender bg-lavender text-black' : 'border border-fog text-graphite',
        className,
      )}
    >
      {children}
    </span>
  )
}

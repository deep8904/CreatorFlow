'use client'

import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { useToastList, type ToastVariant } from '@/lib/toast'

/**
 * Severity communicated by weight/icon, not by introducing a red hue —
 * matching the convention already used for the Deals contract-review
 * severity tiers. success = green accent, error = solid carbon (heaviest
 * weight = most serious), info = neutral graphite. Icon color carries
 * severity instead of a left border accent (impeccable audit 2026-07-25
 * flagged the prior side-tab border as the classic AI-generated-UI tell).
 */
const styleByVariant: Record<ToastVariant, { icon: typeof CheckCircle2; iconColor: string }> = {
  success: { icon: CheckCircle2, iconColor: 'text-lavender' },
  error: { icon: AlertTriangle, iconColor: 'text-negative' },
  info: { icon: Info, iconColor: 'text-graphite' },
}

export function ToastViewport() {
  const { toasts, dismiss } = useToastList()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-full max-w-[360px]">
      {toasts.map((t) => {
        const { icon: Icon, iconColor } = styleByVariant[t.variant]
        return (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className="flex items-start gap-3 rounded-xl border border-fog bg-paper-white px-4 py-3.5"
            style={{ boxShadow: 'var(--shadow-panel)' }}
          >
            <Icon size={16} className={`${iconColor} shrink-0 mt-0.5`} />
            <p className="text-[13px] text-carbon leading-snug flex-1">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 text-ash hover:text-carbon transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

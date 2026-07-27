'use client'

import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { useToastList, type ToastVariant } from '@/lib/toast'
import { FOCUS_INSET, HOVER } from '@/components/dash/tokens'

/**
 * Severity communicated by icon + color, not a left border accent (the
 * classic AI-generated-UI tell). success = emerald, error = orange (the
 * system's one accent — matches the destructive-state usage elsewhere in
 * Nebula rather than introducing a separate red), info = neutral zinc.
 */
const styleByVariant: Record<ToastVariant, { icon: typeof CheckCircle2; iconColor: string }> = {
  success: { icon: CheckCircle2, iconColor: 'text-emerald-400' },
  error: { icon: AlertTriangle, iconColor: 'text-orange-400' },
  info: { icon: Info, iconColor: 'text-zinc-400' },
}

export function ToastViewport() {
  const { toasts, dismiss } = useToastList()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex w-full max-w-[360px] flex-col gap-2">
      {toasts.map((t) => {
        const { icon: Icon, iconColor } = styleByVariant[t.variant]
        return (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className="nebula-border relative flex items-start gap-3 overflow-hidden rounded-[14px] bg-[#0a0a0b]/95 px-4 py-3.5 backdrop-blur-xl"
            style={{ boxShadow: '0 20px 50px -20px rgba(0,0,0,0.7)' }}
          >
            <Icon size={16} className={`${iconColor} mt-0.5 shrink-0`} />
            <p className="flex-1 font-nebula-ui text-[13px] leading-snug text-zinc-200">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className={`shrink-0 text-zinc-500 hover:text-white ${HOVER} ${FOCUS_INSET}`}
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

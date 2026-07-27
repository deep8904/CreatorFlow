'use client'

import type { CSSProperties, ReactNode } from 'react'
import { X } from 'lucide-react'
import { useEscapeKey } from '@/lib/useEscapeKey'
import { FOCUS_INSET, HOVER } from './tokens'

/**
 * Glass modal shell shared by every add/edit form (Deal, Idea). One
 * backdrop-filter layer — this is the leaf surface, so nesting inside a
 * blurred Panel can't happen since modals portal-style overlay everything.
 */
export function GlassModal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEscapeKey(onClose)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="nebula-border relative max-h-[85vh] w-full max-w-[440px] overflow-y-auto rounded-[1.25rem] bg-[#0e0e10] p-6 backdrop-blur-xl"
        style={
          {
            '--nebula-border-gradient':
              'linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.03) 50%, rgba(234,88,12,0.1))',
          } as CSSProperties
        }
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-nebula-heading text-[16px] font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`grid h-8 w-8 place-items-center rounded-[9999px] text-zinc-500 hover:bg-white/[0.08] hover:text-white ${HOVER} ${FOCUS_INSET}`}
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default GlassModal

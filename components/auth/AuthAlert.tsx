'use client'

import { useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'

export function AuthAlert({ message }: { message: string | null }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (message) ref.current?.focus()
  }, [message])

  return (
    <div ref={ref} tabIndex={-1} role="alert" className="outline-none" aria-hidden={!message}>
      {message && (
        <div className="flex items-start gap-2.5 rounded-[12px] bg-rose-500/[0.09] px-3.5 py-3 text-left shadow-[inset_0_0_0_1px_rgba(244,63,94,0.30)]">
          <AlertCircle aria-hidden size={15} className="mt-px shrink-0 text-rose-400" strokeWidth={2} />
          <p className="font-nebula-ui text-[12.5px] leading-relaxed text-rose-200">{message}</p>
        </div>
      )}
    </div>
  )
}

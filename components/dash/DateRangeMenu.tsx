'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Calendar, Check, ChevronDown } from 'lucide-react'
import { FOCUS, HOVER } from './tokens'

const OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

/**
 * Genuinely functional, not decorative — writes `?range=` and the trend
 * chart on the page reads real `getChannelStats(days)` rows for it. No
 * fake filtering over static numbers.
 */
export function DateRangeMenu({ current }: { current: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = OPTIONS.find((o) => o.value === current) ?? OPTIONS[0]

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('range', value)
    router.push(`/dashboard?${params.toString()}`)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-9 items-center gap-2 rounded-[9999px] border border-white/10 bg-white/[0.04] px-3.5 font-nebula-ui text-[12.5px] font-medium text-zinc-200 hover:bg-white/[0.07] ${HOVER} ${FOCUS}`}
      >
        <Calendar size={13} strokeWidth={2} className="text-zinc-500" />
        {selected.label}
        <ChevronDown size={13} strokeWidth={2} className={`text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[160px] rounded-[12px] border border-white/10 bg-[#141416] p-1.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)]"
        >
          {OPTIONS.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === current}
                onClick={() => select(o.value)}
                className={`flex w-full items-center justify-between gap-2 rounded-[8px] px-2.5 py-1.5 font-nebula-ui text-[12.5px] ${HOVER} ${FOCUS} ${
                  o.value === current ? 'text-white' : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {o.label}
                {o.value === current && <Check size={13} strokeWidth={2.5} className="text-orange-400" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DateRangeMenu

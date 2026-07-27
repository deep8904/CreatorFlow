import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { EASE, FOCUS_INSET } from './tokens'

const TONE_CLASS = {
  default: 'bg-white/[0.06] text-zinc-300',
  accent: 'bg-orange-500/[0.15] text-orange-300',
  positive: 'bg-emerald-400/[0.12] text-emerald-300',
} as const

export function Pill({ tone = 'default', children }: { tone?: keyof typeof TONE_CLASS; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-[9999px] px-2.5 py-1 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.08em] ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  )
}

/** A pill that's also a toggle button — status pickers, stage-move actions. */
export function PillButton({
  active,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center rounded-[9999px] px-2.5 py-1.5 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.08em] transition-all duration-150 ${EASE} ${FOCUS_INSET} disabled:opacity-50 ${
        active ? 'bg-orange-500/[0.18] text-orange-300' : 'bg-white/[0.05] text-zinc-400 hover:bg-white/[0.09] hover:text-zinc-200'
      } ${className}`}
    />
  )
}

export default Pill

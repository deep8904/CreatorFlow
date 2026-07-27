'use client'

import type { InputHTMLAttributes, ReactNode } from 'react'

export type AuthFieldProps = {
  id: string
  label: string
  hint?: string
  error?: string
  /** Marks the field aria-invalid (and recolors its hairline) without rendering its own
   *  error text — for screens where the message already lives in a shared AuthAlert below
   *  the form (e.g. reset-password's two client-side checks). */
  invalid?: boolean
  labelSuffix?: ReactNode
  trailing?: ReactNode
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>

// A dedicated field recipe for the auth/marketing tier rather than the console's dense
// FieldInput/FieldLabel: full-page auth forms sit at a bigger type scale (16px input text
// avoids iOS auto-zoom on focus) and bigger touch targets than the dashboard's tables and
// panels, matching the deliberate two-tier density split this design system already draws
// between "console" and everywhere else.
export function AuthField({ id, label, hint, error, invalid, labelSuffix, trailing, ...rest }: AuthFieldProps) {
  const isInvalid = Boolean(error) || invalid
  return (
    <div className="flex flex-col gap-2 text-left">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-nebula-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-zinc-400">
          {label}
        </label>
        {labelSuffix}
      </div>
      <div className="relative">
        <input
          id={id}
          {...rest}
          aria-invalid={isInvalid ? true : undefined}
          aria-describedby={[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined}
          className={`h-12 w-full rounded-[12px] bg-white/[0.03] px-4 font-nebula-ui text-[16px] leading-[1.4] text-zinc-100 placeholder:text-zinc-600 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09)] outline-none transition-[background-color,box-shadow] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/[0.045] focus:bg-white/[0.05] focus:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 disabled:cursor-not-allowed disabled:opacity-50 ${
            isInvalid ? 'shadow-[inset_0_0_0_1px_rgba(251,113,133,0.55)]' : ''
          } ${trailing ? 'pr-11' : ''}`}
        />
        {trailing}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="font-nebula-ui text-[12px] text-zinc-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="font-nebula-ui text-[12.5px] font-medium text-rose-300">
          {error}
        </p>
      )}
    </div>
  )
}

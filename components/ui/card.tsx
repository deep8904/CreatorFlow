import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

/**
 * The one card/panel component. Wires the --shadow-panel/--shadow-subtle
 * tokens (defined in globals.css, previously unused everywhere) to a real
 * call site, replacing 4+ hand-typed boxShadow recipes that had drifted
 * from each other and from the tokens.
 */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'panel' | 'subtle' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const shadowByVariant = {
  panel: { boxShadow: 'var(--shadow-panel)' },
  subtle: { boxShadow: 'var(--shadow-subtle)' },
  flat: undefined,
}

const paddingClass = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({ variant = 'panel', padding = 'md', className, style, ...props }: CardProps) {
  return (
    <div
      className={cn('bg-paper-white border border-fog rounded-xl', paddingClass[padding], className)}
      style={{ ...shadowByVariant[variant], ...style }}
      {...props}
    />
  )
}

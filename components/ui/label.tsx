import { cn } from '@/lib/utils'
import type { LabelHTMLAttributes } from 'react'

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('font-label mb-1.5 block text-[10.5px] font-semibold uppercase tracking-widest text-ash', className)}
      {...props}
    />
  )
}

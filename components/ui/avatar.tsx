import { cn } from '@/lib/utils'

/**
 * Colored initials chip. Standardizes the rounded-full vs rounded-xl split
 * found across Team/Settings/Sidebar (circle) vs Dashboard/Deals (squircle)
 * on rounded-full — the majority usage for this role.
 */

const sizeClass = {
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-8 h-8 text-[12px]',
  lg: 'w-12 h-12 text-[16px]',
}

function initialsFrom(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '—'
  )
}

export function Avatar({
  name,
  size = 'md',
  tone = 'accent',
  className,
}: {
  name: string
  size?: keyof typeof sizeClass
  /** 'neutral' for not-yet-a-real-member states (e.g. a pending invite). */
  tone?: 'accent' | 'neutral'
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center shrink-0 font-bold',
        tone === 'accent' ? 'bg-lavender/10 text-lavender' : 'bg-fog text-graphite',
        sizeClass[size],
        className,
      )}
    >
      {initialsFrom(name)}
    </div>
  )
}

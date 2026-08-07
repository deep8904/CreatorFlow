import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { FOCUS_INSET, HOVER } from './tokens'

/**
 * Shared glass-card chrome for every dashboard region: chart panels, the
 * table, the AI Assistant, the breakdown list. One `backdrop-blur` layer —
 * this is the leaf surface, nothing inside a Panel is itself blurred, so
 * nesting can't happen no matter how panels compose.
 */
export function Panel({
  title,
  titleId,
  eyebrow,
  action,
  children,
  className = '',
}: {
  title: string
  titleId?: string
  eyebrow?: string
  action?: { label: string; href: string }
  children: ReactNode
  className?: string
}) {
  return (
    <section
      aria-labelledby={titleId}
      className={`nebula-border relative flex flex-col overflow-hidden rounded-[1.25rem] bg-white/[0.03] backdrop-blur-xl ${className}`}
      style={
        {
          '--nebula-border-gradient':
            'linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02) 50%, rgba(234,88,12,0.08))',
        } as CSSProperties
      }
    >
      <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-4 pb-3">
        <div className="min-w-0">
          {eyebrow && (
            <p className="font-nebula-mono text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
              {eyebrow}
            </p>
          )}
          <h2 id={titleId} className="truncate font-nebula-heading text-[14.5px] font-semibold text-white">
            {title}
          </h2>
        </div>
        {action && (
          <Link
            href={action.href}
            className={`shrink-0 font-nebula-ui text-[12px] font-medium text-orange-400 hover:text-orange-300 ${HOVER} ${FOCUS_INSET} rounded-[6px] px-1.5 py-1`}
          >
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

export default Panel

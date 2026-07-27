import { forwardRef, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AuthHeading } from './AuthHeading'

// Hook-free — usable from both 'use client' pages and the server-rendered accept-invite
// page. Forwards its ref so a page can focus it on mount (e.g. after a step change lands
// on a confirmation state) without this file needing hooks of its own.
export const AuthNotice = forwardRef<
  HTMLDivElement,
  {
    icon: LucideIcon
    tone?: 'accent' | 'neutral'
    title: string
    body?: ReactNode
    children?: ReactNode
  }
>(function AuthNotice({ icon: Icon, tone = 'neutral', title, body, children }, ref) {
  return (
    <div ref={ref} role="status" tabIndex={-1} className="auth-enter flex flex-col items-center gap-6 text-center outline-none">
      <div
        aria-hidden
        className={`grid h-14 w-14 place-items-center rounded-[1rem] bg-white/[0.04] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)] ${
          tone === 'accent' ? 'text-orange-400' : 'text-zinc-300'
        }`}
      >
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <AuthHeading title={title} subtitle={body} />
      {children}
    </div>
  )
})

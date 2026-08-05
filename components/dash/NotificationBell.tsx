import Link from 'next/link'
import { Bell } from 'lucide-react'
import { FOCUS_INSET, HOVER } from './tokens'

/**
 * Honest reminders — a persistent, always-visible count of things that
 * genuinely need this person's attention (deals overdue/due soon, drafts
 * awaiting their review, or their own drafts sent back for changes), not a
 * fake "email reminder" toggle. No notification infra exists in this
 * project (no cron, no email sender), so this stays a real, live-computed
 * in-app signal instead of promising delivery it can't back up.
 */
export function NotificationBell({
  count,
  href = '/deals',
  label,
  size = 'default',
}: {
  count: number
  href?: string
  label?: string
  size?: 'default' | 'compact'
}) {
  const dim = size === 'compact' ? 'h-9 w-9' : 'h-10 w-10'
  const description = label ?? (count > 0 ? `${count} item${count === 1 ? '' : 's'} need attention` : 'Nothing needs attention right now')
  return (
    <Link
      href={href}
      aria-label={description}
      title={description}
      className={`relative grid ${dim} shrink-0 place-items-center rounded-[9999px] text-zinc-400 hover:bg-white/[0.06] hover:text-white ${HOVER} ${FOCUS_INSET}`}
    >
      <Bell size={17} strokeWidth={2} />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute right-1.5 top-1.5 grid h-4 min-w-[16px] place-items-center rounded-[9999px] bg-orange-500 px-1 font-nebula-mono text-[9px] font-bold leading-none text-white"
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}

export default NotificationBell

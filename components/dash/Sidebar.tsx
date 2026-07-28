'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronsLeft, LogOut } from 'lucide-react'
import { Mark } from './Mark'
import { NotificationBell } from './NotificationBell'
import { primaryNav, secondaryNav, isActiveHref } from './nav'
import { EASE, FOCUS_INSET, HOVER } from './tokens'
import { signOut } from '@/lib/supabase/auth'
import { canAccessModule } from '@/lib/roles'
import type { Role } from '@/lib/supabase/types'

/**
 * Desktop nav rail. Collapses to an icon-only strip (a real structural
 * change, not a decoration) — state lives in this client component only,
 * so a collapse never round-trips through the server.
 */
export function Sidebar({
  name,
  email,
  urgentCount,
  role,
}: {
  name: string
  email: string
  urgentCount: number
  role: Role
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const initial = (name || email || '?').trim().charAt(0).toUpperCase()
  const visiblePrimaryNav = primaryNav.filter((item) => canAccessModule(role, item.module))
  const visibleSecondaryNav = secondaryNav.filter((item) => canAccessModule(role, item.module))

  return (
    <aside
      className={`console-nudge hidden shrink-0 flex-col border-r border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-[width] duration-200 ${EASE} md:flex ${
        collapsed ? 'w-[76px]' : 'w-[248px]'
      }`}
    >
      <div className={`flex h-16 shrink-0 items-center gap-2.5 px-4 ${collapsed ? 'flex-col justify-center gap-2 py-2' : ''}`}>
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Mark />
          {!collapsed && (
            <span className="truncate font-nebula-heading text-[15px] font-semibold tracking-[-0.02em] text-white">
              CreatorFlow
            </span>
          )}
        </div>
        {!collapsed && canAccessModule(role, 'deals') && <NotificationBell count={urgentCount} size="compact" />}
      </div>

      <nav aria-label="Primary" className="console-scroll flex-1 overflow-y-auto px-3 py-2">
        <ul className="flex flex-col gap-0.5">
          {visiblePrimaryNav.map((item) => {
            const active = isActiveHref(pathname, item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className={`group relative flex h-10 items-center gap-3 rounded-[10px] px-3 font-nebula-ui text-[13px] font-medium ${HOVER} ${FOCUS_INSET} ${
                    active
                      ? 'bg-orange-500/[0.12] text-white'
                      : 'text-zinc-400 hover:bg-white/[0.05] hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-[9999px] bg-gradient-to-b from-orange-400 to-orange-600"
                    />
                  )}
                  <Icon size={17} strokeWidth={2} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>

        <div aria-hidden className="console-rule-x my-3" />

        <ul className="flex flex-col gap-0.5">
          {visibleSecondaryNav.map((item) => {
            const active = isActiveHref(pathname, item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className={`flex h-10 items-center gap-3 rounded-[10px] px-3 font-nebula-ui text-[13px] font-medium ${HOVER} ${FOCUS_INSET} ${
                    active
                      ? 'bg-orange-500/[0.12] text-white'
                      : 'text-zinc-400 hover:bg-white/[0.05] hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon size={17} strokeWidth={2} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-white/[0.06] p-3">
        <div className={`flex items-center gap-2.5 rounded-[10px] px-1 py-1.5 ${collapsed ? 'justify-center' : ''}`}>
          <span
            aria-hidden
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[9999px] bg-white/[0.06] font-nebula-ui text-[12px] font-semibold text-zinc-200"
          >
            {initial}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate font-nebula-ui text-[12.5px] font-medium text-zinc-100">{name}</span>
              <span className="block truncate font-nebula-ui text-[11px] text-zinc-500">{email}</span>
            </span>
          )}
          <button
            type="button"
            onClick={async () => {
              await signOut()
              router.push('/')
              router.refresh()
            }}
            aria-label="Sign out"
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-[8px] text-zinc-500 hover:bg-white/[0.06] hover:text-white ${HOVER} ${FOCUS_INSET}`}
          >
            <LogOut size={15} strokeWidth={2} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-pressed={collapsed}
          className={`mt-1 flex h-8 w-full items-center justify-center gap-2 rounded-[8px] text-zinc-500 hover:bg-white/[0.05] hover:text-white ${HOVER} ${FOCUS_INSET}`}
        >
          <ChevronsLeft
            size={14}
            strokeWidth={2}
            className={`transition-transform duration-200 ${EASE} ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

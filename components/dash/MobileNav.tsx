'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut } from 'lucide-react'
import { Mark } from './Mark'
import { NotificationBell } from './NotificationBell'
import { primaryNav, secondaryNav, isActiveHref } from './nav'
import { FOCUS_INSET, HOVER, EASE } from './tokens'
import { signOut } from '@/lib/supabase/auth'
import { canAccessModule } from '@/lib/roles'
import type { Role } from '@/lib/supabase/types'

type Ctx = { open: boolean; setOpen: (v: boolean) => void }
const MobileNavCtx = createContext<Ctx | null>(null)

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Route change is the one thing that must always close the drawer,
  // independent of how it was opened. Adjusted during render via a second
  // state slot (React's "reset state when a value changes" pattern) rather
  // than a ref — this project's stricter react-hooks/refs rule forbids
  // mutating a ref during render, and an effect would trip
  // react-hooks/set-state-in-effect.
  const [lastPathname, setLastPathname] = useState(pathname)
  if (lastPathname !== pathname) {
    setLastPathname(pathname)
    if (open) setOpen(false)
  }

  return <MobileNavCtx.Provider value={{ open, setOpen }}>{children}</MobileNavCtx.Provider>
}

function useMobileNav() {
  const ctx = useContext(MobileNavCtx)
  if (!ctx) throw new Error('useMobileNav must be used within MobileNavProvider')
  return ctx
}

export function MobileTopBar({ urgentCount, role }: { urgentCount: number; role: Role }) {
  const { setOpen } = useMobileNav()
  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] px-4 md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-[9px] text-zinc-300 hover:bg-white/[0.06] ${HOVER} ${FOCUS_INSET}`}
      >
        <Menu size={18} strokeWidth={2} />
      </button>
      <Mark size={22} />
      <span className="min-w-0 flex-1 truncate font-nebula-heading text-[14px] font-semibold text-white">
        CreatorFlow
      </span>
      {canAccessModule(role, 'deals') && <NotificationBell count={urgentCount} size="compact" />}
    </div>
  )
}

export function MobileNavDrawer({ name, email, role }: { name: string; email: string; role: Role }) {
  const { open, setOpen } = useMobileNav()
  const pathname = usePathname()
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerFocusRef = useRef<HTMLElement | null>(null)
  const initial = (name || email || '?').trim().charAt(0).toUpperCase()
  const visiblePrimaryNav = primaryNav.filter((item) => canAccessModule(role, item.module))
  const visibleSecondaryNav = secondaryNav.filter((item) => canAccessModule(role, item.module))

  useEffect(() => {
    if (open) {
      triggerFocusRef.current = document.activeElement as HTMLElement
      closeRef.current?.focus()
    } else {
      triggerFocusRef.current?.focus?.()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, setOpen])

  return (
    <div className="md:hidden">
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`console-drawer fixed inset-0 z-40 bg-black/70 transition-opacity duration-200 ${EASE} ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        inert={!open}
        className={`console-drawer fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-[#0a0a0b] pb-[env(safe-area-inset-bottom)] transition-transform duration-200 ${EASE} ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 px-4">
          <span className="flex items-center gap-2.5">
            <Mark size={22} />
            <span className="font-nebula-heading text-[14px] font-semibold text-white">CreatorFlow</span>
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-[9px] text-zinc-400 hover:bg-white/[0.06] hover:text-white ${HOVER} ${FOCUS_INSET}`}
          >
            <X size={18} strokeWidth={2} />
          </button>
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
                    className={`flex h-11 items-center gap-3 rounded-[10px] px-3 font-nebula-ui text-[14px] font-medium ${HOVER} ${FOCUS_INSET} ${
                      active ? 'bg-orange-500/[0.12] text-white' : 'text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <Icon size={18} strokeWidth={2} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
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
                    className={`flex h-11 items-center gap-3 rounded-[10px] px-3 font-nebula-ui text-[14px] font-medium ${HOVER} ${FOCUS_INSET} ${
                      active ? 'bg-orange-500/[0.12] text-white' : 'text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <Icon size={18} strokeWidth={2} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2.5 border-t border-white/[0.06] px-4 py-3">
          <span
            aria-hidden
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[9999px] bg-white/[0.06] font-nebula-ui text-[12px] font-semibold text-zinc-200"
          >
            {initial}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-nebula-ui text-[12.5px] font-medium text-zinc-100">{name}</span>
            <span className="block truncate font-nebula-ui text-[11px] text-zinc-500">{email}</span>
          </span>
          <button
            type="button"
            onClick={async () => {
              setOpen(false)
              await signOut()
              router.push('/')
              router.refresh()
            }}
            aria-label="Sign out"
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-[9px] text-zinc-500 hover:bg-white/[0.06] hover:text-white ${HOVER} ${FOCUS_INSET}`}
          >
            <LogOut size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}

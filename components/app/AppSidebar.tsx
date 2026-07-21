'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Handshake, Lightbulb, FileText, Repeat2,
  Zap, BarChart2, Users, Settings, LogOut, Menu, X,
} from 'lucide-react'
import { signOut } from '@/lib/supabase/auth'
import { Logo } from '@/components/ui/logo'
import { Avatar } from '@/components/ui/avatar'

const primaryNav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Deals', href: '/deals', icon: Handshake },
  { label: 'Ideas', href: '/ideas', icon: Lightbulb },
  { label: 'Drafts', href: '/drafts', icon: FileText },
  { label: 'Repurpose', href: '/repurpose', icon: Repeat2 },
  { label: 'Automations', href: '/automations', icon: Zap },
  { label: 'Analytics', href: '/analytics', icon: BarChart2 },
]

const secondaryNav = [
  { label: 'Team', href: '/team', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function AppSidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* Mobile top bar — the sidebar itself is off-canvas below md */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 flex items-center justify-between px-4 border-b border-fog bg-linen">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={20} className="shrink-0" />
          <span className="text-[15px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>
            CreatorFlow
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-graphite hover:bg-mist hover:text-carbon"
        >
          <Menu size={20} />
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-carbon/30"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-64 md:w-56 shrink-0 border-r border-fog bg-linen flex flex-col h-screen fixed md:sticky top-0 z-50 md:z-auto transition-transform duration-200 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >

      {/* Logo — matches the marketing site's mark exactly, not a variant */}
      <div className="px-4 h-14 flex items-center justify-between border-b border-fog">
        <Link href="/" className="group flex items-center gap-2.5">
          <Logo size={20} className="shrink-0 transition-transform duration-500 ease-out group-hover:rotate-90" />
          <span className="text-[15px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>
            CreatorFlow
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
          className="md:hidden rounded-lg p-1.5 text-ash hover:bg-mist hover:text-carbon"
        >
          <X size={18} />
        </button>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
        {primaryNav.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                active
                  ? 'bg-paper-white text-carbon shadow-[rgba(0,0,0,0.06)_0px_1px_2px_0px]'
                  : 'text-graphite hover:text-carbon hover:bg-paper-white/70'
              }`}
              style={{ letterSpacing: '-0.25px' }}
            >
              <Icon
                size={15}
                strokeWidth={active ? 2.25 : 2}
                className={active ? 'text-lavender' : 'text-ash'}
              />
              {label}
            </Link>
          )
        })}

        <div className="my-2 mx-1 border-t border-fog" />

        {secondaryNav.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                active
                  ? 'bg-paper-white text-carbon shadow-[rgba(0,0,0,0.06)_0px_1px_2px_0px]'
                  : 'text-graphite hover:text-carbon hover:bg-paper-white/70'
              }`}
              style={{ letterSpacing: '-0.25px' }}
            >
              <Icon
                size={15}
                strokeWidth={active ? 2.25 : 2}
                className={active ? 'text-lavender' : 'text-ash'}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-3 border-t border-fog">
        <div className="flex items-center gap-3">
          <Avatar name={name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-carbon truncate" style={{ letterSpacing: '-0.25px' }}>
              {name}
            </p>
            <p className="text-[11px] text-ash truncate">{email}</p>
          </div>
          <button
            onClick={async () => {
              await signOut()
              router.push('/')
              router.refresh()
            }}
            aria-label="Sign out"
            title="Sign out"
            className="shrink-0 rounded-full p-1.5 text-ash transition-colors hover:bg-linen hover:text-carbon"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
      </aside>
    </>
  )
}

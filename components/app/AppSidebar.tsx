'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Handshake, Lightbulb, FileText, Repeat2,
  Zap, BarChart2, Users, Settings, ArrowRight,
} from 'lucide-react'

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
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '—'

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="w-56 shrink-0 border-r border-fog bg-linen flex flex-col h-screen sticky top-0">

      {/* Logo */}
      <div className="px-4 h-14 flex items-center border-b border-fog">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-lavender flex items-center justify-center">
            <ArrowRight size={13} stroke="#fff" strokeWidth={2} />
          </div>
          <span className="text-[15px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>
            CreatorFlow
          </span>
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
        {primaryNav.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                active
                  ? 'bg-paper-white text-carbon shadow-[rgba(0,0,0,0.06)_0px_1px_2px_0px]'
                  : 'text-graphite hover:text-carbon hover:bg-paper-white/70'
              }`}
              style={{ letterSpacing: '-0.25px' }}
            >
              <Icon
                size={15}
                strokeWidth={active ? 2.2 : 1.8}
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
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                active
                  ? 'bg-paper-white text-carbon shadow-[rgba(0,0,0,0.06)_0px_1px_2px_0px]'
                  : 'text-graphite hover:text-carbon hover:bg-paper-white/70'
              }`}
              style={{ letterSpacing: '-0.25px' }}
            >
              <Icon
                size={15}
                strokeWidth={active ? 2.2 : 1.8}
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
          <div className="w-8 h-8 rounded-full bg-lavender/15 flex items-center justify-center shrink-0">
            <span className="text-[12px] font-bold text-lavender">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-carbon truncate" style={{ letterSpacing: '-0.25px' }}>
              {name}
            </p>
            <p className="text-[11px] text-ash truncate">{email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

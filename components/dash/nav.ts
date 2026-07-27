import {
  LayoutGrid, Handshake, Lightbulb, FileText, Repeat2,
  Zap, LineChart, Users, Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavItem = { label: string; href: string; icon: LucideIcon }

/** The product's nine real destinations — unchanged set, fresh file. */
export const primaryNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { label: 'Deals', href: '/deals', icon: Handshake },
  { label: 'Ideas', href: '/ideas', icon: Lightbulb },
  { label: 'Drafts', href: '/drafts', icon: FileText },
  { label: 'Repurpose', href: '/repurpose', icon: Repeat2 },
  { label: 'Automations', href: '/automations', icon: Zap },
  { label: 'Analytics', href: '/analytics', icon: LineChart },
]

export const secondaryNav: NavItem[] = [
  { label: 'Team', href: '/team', icon: Users },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export const isActiveHref = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(href + '/')

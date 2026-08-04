import {
  LayoutGrid, Handshake, Lightbulb, FileText, Repeat2,
  Zap, LineChart, Users, Settings, IdCard, CalendarDays,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ModuleKey } from '@/lib/roles'

export type NavItem = { label: string; href: string; icon: LucideIcon; module: ModuleKey }

/** The product's real destinations. */
export const primaryNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid, module: 'dashboard' },
  { label: 'Deals', href: '/deals', icon: Handshake, module: 'deals' },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays, module: 'calendar' },
  { label: 'Ideas', href: '/ideas', icon: Lightbulb, module: 'ideas' },
  { label: 'Drafts', href: '/drafts', icon: FileText, module: 'drafts' },
  { label: 'Repurpose', href: '/repurpose', icon: Repeat2, module: 'repurpose' },
  { label: 'Media Kit', href: '/media-kit', icon: IdCard, module: 'mediaKit' },
  { label: 'Automations', href: '/automations', icon: Zap, module: 'automations' },
  { label: 'Analytics', href: '/analytics', icon: LineChart, module: 'analytics' },
]

export const secondaryNav: NavItem[] = [
  { label: 'Team', href: '/team', icon: Users, module: 'team' },
  { label: 'Settings', href: '/settings', icon: Settings, module: 'settings' },
]

export const isActiveHref = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(href + '/')

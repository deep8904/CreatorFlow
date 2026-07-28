import Link from 'next/link'
import type { ReactNode } from 'react'
import { Handshake, Lightbulb, FileText } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { FOCUS_INSET, HOVER } from './tokens'
import { canAccessModule, type ModuleKey } from '@/lib/roles'
import type { Role } from '@/lib/supabase/types'

const CAPTURE_ITEMS: { label: string; href: string; icon: LucideIcon; srLabel: string; module: ModuleKey }[] = [
  { label: 'Deal', href: '/deals?new=1', icon: Handshake, srLabel: 'Log a deal', module: 'deals' },
  { label: 'Idea', href: '/ideas?new=1', icon: Lightbulb, srLabel: 'Capture an idea', module: 'ideas' },
  { label: 'Draft', href: '/drafts?new=1', icon: FileText, srLabel: 'Start a draft', module: 'drafts' },
]

export function CapturePills({ role }: { role: Role }) {
  const items = CAPTURE_ITEMS.filter((item) => canAccessModule(role, item.module))
  if (items.length === 0) return null
  return (
    <div className="flex items-center gap-1.5 rounded-[9999px] border border-white/10 bg-white/[0.03] p-1">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.srLabel}
            className={`flex h-8 items-center gap-1.5 rounded-[9999px] px-2.5 font-nebula-ui text-[12px] font-medium text-zinc-300 hover:bg-white/[0.07] hover:text-white sm:px-3 ${HOVER} ${FOCUS_INSET}`}
          >
            <Icon size={14} strokeWidth={2} />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

export function DashboardHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow: string
  title: string
  description: string
  right?: ReactNode
}) {
  return (
    <header className="shrink-0 px-4 pt-5 pb-1 sm:px-6 lg:px-8 lg:pt-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-nebula-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-orange-400">
            <span aria-hidden className="h-1.5 w-1.5 rounded-[9999px] bg-orange-400" />
            {eyebrow}
          </p>
          <h1 className="mt-1.5 font-nebula-heading text-[24px] font-semibold tracking-[-0.02em] text-white sm:text-[28px]">
            {title}
          </h1>
          <p className="mt-1 font-nebula-ui text-[13px] text-zinc-500">{description}</p>
        </div>
        {right && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{right}</div>}
      </div>
    </header>
  )
}

export default DashboardHeader

'use client'

import { LayoutGrid, Kanban, CalendarDays, List } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { FOCUS_INSET, HOVER } from '@/components/dash/tokens'

export type ViewType = 'table' | 'board' | 'gallery' | 'calendar'

const VIEW_META: { type: ViewType; label: string; icon: LucideIcon }[] = [
  { type: 'table', label: 'Table', icon: List },
  { type: 'board', label: 'Board', icon: Kanban },
  { type: 'gallery', label: 'Gallery', icon: LayoutGrid },
  { type: 'calendar', label: 'Calendar', icon: CalendarDays },
]

export function ViewSwitcher({ value, onChange }: { value: ViewType; onChange: (view: ViewType) => void }) {
  return (
    <div role="tablist" aria-label="View" className="flex items-center gap-1 rounded-[9999px] border border-white/10 bg-white/[0.03] p-1">
      {VIEW_META.map((v) => {
        const Icon = v.icon
        const active = value === v.type
        return (
          <button
            key={v.type}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(v.type)}
            className={`inline-flex h-7 items-center gap-1.5 rounded-[9999px] px-3 font-nebula-ui text-[12px] font-medium ${HOVER} ${FOCUS_INSET} ${
              active ? 'bg-orange-500/[0.18] text-orange-300' : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <Icon size={12.5} strokeWidth={2} />
            <span className="hidden sm:inline">{v.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default ViewSwitcher

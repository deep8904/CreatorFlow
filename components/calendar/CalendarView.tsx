'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HOVER, FOCUS_INSET } from '@/components/dash/tokens'

/**
 * Generic month-calendar renderer — deliberately has zero knowledge of
 * Deals, Drafts, or any other record type. A caller maps its own records
 * into `CalendarItem[]` (id, date, label, tone, href) and this component
 * only ever groups/renders that shape. Stage 2.3 feeds it Deals data;
 * Stage 3.1 generalizes the same component to Ideas/Drafts by feeding it a
 * different mapping — this file shouldn't need to change for that.
 */
export type CalendarItemTone = 'default' | 'attention' | 'positive'

export type CalendarItem = {
  id: string
  /** ISO date, 'YYYY-MM-DD' — calendar-day precision, no time-of-day concept. */
  date: string
  label: string
  sublabel?: string
  tone?: CalendarItemTone
  href?: string
}

const TONE_DOT: Record<CalendarItemTone, string> = {
  default: 'bg-zinc-500',
  attention: 'bg-orange-400',
  positive: 'bg-emerald-400',
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_ITEMS_PER_DAY = 3
const GRID_CELLS = 42 // 6 weeks x 7 days — a stable grid size, simpler than trimming to 5 some months and 6 others.

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1)
  const gridStart = new Date(firstOfMonth)
  gridStart.setDate(gridStart.getDate() - gridStart.getDay())
  return Array.from({ length: GRID_CELLS }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    return d
  })
}

function ItemPill({ item }: { item: CalendarItem }) {
  const content = (
    <span className="flex min-w-0 items-center gap-1.5 rounded-[6px] px-1.5 py-1 text-left">
      <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-[9999px] ${TONE_DOT[item.tone ?? 'default']}`} />
      <span className="min-w-0 flex-1 truncate font-nebula-ui text-[11px] leading-tight text-zinc-300">
        {item.label}
        {item.sublabel && <span className="text-zinc-600"> · {item.sublabel}</span>}
      </span>
    </span>
  )

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={`block w-full truncate rounded-[6px] hover:bg-white/[0.06] ${HOVER} ${FOCUS_INSET}`}
      >
        {content}
      </Link>
    )
  }
  return <div className="w-full truncate">{content}</div>
}

export function CalendarView({
  items,
  emptyState,
  className = '',
}: {
  items: CalendarItem[]
  emptyState?: ReactNode
  className?: string
}) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const todayIso = isoDate(today)

  const itemsByDate = new Map<string, CalendarItem[]>()
  for (const item of items) {
    const list = itemsByDate.get(item.date)
    if (list) list.push(item)
    else itemsByDate.set(item.date, [item])
  }

  const goToMonth = (deltaMonths: number) => {
    const d = new Date(viewYear, viewMonth + deltaMonths, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }
  const goToToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
  }

  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(viewYear, viewMonth, 1)
  )
  const days = buildMonthGrid(viewYear, viewMonth)

  if (items.length === 0 && emptyState) {
    return <div className={`nebula-border rounded-[1.25rem] bg-white/[0.03] backdrop-blur-xl ${className}`}>{emptyState}</div>
  }

  return (
    <div className={`nebula-border overflow-hidden rounded-[1.25rem] bg-white/[0.03] backdrop-blur-xl ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
        <h2 className="font-nebula-heading text-[15px] font-semibold text-white">{monthLabel}</h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={goToToday}
            className={`inline-flex h-8 items-center rounded-[9999px] border border-white/10 px-3 font-nebula-ui text-[11.5px] font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white ${HOVER} ${FOCUS_INSET}`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            aria-label="Previous month"
            className={`grid h-8 w-8 place-items-center rounded-[9999px] text-zinc-400 hover:bg-white/[0.06] hover:text-white ${HOVER} ${FOCUS_INSET}`}
          >
            <ChevronLeft size={15} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => goToMonth(1)}
            aria-label="Next month"
            className={`grid h-8 w-8 place-items-center rounded-[9999px] text-zinc-400 hover:bg-white/[0.06] hover:text-white ${HOVER} ${FOCUS_INSET}`}
          >
            <ChevronRight size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-white/[0.06]">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center font-nebula-mono text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-600"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayIso = isoDate(day)
          const dayItems = itemsByDate.get(dayIso) ?? []
          const inCurrentMonth = day.getMonth() === viewMonth
          const isToday = dayIso === todayIso
          const visibleItems = dayItems.slice(0, MAX_ITEMS_PER_DAY)
          const overflowCount = dayItems.length - visibleItems.length

          return (
            <div
              key={dayIso}
              className={`flex min-h-[92px] flex-col gap-1 border-b border-r border-white/[0.04] p-1.5 last:border-r-0 ${
                inCurrentMonth ? '' : 'bg-black/20'
              }`}
            >
              <span
                className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[9999px] font-nebula-mono text-[10.5px] ${
                  isToday
                    ? 'bg-orange-500 font-semibold text-white'
                    : inCurrentMonth
                      ? 'text-zinc-400'
                      : 'text-zinc-700'
                }`}
              >
                {day.getDate()}
              </span>
              <div className="flex flex-col gap-0.5">
                {visibleItems.map((item) => (
                  <ItemPill key={item.id} item={item} />
                ))}
                {overflowCount > 0 && (
                  <span className="px-1.5 font-nebula-ui text-[10.5px] text-zinc-600">+{overflowCount} more</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarView

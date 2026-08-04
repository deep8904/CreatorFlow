'use client'

import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import type { Deal, Draft } from '@/lib/supabase/types'
import { CalendarView, type CalendarItem, type CalendarItemTone } from '@/components/calendar/CalendarView'
import { DashboardHeader } from '@/components/dash/DashboardHeader'
import { HOVER, FOCUS } from '@/components/dash/tokens'

type Category = 'deal_due' | 'deal_rights' | 'draft_due'

const CATEGORY_META: Record<Category, { label: string; tone: CalendarItemTone }> = {
  deal_due: { label: 'Deliverables due', tone: 'attention' },
  deal_rights: { label: 'Usage rights expiring', tone: 'default' },
  draft_due: { label: 'Drafts due', tone: 'positive' },
}

type TaggedItem = CalendarItem & { category: Category }

/**
 * Maps this app's actual records into the generic shape CalendarView
 * consumes — CalendarView itself never sees a Deal or a Draft, only
 * {id, date, label, tone, href}. This mapping step is exactly what Stage
 * 3.1 will replace/extend for Ideas: swap this function out, CalendarView
 * doesn't change.
 */
function buildItems(deals: Deal[], drafts: Draft[]): TaggedItem[] {
  const items: TaggedItem[] = []

  for (const d of deals) {
    // Deliverable due dates: only while the deal is still active work — a
    // paid or lost deal's due date isn't something to plan around anymore.
    if (d.due_date && d.status !== 'paid' && d.status !== 'lost') {
      items.push({
        id: `${d.id}-due`,
        date: d.due_date,
        label: d.brand_name ?? 'Untitled deal',
        sublabel: 'Deliverable due',
        tone: CATEGORY_META.deal_due.tone,
        href: `/deals?deal=${d.id}`,
        category: 'deal_due',
      })
    }
    // Usage-rights expiry stays relevant even after a deal is paid — the
    // rights window doesn't end when the invoice does. Only "lost" (never
    // happened) deals have nothing to expire.
    if (d.usage_rights_expires_at && d.status !== 'lost') {
      items.push({
        id: `${d.id}-rights`,
        date: d.usage_rights_expires_at,
        label: d.brand_name ?? 'Untitled deal',
        sublabel: 'Usage rights expire',
        tone: CATEGORY_META.deal_rights.tone,
        href: `/deals?deal=${d.id}`,
        category: 'deal_rights',
      })
    }
  }

  for (const dr of drafts) {
    if (dr.due_date) {
      items.push({
        id: `${dr.id}-due`,
        date: dr.due_date,
        label: dr.title,
        sublabel: 'Draft due',
        tone: CATEGORY_META.draft_due.tone,
        href: `/drafts?draft=${dr.id}`,
        category: 'draft_due',
      })
    }
  }

  return items
}

export default function CalendarBoard({
  deals,
  drafts,
  canDeals,
  canDrafts,
}: {
  deals: Deal[]
  drafts: Draft[]
  canDeals: boolean
  canDrafts: boolean
}) {
  const visibleCategories: Category[] = [
    ...(canDeals ? (['deal_due', 'deal_rights'] as const) : []),
    ...(canDrafts ? (['draft_due'] as const) : []),
  ]
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set(visibleCategories))

  const allItems = buildItems(deals, drafts)
  const visibleItems = allItems.filter((item) => visibleCategories.includes(item.category))
  const filteredItems: CalendarItem[] = visibleItems.filter((item) => activeCategories.has(item.category))

  const toggleCategory = (category: Category) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  return (
    <main id="dashboard-main" className="console-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <DashboardHeader
        eyebrow="Calendar"
        title="Calendar"
        description="Deliverables, usage-rights expiry, and draft due dates in one view."
      />

      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {visibleCategories.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            {visibleCategories.map((category) => {
              const meta = CATEGORY_META[category]
              const active = activeCategories.has(category)
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  aria-pressed={active}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-[9999px] border px-3 font-nebula-ui text-[12px] font-medium ${HOVER} ${FOCUS} ${
                    active
                      ? 'border-orange-400/60 bg-orange-500/[0.12] text-orange-300'
                      : 'border-white/10 text-zinc-400 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  {meta.label}
                </button>
              )
            })}
          </div>
        )}

        {visibleItems.length === 0 ? (
          <div className="nebula-border flex flex-col items-center gap-2 rounded-[1.25rem] bg-white/[0.03] px-6 py-16 text-center backdrop-blur-xl">
            <span aria-hidden className="grid h-11 w-11 place-items-center rounded-[9999px] bg-orange-500/10 text-orange-400">
              <CalendarDays size={18} strokeWidth={2} />
            </span>
            <p className="mt-2 font-nebula-heading text-[16px] font-semibold text-white">Nothing on the calendar yet.</p>
            <p className="font-nebula-ui text-[13px] text-zinc-500">
              {canDeals && 'Add a due date or usage-rights expiry to a deal, '}
              {canDeals && canDrafts && 'or '}
              {canDrafts && 'set a due date on a draft, '}
              and it shows up here.
            </p>
          </div>
        ) : (
          <CalendarView items={filteredItems} />
        )}
      </div>
    </main>
  )
}

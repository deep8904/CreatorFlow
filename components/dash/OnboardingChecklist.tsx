'use client'

import type { CSSProperties } from 'react'
import { useTransition } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { dismissOnboardingChecklist } from '@/lib/supabase/actions'
import { FOCUS_INSET, HOVER } from './tokens'

export type ChecklistItem = { label: string; done: boolean; href: string }

/**
 * Owner-only setup checklist on the Today Dashboard — tracks real
 * completion state (integrations/deals/ideas/team rows already fetched for
 * the page), not a separate progress record. Persists dismissal via
 * profiles.onboarding_checklist_dismissed rather than local/session state,
 * so it stays dismissed across devices and future logins.
 */
export function OnboardingChecklist({ items }: { items: ChecklistItem[] }) {
  const [isPending, startTransition] = useTransition()
  const doneCount = items.filter((i) => i.done).length
  const allDone = doneCount === items.length

  const dismiss = () => {
    startTransition(async () => {
      await dismissOnboardingChecklist()
    })
  }

  return (
    <div
      className="nebula-border relative overflow-hidden rounded-[1.25rem] bg-white/[0.03] p-5 backdrop-blur-xl"
      style={
        {
          '--nebula-border-gradient':
            'linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.02) 50%, rgba(234,88,12,0.08))',
        } as CSSProperties
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-nebula-heading text-[14.5px] font-semibold text-white">
            {allDone ? "You're all set." : 'Get set up'}
          </p>
          <p className="mt-0.5 font-nebula-ui text-[12px] text-zinc-500">
            {doneCount} of {items.length} done
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          disabled={isPending}
          className={`shrink-0 rounded-[9999px] px-2.5 py-1 font-nebula-ui text-[11.5px] font-medium text-zinc-500 hover:bg-white/[0.06] hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS_INSET}`}
        >
          Dismiss
        </button>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {items.map((item) => {
          const row = (
            <span className="flex items-center gap-2.5">
              <span
                aria-hidden
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-[9999px] border ${
                  item.done ? 'border-emerald-400 bg-emerald-400/[0.18] text-emerald-300' : 'border-white/15 text-transparent'
                }`}
              >
                <Check size={11} strokeWidth={3} />
              </span>
              <span
                className={`font-nebula-ui text-[12.5px] ${item.done ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}
              >
                {item.label}
              </span>
            </span>
          )
          return item.done ? (
            <div key={item.label} className="px-1 py-1">
              {row}
            </div>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className={`-mx-1 rounded-[8px] px-1 py-1 hover:bg-white/[0.04] ${HOVER} ${FOCUS_INSET}`}
            >
              {row}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default OnboardingChecklist

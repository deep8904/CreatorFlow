'use client'

import { useTransition } from 'react'
import { Zap, Mail, Handshake, Video, ArrowRight } from 'lucide-react'
import { toggleAutomation } from '@/lib/supabase/actions'
import type { Automation } from '@/lib/supabase/types'
import { Panel } from '@/components/dash/Panel'
import { Pill } from '@/components/dash/Pill'
import { DashboardHeader } from '@/components/dash/DashboardHeader'
import { HOVER, FOCUS_INSET } from '@/components/dash/tokens'
import { useToast } from '@/lib/toast'

const TRIGGER_META: Record<string, { label: string; icon: typeof Mail }> = {
  'gmail.sponsorship_email_detected': { label: 'Sponsorship email detected', icon: Mail },
  'deals.status_changed_to_paid': { label: 'Deal marked paid', icon: Handshake },
  'youtube.video_published': { label: 'Video published', icon: Video },
}

const ACTION_META: Record<string, string> = {
  'deals.create': 'Create a deal',
  'deals.archive_contract': 'Archive contract',
  'repurpose.suggest': 'Suggest a repurpose',
}

function triggerMeta(type: string) {
  return TRIGGER_META[type] ?? { label: type, icon: Zap }
}

export default function AutomationsBoard({ initialAutomations }: { initialAutomations: Automation[] }) {
  const [isPending, startTransition] = useTransition()
  const toast = useToast()

  const toggle = (id: string, enabled: boolean) => {
    startTransition(async () => {
      const result = await toggleAutomation(id, !enabled)
      if (result.error) toast.error(result.error)
    })
  }

  return (
    <main id="dashboard-main" className="console-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <DashboardHeader eyebrow="Automations" title="Automations" description="Save the repetitive steps." />

      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex items-start gap-3 rounded-[12px] border border-orange-500/20 bg-orange-500/[0.06] px-4 py-3">
          <Zap size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-orange-400" />
          <p className="font-nebula-ui text-[12.5px] leading-relaxed text-zinc-300">
            <span className="font-medium text-white">Preview only — none of these run.</span> Toggling saves your
            preference for later, but nothing executes today: two of these three rules need a live Gmail/YouTube
            connection this build has no production credentials for, and the trigger engine itself hasn&apos;t been
            built yet. Every rule below is inert regardless of its toggle state.
          </p>
        </div>

        {initialAutomations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] px-6 py-16 text-center">
            <span aria-hidden className="grid h-11 w-11 place-items-center rounded-[9999px] bg-orange-500/10 text-orange-400">
              <Zap size={18} strokeWidth={2} />
            </span>
            <p className="mt-2 font-nebula-heading text-[16px] font-semibold text-white">No automations set up yet.</p>
            <p className="font-nebula-ui text-[13px] text-zinc-500">
              Automations save you the repetitive steps. Turn on the ones that fit how you work.
            </p>
          </div>
        ) : (
          <Panel title="Rules" eyebrow={`${initialAutomations.length} available`} titleId="automations-list-heading">
            <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
              {initialAutomations.map((auto) => {
                const trigger = triggerMeta(auto.trigger_type)
                const TriggerIcon = trigger.icon
                const actionLabel = ACTION_META[auto.action_type] ?? auto.action_type
                return (
                  <div key={auto.id} className="flex items-start gap-4 px-5 py-4">
                    <span aria-hidden className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[9999px] bg-white/[0.06] text-zinc-300">
                      <TriggerIcon size={15} strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-nebula-ui text-[13.5px] font-medium text-zinc-100">{auto.name}</p>
                        <Pill>Preview — not running</Pill>
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 font-nebula-mono text-[10.5px] uppercase tracking-[0.08em] text-zinc-500">
                        {trigger.label}
                        <ArrowRight size={11} strokeWidth={2} className="text-zinc-600" />
                        {actionLabel}
                      </p>
                      {typeof auto.config?.description === 'string' && (
                        <p className="mt-1.5 font-nebula-ui text-[12.5px] leading-relaxed text-zinc-500">
                          {auto.config.description as string}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() => toggle(auto.id, auto.enabled)}
                        disabled={isPending}
                        role="switch"
                        aria-checked={auto.enabled}
                        aria-label={`${auto.enabled ? 'Turn off' : 'Turn on'} the saved preference for ${auto.name} — preview only, does not start it running`}
                        title="Saves your preference for when this ships — has no effect today"
                        className={`relative mt-0.5 h-6 w-10 rounded-[9999px] transition-colors disabled:opacity-50 ${HOVER} ${FOCUS_INSET} ${
                          auto.enabled ? 'bg-white/[0.28]' : 'bg-white/[0.12]'
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-[9999px] bg-white transition-transform ${HOVER} ${
                            auto.enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="whitespace-nowrap font-nebula-mono text-[9px] uppercase tracking-[0.08em] text-zinc-600">
                        {auto.enabled ? 'Preference: on' : 'Preference: off'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>
        )}
      </div>
    </main>
  )
}

'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Mail, Handshake, Video, ArrowRight, AlertTriangle, CalendarClock } from 'lucide-react'
import { toggleAutomation } from '@/lib/supabase/actions'
import type { Automation, AutomationActivity } from '@/lib/supabase/types'
import { Panel } from '@/components/dash/Panel'
import { Pill } from '@/components/dash/Pill'
import { DashboardHeader } from '@/components/dash/DashboardHeader'
import { HOVER, FOCUS_INSET } from '@/components/dash/tokens'
import { useToast } from '@/lib/toast'

const TRIGGER_META: Record<string, { label: string; icon: typeof Mail }> = {
  'gmail.sponsorship_email_detected': { label: 'Sponsorship email detected', icon: Mail },
  'deals.status_changed_to_paid': { label: 'Deal marked paid', icon: Handshake },
  'youtube.video_published': { label: 'Video published', icon: Video },
  'deals.needs_follow_up': { label: 'Deal gone quiet or invoice overdue', icon: AlertTriangle },
  'schedule.weekly_digest': { label: 'Every Monday', icon: CalendarClock },
}

const ACTION_META: Record<string, string> = {
  'deals.create': 'Create a deal',
  'deals.archive_contract': 'Archive contract',
  'repurpose.suggest': 'Suggest a repurpose',
  'deals.flag_follow_up': 'Flag for follow-up',
  'deals.summarize_week': 'Summarize the week',
}

function triggerMeta(type: string) {
  return TRIGGER_META[type] ?? { label: type, icon: Zap }
}

function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export default function AutomationsBoard({
  initialAutomations,
  activity,
  gmailReallyConnected,
}: {
  initialAutomations: Automation[]
  activity: AutomationActivity[]
  gmailReallyConnected: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const toast = useToast()

  // `activity` is already ordered newest-first, so the first row seen per
  // automation is its latest run.
  const latestActivity = new Map<string, AutomationActivity>()
  for (const row of activity) {
    if (!latestActivity.has(row.automation_id)) latestActivity.set(row.automation_id, row)
  }

  const scheduledCount = initialAutomations.filter((a) => a.schedule && a.enabled).length

  const toggle = (id: string, enabled: boolean) => {
    startTransition(async () => {
      const result = await toggleAutomation(id, !enabled)
      if (result.error) {
        toast.error(result.error)
        return
      }
      // toggleAutomation's revalidatePath marks the route stale, but this is
      // a Client Component invoking the action directly (not a <form
      // action>) — Next.js won't pick up fresh props without an explicit
      // refresh. Confirmed live: without this, the toggle visibly did
      // nothing even though the DB write succeeded.
      router.refresh()
    })
  }

  return (
    <main id="dashboard-main" className="console-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <DashboardHeader eyebrow="Automations" title="Automations" description="Save the repetitive steps." />

      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex items-start gap-3 rounded-[12px] border border-orange-500/20 bg-orange-500/[0.06] px-4 py-3">
          <Zap size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-orange-400" />
          <p className="font-nebula-ui text-[12.5px] leading-relaxed text-zinc-300">
            <span className="font-medium text-white">
              {scheduledCount > 0 && gmailReallyConnected
                ? `${scheduledCount + 1} rules are live.`
                : scheduledCount > 0
                  ? `${scheduledCount} rule${scheduledCount === 1 ? ' is' : 's are'} live.`
                  : gmailReallyConnected
                    ? 'One rule is live.'
                    : 'Turn on a rule to make it live.'}
            </span>{' '}
            The two scheduled rules (deal follow-up, Monday digest) run automatically on a real timer once turned
            on, no manual trigger needed. {gmailReallyConnected && (
              <>With Gmail connected, "New sponsorship email → Create a deal" runs when you check Gmail from the
              Deals page. </>
            )}
            The rest still need a trigger engine this build doesn&apos;t have yet, so toggling them only saves a
            preference.
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
                const isGmailLive = gmailReallyConnected && auto.trigger_type === 'gmail.sponsorship_email_detected'
                const isScheduled = !!auto.schedule
                const isLive = isGmailLive || (isScheduled && auto.enabled)
                const lastRun = latestActivity.get(auto.id)
                const liveDescription = isGmailLive
                  ? 'a real rule that creates deals from Gmail'
                  : isScheduled
                    ? `a real rule that runs automatically (${auto.schedule_label})`
                    : 'a live rule'
                return (
                  <div key={auto.id} className="flex items-start gap-4 px-5 py-4">
                    <span aria-hidden className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[9999px] bg-white/[0.06] text-zinc-300">
                      <TriggerIcon size={15} strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-nebula-ui text-[13.5px] font-medium text-zinc-100">{auto.name}</p>
                        {isLive ? <Pill tone="positive">Live</Pill> : <Pill>Preview (not running)</Pill>}
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 font-nebula-mono text-[10.5px] uppercase tracking-[0.08em] text-zinc-500">
                        {trigger.label}
                        <ArrowRight size={11} strokeWidth={2} className="text-zinc-600" />
                        {actionLabel}
                        {isScheduled && auto.schedule_label && (
                          <>
                            <span aria-hidden>·</span>
                            {auto.schedule_label}
                          </>
                        )}
                      </p>
                      {typeof auto.config?.description === 'string' && (
                        <p className="mt-1.5 font-nebula-ui text-[12.5px] leading-relaxed text-zinc-500">
                          {auto.config.description as string}
                        </p>
                      )}
                      {isGmailLive && (
                        <p className="mt-1.5 font-nebula-ui text-[11px] text-zinc-600">
                          Runs when you click &quot;Check for new deals&quot; on the Deals page, not automatic yet.
                        </p>
                      )}
                      {isScheduled && (
                        <p className="mt-1.5 font-nebula-ui text-[11px] text-zinc-600">
                          {!auto.enabled
                            ? `Off. Turn on to have this run automatically, ${auto.schedule_label?.toLowerCase()}.`
                            : lastRun
                              ? `Last checked ${timeAgo(lastRun.ran_at)}: ${lastRun.summary}`
                              : `Scheduled, ${auto.schedule_label?.toLowerCase()}, hasn't run yet.`}
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
                        aria-label={
                          isLive || isScheduled
                            ? `${auto.enabled ? 'Turn off' : 'Turn on'} ${auto.name}: ${liveDescription}`
                            : `${auto.enabled ? 'Turn off' : 'Turn on'} the saved preference for ${auto.name} (preview only, does not start it running)`
                        }
                        title={
                          isLive || isScheduled
                            ? `Real: ${liveDescription} when enabled`
                            : 'Saves your preference for when this ships. Has no effect today'
                        }
                        className={`relative mt-0.5 h-6 w-10 rounded-[9999px] transition-colors disabled:opacity-50 ${HOVER} ${FOCUS_INSET} ${
                          auto.enabled ? 'bg-orange-500' : 'bg-white/[0.12]'
                        }`}
                      >
                        <span
                          className={`absolute left-0 top-1 h-4 w-4 rounded-[9999px] bg-white transition-transform ${HOVER} ${
                            auto.enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="whitespace-nowrap font-nebula-mono text-[9px] uppercase tracking-[0.08em] text-zinc-600">
                        {isLive || isScheduled
                          ? auto.enabled
                            ? 'Automation: on'
                            : 'Automation: off'
                          : auto.enabled
                            ? 'Preference: on'
                            : 'Preference: off'}
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

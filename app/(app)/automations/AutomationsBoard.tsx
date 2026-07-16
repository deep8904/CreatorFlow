'use client'

import { useTransition } from 'react'
import { toggleAutomation } from '@/lib/supabase/actions'
import type { Automation } from '@/lib/supabase/types'

const TRIGGER_LABEL: Record<string, string> = {
  'gmail.sponsorship_email_detected': 'Gmail trigger',
  'deals.status_changed_to_paid': 'Deal trigger',
  'youtube.video_published': 'YouTube trigger',
}

export default function AutomationsBoard({ initialAutomations }: { initialAutomations: Automation[] }) {
  const [isPending, startTransition] = useTransition()

  const toggle = (id: string, enabled: boolean) => {
    startTransition(() => {
      toggleAutomation(id, !enabled)
    })
  }

  return (
    <main className="flex-1 overflow-y-auto bg-linen">
    <div className="app-container">
      <div className="mb-8">
        <h1 className="text-app-h1 text-carbon">Automations</h1>
        <p className="text-[12.5px] text-ash mt-0.5">Save the repetitive steps</p>
      </div>

      {initialAutomations.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-[14px] font-semibold text-carbon">No automations set up yet.</p>
          <p className="text-[13px] text-graphite max-w-[320px]">
            Automations save you the repetitive steps. Turn on the ones that fit how you work.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {initialAutomations.map((auto) => (
            <div
              key={auto.id}
              className="bg-paper-white border border-fog rounded-xl p-5 flex items-start gap-4"
              style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-[14px] font-semibold text-carbon">{auto.name}</p>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-fog text-graphite">
                    {TRIGGER_LABEL[auto.trigger_type] ?? auto.trigger_type}
                  </span>
                </div>
                {typeof auto.config?.description === 'string' && (
                  <p className="text-[13px] text-graphite leading-relaxed">{auto.config.description as string}</p>
                )}
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggle(auto.id, auto.enabled)}
                disabled={isPending}
                aria-label={auto.enabled ? 'Disable automation' : 'Enable automation'}
                className={`relative w-10 h-6 rounded-full transition-colors shrink-0 mt-0.5 disabled:opacity-50 ${
                  auto.enabled ? 'bg-lavender' : 'bg-fog'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-paper-white rounded-full shadow transition-transform ${
                    auto.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-[12px] text-ash mt-6">
        Custom automation rules (trigger + action builder) are coming in a future update.
      </p>
    </div>
    </main>
  )
}

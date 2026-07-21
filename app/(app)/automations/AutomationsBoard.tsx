'use client'

import { useTransition } from 'react'
import { Zap } from 'lucide-react'
import { toggleAutomation } from '@/lib/supabase/actions'
import type { Automation } from '@/lib/supabase/types'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { useToast } from '@/lib/toast'

const TRIGGER_LABEL: Record<string, string> = {
  'gmail.sponsorship_email_detected': 'Gmail trigger',
  'deals.status_changed_to_paid': 'Deal trigger',
  'youtube.video_published': 'YouTube trigger',
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
    <main className="flex-1 overflow-y-auto bg-linen">
    <div className="app-container">
      <div className="mb-8">
        <h1 className="text-app-h1 text-carbon">Automations</h1>
        <p className="text-[12.5px] text-ash mt-0.5">Save the repetitive steps</p>
      </div>

      {initialAutomations.length === 0 ? (
        <EmptyState
          icon={<Zap size={18} className="text-ash" strokeWidth={2} />}
          title="No automations set up yet."
          description="Automations save you the repetitive steps. Turn on the ones that fit how you work."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {initialAutomations.map((auto) => (
            <Card key={auto.id} variant="subtle" className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-[14px] font-semibold text-carbon">{auto.name}</p>
                  <span className="font-label text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-fog text-graphite">
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
            </Card>
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

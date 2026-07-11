'use client'

import { useState } from 'react'

interface Automation {
  id: string
  name: string
  description: string
  enabled: boolean
  category: 'Deals' | 'Content' | 'Notifications'
}

const prebuilt: Automation[] = [
  {
    id: 'deal-create',
    name: 'New sponsorship email → Create a deal',
    description: 'When Gmail detects a new brand deal email, automatically create a deal card for it.',
    enabled: true,
    category: 'Deals',
  },
  {
    id: 'deal-archive',
    name: 'Deal marked Paid → Archive contract',
    description: 'Keep your Deals view focused on what\'s active.',
    enabled: false,
    category: 'Deals',
  },
  {
    id: 'deal-followup',
    name: 'Deal in Negotiating for 7 days → Notify me',
    description: 'Get a reminder if a deal has been sitting without movement for a week.',
    enabled: true,
    category: 'Notifications',
  },
  {
    id: 'idea-from-video',
    name: 'New video published → Suggest repurposing',
    description: 'When a new video goes live on your channel, queue it for repurposing.',
    enabled: false,
    category: 'Content',
  },
]

const categoryColors: Record<Automation['category'], string> = {
  Deals: 'bg-sky/10 text-sky',
  Content: 'bg-mint-wash text-mint',
  Notifications: 'bg-amber/10 text-amber',
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>(prebuilt)

  const toggle = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a))
  }

  return (
    <main className="flex-1 overflow-y-auto bg-linen">
    <div className="max-w-[760px] mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="font-bold text-carbon" style={{ fontSize: '20px', letterSpacing: '-0.04em' }}>Automations</h1>
        <p className="text-[12.5px] text-ash mt-0.5">Save the repetitive steps. Turn on the ones that fit how you work.</p>
      </div>

      <div className="flex flex-col gap-3">
        {automations.map((auto) => (
          <div
            key={auto.id}
            className="bg-paper-white border border-fog rounded-2xl p-5 flex items-start gap-4"
            style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <p className="text-[14px] font-semibold text-carbon">{auto.name}</p>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${categoryColors[auto.category]}`}>
                  {auto.category}
                </span>
              </div>
              <p className="text-[13px] text-graphite leading-relaxed">{auto.description}</p>
            </div>

            {/* Toggle */}
            <button
              onClick={() => toggle(auto.id)}
              aria-label={auto.enabled ? 'Disable automation' : 'Enable automation'}
              className={`relative w-10 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${
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

      <p className="text-[12px] text-ash mt-6">
        Custom automation rules (trigger + action builder) are coming in a future update.
      </p>
    </div>
    </main>
  )
}

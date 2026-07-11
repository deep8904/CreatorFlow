'use client'

import { useState } from 'react'
import { X, ArrowRight, Sparkles, FileText, Pencil } from 'lucide-react'

type Stage = 'Inbound' | 'Negotiating' | 'Contracted' | 'Delivered' | 'Paid'

interface Deal {
  id: number
  brand: string
  contact: string
  deliverables: string
  rate: string
  dueDate: string
  stage: Stage
  notes: string
  initials: string
}

const stageConfig: Record<Stage, { color: string; bg: string; dot: string }> = {
  Inbound:     { color: 'text-sky',      bg: 'bg-sky/10',      dot: 'bg-sky' },
  Negotiating: { color: 'text-amber',    bg: 'bg-amber/10',    dot: 'bg-amber' },
  Contracted:  { color: 'text-lavender', bg: 'bg-lavender/10', dot: 'bg-lavender' },
  Delivered:   { color: 'text-mint',     bg: 'bg-mint-wash',   dot: 'bg-mint' },
  Paid:        { color: 'text-graphite', bg: 'bg-fog',         dot: 'bg-graphite' },
}

const STAGES: Stage[] = ['Inbound', 'Negotiating', 'Contracted', 'Delivered', 'Paid']

const sampleDeals: Deal[] = [
  { id: 1, brand: 'NordVPN',    contact: 'Sarah Chen',   deliverables: 'Dedicated 60s integration, end card, pinned comment', rate: '$4,200', dueDate: 'Jul 28', stage: 'Inbound',     notes: 'Mid-roll only, no pre-roll.',      initials: 'NV' },
  { id: 2, brand: 'Squarespace', contact: 'Mike Torres',  deliverables: '30s read, 2× YouTube videos',                         rate: '$2,800', dueDate: 'Aug 5',  stage: 'Negotiating', notes: 'Waiting on revised rate.',         initials: 'SQ' },
  { id: 3, brand: 'Skillshare', contact: 'Amy Johnson',  deliverables: '60s mid-roll, 3 videos',                               rate: '$3,500', dueDate: 'Jul 20', stage: 'Contracted',  notes: 'Contract signed Jul 10.',          initials: 'SK' },
  { id: 4, brand: 'Brilliant',  contact: 'Tom Park',     deliverables: '60s mid-roll + dedicated video',                      rate: '$5,100', dueDate: 'Jul 15', stage: 'Delivered',   notes: 'Invoice sent, net-30.',            initials: 'BR' },
  { id: 5, brand: 'ExpressVPN', contact: 'Lisa Wang',    deliverables: '30s end card, 4 videos',                              rate: '$1,800', dueDate: 'Jul 8',  stage: 'Paid',        notes: '',                                 initials: 'EV' },
  { id: 6, brand: 'Wix',        contact: 'James Lee',    deliverables: 'Dedicated video + 1 integration',                     rate: '$6,000', dueDate: 'Aug 12', stage: 'Inbound',     notes: 'First contact, very interested.',  initials: 'WX' },
]

const totalRevenue = sampleDeals.reduce((acc, d) => acc + parseInt(d.rate.replace(/\D/g, '')), 0)

export default function DealsPage() {
  const [selected, setSelected] = useState<Deal | null>(null)

  return (
    <div className="flex h-screen overflow-hidden bg-linen">

      {/* Main pipeline */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-8 py-5 border-b border-fog bg-paper-white flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-bold text-carbon" style={{ fontSize: '20px', letterSpacing: '-0.04em' }}>Deals</h1>
            <p className="text-[12.5px] text-ash mt-0.5">
              {sampleDeals.length} active · ${totalRevenue.toLocaleString()} pipeline value
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="text-[13px] font-medium text-graphite border border-fog bg-paper-white px-4 py-2 rounded-full hover:bg-linen transition-colors"
              style={{ letterSpacing: '-0.25px' }}
            >
              Connect Gmail
            </button>
            <button
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-paper-white bg-lavender px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
              style={{ boxShadow: 'rgba(145,141,246,0.3) 0px 3px 10px 0px', letterSpacing: '-0.25px' }}
            >
              Add deal <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Kanban */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-6">
          <div className="flex gap-3 h-full" style={{ minWidth: 'max-content' }}>
            {STAGES.map((stage) => {
              const stageDeals = sampleDeals.filter((d) => d.stage === stage)
              const cfg = stageConfig[stage]
              return (
                <div key={stage} className="w-[228px] shrink-0 flex flex-col gap-2.5">
                  {/* Column header */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      <span className="text-[13px] font-semibold text-carbon" style={{ letterSpacing: '-0.25px' }}>
                        {stage}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-ash bg-fog px-2 py-0.5 rounded-full">
                      {stageDeals.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-2 flex-1 overflow-y-auto pb-4 pr-0.5">
                    {stageDeals.map((deal) => (
                      <button
                        key={deal.id}
                        onClick={() => setSelected(selected?.id === deal.id ? null : deal)}
                        className={`w-full text-left bg-paper-white border rounded-2xl p-4 transition-all hover:shadow-sm ${
                          selected?.id === deal.id
                            ? 'border-lavender/50 shadow-[0_0_0_2px_rgba(145,141,246,0.15)]'
                            : 'border-fog hover:border-fog/80'
                        }`}
                        style={{ boxShadow: selected?.id === deal.id ? undefined : 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}
                      >
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <div className="w-7 h-7 rounded-xl bg-lavender/10 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-lavender">{deal.initials}</span>
                          </div>
                          <p className="text-[13.5px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>
                            {deal.brand}
                          </p>
                        </div>
                        <p className="text-[12px] text-graphite leading-snug mb-3 line-clamp-2">
                          {deal.deliverables}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-bold text-carbon" style={{ letterSpacing: '-0.3px' }}>
                            {deal.rate}
                          </span>
                          <span className="text-[11px] text-ash">Due {deal.dueDate}</span>
                        </div>
                      </button>
                    ))}

                    {stageDeals.length === 0 && (
                      <div className="border border-dashed border-fog rounded-2xl p-4 text-center">
                        <p className="text-[12px] text-ash">No deals</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <aside className="w-[320px] shrink-0 border-l border-fog bg-paper-white flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-fog shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-lavender/10 flex items-center justify-center">
                <span className="text-[11px] font-bold text-lavender">{selected.initials}</span>
              </div>
              <h2 className="text-[15px] font-bold text-carbon" style={{ letterSpacing: '-0.3px' }}>
                {selected.brand}
              </h2>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="w-7 h-7 flex items-center justify-center text-ash hover:text-carbon transition-colors rounded-lg hover:bg-linen"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex flex-col gap-5 p-5">
            {/* Stage */}
            <div className={`inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full text-[12px] font-semibold ${stageConfig[selected.stage].bg} ${stageConfig[selected.stage].color}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${stageConfig[selected.stage].dot}`} />
              {selected.stage}
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4">
              {[
                { label: 'Contact', value: selected.contact },
                { label: 'Rate', value: selected.rate },
                { label: 'Due date', value: selected.dueDate },
                { label: 'Deliverables', value: selected.deliverables },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-[10.5px] font-semibold text-ash uppercase tracking-widest mb-1">
                    {f.label}
                  </p>
                  <p className="text-[13.5px] text-carbon leading-snug" style={{ letterSpacing: '-0.25px' }}>
                    {f.value}
                  </p>
                </div>
              ))}
              {selected.notes && (
                <div>
                  <p className="text-[10.5px] font-semibold text-ash uppercase tracking-widest mb-1">
                    Notes
                  </p>
                  <p className="text-[13.5px] text-graphite leading-snug" style={{ letterSpacing: '-0.25px' }}>
                    {selected.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Move stage */}
            <div>
              <p className="text-[10.5px] font-semibold text-ash uppercase tracking-widest mb-2">
                Move to stage
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.filter((s) => s !== selected.stage).map((s) => {
                  const cfg = stageConfig[s]
                  return (
                    <button
                      key={s}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color} hover:opacity-80 transition-opacity`}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1 border-t border-fog">
              <button className="flex items-center justify-center gap-1.5 w-full text-[13px] font-semibold text-paper-white bg-lavender py-2.5 rounded-full hover:opacity-90 transition-opacity">
                <Sparkles size={13} /> Draft AI reply
              </button>
              <button className="flex items-center justify-center gap-1.5 w-full text-[13px] font-medium text-carbon border border-fog py-2.5 rounded-full hover:bg-linen transition-colors">
                <FileText size={13} className="text-graphite" /> Review contract
              </button>
              <button className="flex items-center justify-center gap-1.5 w-full text-[13px] font-medium text-graphite py-2 hover:text-carbon transition-colors">
                <Pencil size={12} /> Edit deal
              </button>
            </div>

            <p className="text-[11px] text-ash text-center" style={{ letterSpacing: '-0.15px' }}>
              AI draft is based on your rate card. Nothing sends until you approve.
            </p>
          </div>
        </aside>
      )}
    </div>
  )
}

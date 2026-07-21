'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, ArrowRight, Sparkles, FileText, Pencil, Check, AlertTriangle, Info, Handshake, Trash2, Search } from 'lucide-react'
import { updateDealStage, createDeal, updateDeal, deleteDeal, type DealFormInput } from '@/lib/supabase/actions'
import type { Deal } from '@/lib/supabase/types'
import { Avatar } from '@/components/ui/avatar'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { useToast } from '@/lib/toast'
import { useEscapeKey } from '@/lib/useEscapeKey'

const STAGE_LABEL: Record<Deal['status'], string> = {
  inbound: 'Inbound',
  negotiating: 'Negotiating',
  contracted: 'Contracted',
  delivered: 'Delivered',
  paid: 'Paid',
  lost: 'Lost',
}

const STAGES: Deal['status'][] = ['inbound', 'negotiating', 'contracted', 'delivered', 'paid', 'lost']

const stageConfig: Record<Deal['status'], { color: string; bg: string; dot: string }> = {
  inbound:     { color: 'text-graphite', bg: 'bg-fog', dot: 'bg-ash' },
  negotiating: { color: 'text-graphite', bg: 'bg-fog', dot: 'bg-ash' },
  contracted:  { color: 'text-graphite', bg: 'bg-fog', dot: 'bg-ash' },
  delivered:   { color: 'text-graphite', bg: 'bg-fog', dot: 'bg-ash' },
  paid:        { color: 'text-lavender',     bg: 'bg-lavender/10', dot: 'bg-lavender' },
  lost:        { color: 'text-ash',      bg: 'bg-fog', dot: 'bg-ash' },
}

function formatRate(cents: number | null) {
  if (cents == null) return '—'
  return `$${(cents / 100).toLocaleString()}`
}

function formatDueDate(dueDate: string | null) {
  if (!dueDate) return null
  return new Date(dueDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function aiReplyFor(deal: Deal) {
  const rate = formatRate(deal.rate_amount_cents)
  return `Hi ${deal.contact_name?.split(' ')[0] ?? 'there'},\n\nThanks for reaching out about working with ${deal.brand_name ?? 'your brand'} — I'd love to talk through it.\n\nBased on my current rate card, ${deal.deliverables ?? 'this kind of deliverable'} is typically ${rate}. Happy to hop on a quick call this week to align on scope and timeline.\n\nLooking forward to it,\nDeep`
}

function contractReviewFor(deal: Deal) {
  return [
    { level: 'critical' as const, label: 'Needs a closer look', text: 'No cap specified on usage rights — could be read as unlimited, indefinite use of the content.' },
    { level: 'risk' as const, label: 'Worth checking', text: `Payment terms aren't stated. Confirm net-30 (or better) before signing for the ${formatRate(deal.rate_amount_cents)} rate.` },
    { level: 'info' as const, label: 'For your information', text: 'Standard exclusivity clause — 30 days in-category after publish. Typical for this deal size.' },
  ]
}

/* Severity communicated by weight, not hue — critical is a solid fill,
   risk is a wash of the same accent, info is neutral. No new colors. */
const reviewStyle = {
  critical: { icon: AlertTriangle, color: 'text-carbon', bg: 'bg-lavender' },
  risk: { icon: AlertTriangle, color: 'text-lavender', bg: 'bg-lavender/10' },
  info: { icon: Info, color: 'text-graphite', bg: 'bg-fog' },
}

function DealModal({
  initial,
  onClose,
  onSubmit,
  isPending,
}: {
  initial: Deal | null
  onClose: () => void
  onSubmit: (input: DealFormInput) => void
  isPending: boolean
}) {
  useEscapeKey(onClose)
  const [brandName, setBrandName] = useState(initial?.brand_name ?? '')
  const [contactName, setContactName] = useState(initial?.contact_name ?? '')
  const [rate, setRate] = useState(initial?.rate_amount_cents ? String(initial.rate_amount_cents / 100) : '')
  const [deliverables, setDeliverables] = useState(initial?.deliverables ?? '')
  const [dueDate, setDueDate] = useState(initial?.due_date ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const submit = () => {
    if (!brandName.trim()) return
    onSubmit({
      brand_name: brandName,
      contact_name: contactName,
      rate_amount_cents: rate ? Math.round(parseFloat(rate) * 100) : null,
      deliverables,
      due_date: dueDate || null,
      notes,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-[440px] bg-paper-white border border-fog rounded-xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-bold text-carbon">{initial ? 'Edit deal' : 'Add deal'}</h2>
          <button onClick={onClose} aria-label="Close" className="w-7 h-7 flex items-center justify-center text-ash hover:text-carbon rounded-full hover:bg-linen transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          <div>
            <Label htmlFor="deal-brand">Brand name</Label>
            <Input id="deal-brand" autoFocus value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Aura Skincare" />
          </div>
          <div>
            <Label htmlFor="deal-contact">Contact</Label>
            <Input id="deal-contact" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Priya Nair" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="deal-rate">Rate ($)</Label>
              <Input id="deal-rate" type="number" min="0" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="1500" />
            </div>
            <div>
              <Label htmlFor="deal-due">Due date</Label>
              <Input id="deal-due" type="date" value={dueDate ?? ''} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="deal-deliverables">Deliverables</Label>
            <Input id="deal-deliverables" value={deliverables} onChange={(e) => setDeliverables(e.target.value)} placeholder="1 dedicated video" />
          </div>
          <div>
            <Label htmlFor="deal-notes">Notes</Label>
            <Textarea id="deal-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          <Button onClick={submit} disabled={!brandName.trim() || isPending} size="md" className="mt-1">
            {initial ? 'Save changes' : 'Add deal'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function DealsBoard({ initialDeals, gmailConnected }: { initialDeals: Deal[]; gmailConnected: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  // Deep link from the dashboard's "Needs your attention" list.
  const [selectedId, setSelectedId] = useState<string | null>(() => searchParams.get('deal'))
  const [isPending, startTransition] = useTransition()
  // Deep link from the dashboard's "Log a deal" action — jump straight into
  // the add-deal modal instead of landing on the board first.
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(() =>
    searchParams.get('new') === '1' ? 'add' : null
  )
  const [revealAiReply, setRevealAiReply] = useState(false)
  const [revealReview, setRevealReview] = useState(false)
  const [query, setQuery] = useState('')
  const selected = initialDeals.find((d) => d.id === selectedId) ?? null

  useEffect(() => {
    if (searchParams.get('new') === '1' || searchParams.get('deal')) {
      router.replace('/deals')
    }
  }, [searchParams, router])

  const activeDeals = initialDeals.filter((d) => d.status !== 'lost')
  const totalRevenue = activeDeals.reduce((acc, d) => acc + (d.rate_amount_cents ?? 0), 0) / 100
  const visibleDeals = query.trim()
    ? initialDeals.filter((d) => (d.brand_name ?? '').toLowerCase().includes(query.trim().toLowerCase()))
    : initialDeals

  const moveStage = (deal: Deal, stage: Deal['status']) => {
    const currentRank = STAGES.indexOf(deal.status)
    const nextRank = STAGES.indexOf(stage)
    // Confirm on anything that isn't a plain forward move — going backward
    // (or to Lost) silently changes the revenue totals shown elsewhere.
    const isBackwardOrLost = stage === 'lost' || (deal.status !== 'lost' && nextRank < currentRank)
    if (isBackwardOrLost && !window.confirm(`Move "${deal.brand_name ?? 'this deal'}" to ${STAGE_LABEL[stage]}?`)) return
    startTransition(async () => {
      const result = await updateDealStage(deal.id, stage)
      if (result.error) toast.error(result.error)
    })
  }

  const removeDeal = (deal: Deal) => {
    if (!window.confirm(`Delete "${deal.brand_name ?? 'this deal'}"? This can’t be undone.`)) return
    startTransition(async () => {
      const result = await deleteDeal(deal.id)
      if (result.error) toast.error(result.error)
    })
    setSelectedId(null)
  }

  const selectDeal = (id: string) => {
    setSelectedId(selectedId === id ? null : id)
    setRevealAiReply(false)
    setRevealReview(false)
  }

  const handleModalSubmit = (input: DealFormInput) => {
    startTransition(async () => {
      const result = modalMode === 'edit' && selected ? await updateDeal(selected.id, input) : await createDeal(input)
      if (result.error) toast.error(result.error)
    })
    setModalMode(null)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-linen">

      {/* Main pipeline */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-8 py-5 border-b border-fog bg-paper-white flex flex-wrap items-center justify-between gap-x-4 gap-y-3 shrink-0">
          <div>
            <h1 className="text-app-h1 text-carbon">Deals</h1>
            <p className="text-[12.5px] text-ash mt-0.5">
              {activeDeals.length} active · ${totalRevenue.toLocaleString()} pipeline value
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {gmailConnected && (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-lavender">
                <Check size={13} /> Gmail connected
              </span>
            )}
            <div className="relative shrink-0">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ash pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search deals"
                className="text-[13px] bg-linen border border-fog rounded-full pl-8 pr-3 py-1.5 outline-none focus:border-lavender/60 transition-colors w-[160px]"
              />
            </div>
            <Button onClick={() => setModalMode('add')} size="md" iconRight={<ArrowRight size={13} />}>
              Add deal
            </Button>
          </div>
        </div>

        {initialDeals.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-6">
            <EmptyState
              icon={<Handshake size={18} className="text-ash" strokeWidth={2} />}
              title="No deals yet."
              description="Connect Gmail to auto-detect sponsorship emails, or add a deal manually."
              action={
                <Button onClick={() => setModalMode('add')} size="md">
                  Add a deal
                </Button>
              }
            />
          </div>
        ) : visibleDeals.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-6">
            <EmptyState
              icon={<Search size={18} className="text-ash" strokeWidth={2} />}
              title="No deals match your search."
              description="Try a different search term."
            />
          </div>
        ) : (
          /* Kanban */
          <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-6">
            <div className="flex gap-3 h-full" style={{ minWidth: 'max-content' }}>
              {STAGES.map((stage) => {
                const stageDeals = visibleDeals.filter((d) => d.status === stage)
                const cfg = stageConfig[stage]
                return (
                  <div key={stage} className={`w-[228px] shrink-0 flex flex-col gap-2.5 ${stage === 'lost' ? 'opacity-60' : ''}`}>
                    {/* Column header */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span className="text-[13px] font-semibold text-carbon" style={{ letterSpacing: '-0.25px' }}>
                          {STAGE_LABEL[stage]}
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
                          onClick={() => selectDeal(deal.id)}
                          className={`w-full text-left bg-paper-white border rounded-xl p-4 transition-all hover:shadow-sm ${
                            selectedId === deal.id
                              ? 'border-lavender/50 shadow-[0_0_0_2px_rgba(249,115,22,0.15)]'
                              : 'border-fog hover:border-fog/80'
                          }`}
                          style={{ boxShadow: selectedId === deal.id ? undefined : 'var(--shadow-subtle)' }}
                        >
                          <div className="flex items-center gap-2.5 mb-2.5">
                            <Avatar name={deal.brand_name ?? '?'} size="sm" />
                            <p className="text-[13.5px] font-semibold text-carbon" style={{ letterSpacing: '-0.3px' }}>
                              {deal.brand_name ?? 'Untitled deal'}
                            </p>
                          </div>
                          {deal.deliverables && (
                            <p className="text-[12px] text-graphite leading-snug mb-3 line-clamp-2">
                              {deal.deliverables}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-bold text-carbon" style={{ letterSpacing: '-0.3px' }}>
                              {formatRate(deal.rate_amount_cents)}
                            </span>
                            {formatDueDate(deal.due_date) && (
                              <span className="text-[11px] text-ash">Due {formatDueDate(deal.due_date)}</span>
                            )}
                          </div>
                        </button>
                      ))}

                      {stageDeals.length === 0 && (
                        <div className="border border-dashed border-fog rounded-xl p-4 text-center">
                          <p className="text-[12px] text-ash">No deals</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <aside className="w-[340px] shrink-0 border-l border-fog bg-paper-white flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-fog shrink-0">
            <div className="flex items-center gap-2.5">
              <Avatar name={selected.brand_name ?? '?'} size="md" />
              <h2 className="text-[15px] font-bold text-carbon" style={{ letterSpacing: '-0.3px' }}>
                {selected.brand_name ?? 'Untitled deal'}
              </h2>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              aria-label="Close deal details"
              className="w-7 h-7 flex items-center justify-center text-ash hover:text-carbon transition-colors rounded-full hover:bg-linen"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex flex-col gap-5 p-5">
            {/* Stage */}
            <div className={`inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full font-label text-[10.5px] font-semibold uppercase tracking-widest ${stageConfig[selected.status].bg} ${stageConfig[selected.status].color}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${stageConfig[selected.status].dot}`} />
              {STAGE_LABEL[selected.status]}
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4">
              {[
                { label: 'Contact', value: selected.contact_name ?? '—' },
                { label: 'Rate', value: formatRate(selected.rate_amount_cents) },
                { label: 'Due date', value: formatDueDate(selected.due_date) ?? '—' },
                { label: 'Deliverables', value: selected.deliverables ?? '—' },
              ].map((f) => (
                <div key={f.label}>
                  <p className="font-label text-[10.5px] font-semibold text-ash uppercase tracking-widest mb-1">
                    {f.label}
                  </p>
                  <p className="text-[13.5px] text-carbon leading-snug" style={{ letterSpacing: '-0.25px' }}>
                    {f.value}
                  </p>
                </div>
              ))}
              {selected.notes && (
                <div>
                  <p className="font-label text-[10.5px] font-semibold text-ash uppercase tracking-widest mb-1">
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
              <p className="font-label text-[10.5px] font-semibold text-ash uppercase tracking-widest mb-2">
                Move to stage
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.filter((s) => s !== selected.status).map((s) => {
                  const cfg = stageConfig[s]
                  return (
                    <button
                      key={s}
                      disabled={isPending}
                      onClick={() => moveStage(selected, s)}
                      className={`font-label text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color} hover:opacity-80 disabled:opacity-50 transition-opacity`}
                    >
                      {STAGE_LABEL[s]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1 border-t border-fog">
              <Button onClick={() => setRevealAiReply((v) => !v)} size="md" className="w-full" iconLeft={<Sparkles size={13} />}>
                {revealAiReply ? 'Hide reply preview' : 'Draft reply — preview'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setRevealReview((v) => !v)}
                size="md"
                className="w-full"
                iconLeft={<FileText size={13} className="text-graphite" />}
              >
                {revealReview ? 'Hide contract review' : 'Review contract — preview'}
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setModalMode('edit')} size="sm" className="flex-1" iconLeft={<Pencil size={12} />}>
                  Edit deal
                </Button>
                <button
                  onClick={() => removeDeal(selected)}
                  disabled={isPending}
                  aria-label="Delete deal"
                  title="Delete deal"
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-ash hover:text-carbon hover:bg-linen transition-colors disabled:opacity-50 shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {revealAiReply && (
              <div className="bg-linen border border-fog rounded-xl p-4">
                <p className="font-label text-[10px] font-semibold text-ash uppercase tracking-widest mb-2">Draft reply — preview</p>
                <pre className="text-[12.5px] text-carbon leading-relaxed whitespace-pre-wrap font-sans">{aiReplyFor(selected)}</pre>
              </div>
            )}

            {revealReview && (
              <div className="flex flex-col gap-2.5">
                <p className="font-label text-[10px] font-semibold text-ash uppercase tracking-widest">Contract review — preview</p>
                {contractReviewFor(selected).map((item, i) => {
                  const style = reviewStyle[item.level]
                  const Icon = style.icon
                  return (
                    <div key={i} className={`flex items-start gap-2.5 rounded-xl p-3 ${style.bg}`}>
                      <Icon size={14} className={`shrink-0 mt-0.5 ${style.color}`} />
                      <div>
                        <p className={`text-[12px] font-semibold ${style.color}`}>{item.label}</p>
                        <p className="text-[12.5px] text-graphite leading-snug mt-0.5">{item.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <p className="text-[11px] text-ash text-center" style={{ letterSpacing: '-0.15px' }}>
              Preview only — built from a template and your rate card, not a live AI call. Nothing sends until you approve.
            </p>
          </div>
        </aside>
      )}

      {modalMode && (
        <DealModal
          initial={modalMode === 'edit' ? selected : null}
          onClose={() => setModalMode(null)}
          onSubmit={handleModalSubmit}
          isPending={isPending}
        />
      )}
    </div>
  )
}

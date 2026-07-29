'use client'

import { useEffect, useState, useTransition, type CSSProperties } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  Sparkles,
  FileText,
  Pencil,
  Check,
  AlertTriangle,
  Info,
  Handshake,
  Trash2,
  Copy,
  Mail,
  Receipt,
  History,
  Star,
  ListChecks,
  X,
  RefreshCw,
} from 'lucide-react'
import {
  updateDealStage,
  createDeal,
  updateDeal,
  deleteDeal,
  markInvoiceSent,
  toggleDealPriority,
  bulkUpdateDealStage,
  bulkDeleteDeals,
  checkGmailForDeals,
  type DealFormInput,
} from '@/lib/supabase/actions'
import type { Deal, DealStageHistory } from '@/lib/supabase/types'
import { InitialsChip } from '@/components/dash/InitialsChip'
import { GlassModal } from '@/components/dash/GlassModal'
import { FieldLabel, FieldInput, FieldTextarea } from '@/components/dash/FormField'
import { SearchField } from '@/components/dash/SearchField'
import { Pill, PillButton } from '@/components/dash/Pill'
import { DashboardHeader } from '@/components/dash/DashboardHeader'
import { MetricGrid, type Metric } from '@/components/dash/MetricCard'
import { FOCUS, FOCUS_INSET, HOVER } from '@/components/dash/tokens'
import { useToast } from '@/lib/toast'

const STAGE_LABEL: Record<Deal['status'], string> = {
  inbound: 'Inbound',
  negotiating: 'Negotiating',
  contracted: 'Contracted',
  delivered: 'Delivered',
  paid: 'Paid',
  lost: 'Lost',
}

const STAGES: Deal['status'][] = ['inbound', 'negotiating', 'contracted', 'delivered', 'paid', 'lost']

const STAGE_DOT: Record<Deal['status'], string> = {
  inbound: 'bg-zinc-500',
  negotiating: 'bg-zinc-500',
  contracted: 'bg-zinc-500',
  delivered: 'bg-zinc-500',
  paid: 'bg-emerald-400',
  lost: 'bg-zinc-600',
}

/**
 * Total deals, not just open ones — a brand-new account with one deal that
 * happens to already be Paid still shouldn't be dropped into an empty
 * six-column kanban to find it.
 */
const LOW_VOLUME_THRESHOLD = 3

// Every card's resting state already carries a subtle nebula-border gradient
// (diagonal white → transparent → faint orange) via this same CSS custom
// property. Selected state used to layer a separate `ring-1 ring-orange-400`
// box-shadow on top of that instead of replacing it — two different border
// techniques (a masked diagonal gradient + a uniform-color ring) occupying
// the same 1px edge read as an uneven, blotchy highlight rather than one
// clean color. Swapping the gradient itself to a solid orange keeps exactly
// one border technique active at a time, selected or not.
const SELECTED_BORDER_GRADIENT = 'linear-gradient(160deg, rgba(251,146,60,0.95), rgba(234,88,12,0.95))'

function formatRate(cents: number | null) {
  if (cents == null) return '—'
  return `$${(cents / 100).toLocaleString()}`
}

function formatDueDate(dueDate: string | null) {
  if (!dueDate) return null
  return new Date(dueDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatDateTime(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
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

const reviewStyle = {
  critical: { icon: AlertTriangle, color: 'text-orange-300', bg: 'bg-orange-500/[0.14]' },
  risk: { icon: AlertTriangle, color: 'text-amber-300', bg: 'bg-amber-400/[0.1]' },
  info: { icon: Info, color: 'text-zinc-400', bg: 'bg-white/[0.05]' },
}

function DealModal({
  initial,
  typicalRateCents,
  onClose,
  onSubmit,
  isPending,
}: {
  initial: Deal | null
  typicalRateCents: number | null
  onClose: () => void
  onSubmit: (input: DealFormInput) => void
  isPending: boolean
}) {
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
    <GlassModal title={initial ? 'Edit deal' : 'Add deal'} onClose={onClose}>
      <div className="flex flex-col gap-3.5">
        <div>
          <FieldLabel htmlFor="deal-brand">Brand name</FieldLabel>
          <FieldInput id="deal-brand" autoFocus value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Aura Skincare" />
        </div>
        <div>
          <FieldLabel htmlFor="deal-contact">Contact</FieldLabel>
          <FieldInput id="deal-contact" value={contactName ?? ''} onChange={(e) => setContactName(e.target.value)} placeholder="Priya Nair" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="deal-rate">Rate ($)</FieldLabel>
            <FieldInput id="deal-rate" type="number" min="0" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="1500" />
            {/* Creators consistently go into negotiation without a number
                in mind — this is their own real history, not a market
                estimate, so it's honest even though it's a small sample. */}
            {!initial && typicalRateCents !== null && (
              <p className="mt-1.5 font-nebula-ui text-[10.5px] text-zinc-600">
                Your recent deals averaged ${(typicalRateCents / 100).toLocaleString()}.
              </p>
            )}
          </div>
          <div>
            <FieldLabel htmlFor="deal-due">Due date</FieldLabel>
            <FieldInput id="deal-due" type="date" value={dueDate ?? ''} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="deal-deliverables">Deliverables</FieldLabel>
          <FieldInput id="deal-deliverables" value={deliverables ?? ''} onChange={(e) => setDeliverables(e.target.value)} placeholder="1 dedicated video" />
        </div>
        <div>
          <FieldLabel htmlFor="deal-notes">Notes</FieldLabel>
          <FieldTextarea id="deal-notes" value={notes ?? ''} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!brandName.trim() || isPending}
          className={`nebula-cta-static mt-1 inline-flex h-10 items-center justify-center rounded-[9999px] font-nebula-tech text-[13px] font-medium disabled:pointer-events-none disabled:opacity-50 ${FOCUS}`}
        >
          <span className="nebula-cta__label">{initial ? 'Save changes' : 'Add deal'}</span>
        </button>
      </div>
    </GlassModal>
  )
}

function DealCardContent({ deal, selectMode, selected }: { deal: Deal; selectMode?: boolean; selected?: boolean }) {
  return (
    <>
      <div className="mb-2.5 flex items-center gap-2.5">
        {selectMode && (
          <span
            aria-hidden
            className={`grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border ${
              selected ? 'border-orange-400 bg-orange-500/80' : 'border-white/20'
            }`}
          >
            {selected && <Check size={11} strokeWidth={3} className="text-white" />}
          </span>
        )}
        <InitialsChip name={deal.brand_name ?? '?'} size={26} />
        <p className="min-w-0 flex-1 truncate font-nebula-ui text-[13px] font-semibold text-zinc-100">
          {deal.brand_name ?? 'Untitled deal'}
        </p>
        {deal.is_priority && (
          <Star aria-hidden size={12} strokeWidth={2} className="shrink-0 fill-amber-400 text-amber-400" />
        )}
      </div>
      {deal.deliverables && (
        <p className="mb-3 line-clamp-2 font-nebula-ui text-[11.5px] leading-snug text-zinc-500">{deal.deliverables}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="font-nebula-mono text-[12.5px] font-medium text-zinc-100">{formatRate(deal.rate_amount_cents)}</span>
        {formatDueDate(deal.due_date) && (
          <span className="font-nebula-ui text-[10.5px] text-zinc-600">Due {formatDueDate(deal.due_date)}</span>
        )}
      </div>
    </>
  )
}

export default function DealsBoard({
  initialDeals,
  gmailConnected,
  gmailIsDemo,
  stageHistory,
}: {
  initialDeals: Deal[]
  gmailConnected: boolean
  gmailIsDemo: boolean
  stageHistory: DealStageHistory[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const [selectedId, setSelectedId] = useState<string | null>(() => searchParams.get('deal'))
  const [isPending, startTransition] = useTransition()
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(() =>
    searchParams.get('new') === '1' ? 'add' : null
  )
  const [revealAiReply, setRevealAiReply] = useState(false)
  const [revealReview, setRevealReview] = useState(false)
  const [revealHistory, setRevealHistory] = useState(false)
  const [query, setQuery] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set())
  const [isCheckingGmail, setIsCheckingGmail] = useState(false)
  const selected = initialDeals.find((d) => d.id === selectedId) ?? null

  useEffect(() => {
    if (searchParams.get('new') === '1' || searchParams.get('deal')) {
      router.replace('/deals')
    }
  }, [searchParams, router])

  const handleCheckGmail = async () => {
    setIsCheckingGmail(true)
    const result = await checkGmailForDeals()
    setIsCheckingGmail(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(
      result.dealsCreated && result.dealsCreated > 0
        ? `Found ${result.dealsCreated} new ${result.dealsCreated === 1 ? 'deal' : 'deals'}.`
        : 'No new sponsorship emails found.',
    )
  }

  const openDeals = initialDeals.filter((d) => d.status !== 'paid' && d.status !== 'lost')
  const pipelineValue = openDeals.reduce((acc, d) => acc + (d.rate_amount_cents ?? 0), 0) / 100
  const paidDeals = initialDeals.filter((d) => d.status === 'paid')
  const collectedTotal = paidDeals.reduce((acc, d) => acc + (d.rate_amount_cents ?? 0), 0) / 100
  const needsNextStepCount = initialDeals.filter((d) => d.status !== 'paid' && d.status !== 'delivered' && d.status !== 'lost').length
  const searchedDeals = query.trim()
    ? initialDeals.filter((d) => (d.brand_name ?? '').toLowerCase().includes(query.trim().toLowerCase()))
    : initialDeals
  // Priority deals float to the top within whatever grouping they land in
  // (stage column, or the low-volume flat list) — a plain, predictable sort
  // rather than a computed urgency score.
  const visibleDeals = [...searchedDeals].sort((a, b) => Number(b.is_priority) - Number(a.is_priority))
  const isLowVolume = initialDeals.length <= LOW_VOLUME_THRESHOLD

  const toggleSelectMode = () => {
    setSelectMode((v) => !v)
    setBulkSelectedIds(new Set())
    setSelectedId(null)
  }

  const toggleBulkSelected = (id: string) => {
    setBulkSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const cardClick = (deal: Deal) => {
    if (selectMode) toggleBulkSelected(deal.id)
    else selectDeal(deal.id)
  }

  const bulkMove = (stage: Deal['status']) => {
    const ids = [...bulkSelectedIds]
    if (ids.length === 0) return
    if (!window.confirm(`Move ${ids.length} ${ids.length === 1 ? 'deal' : 'deals'} to ${STAGE_LABEL[stage]}?`)) return
    startTransition(async () => {
      const result = await bulkUpdateDealStage(ids, stage)
      if (result.error) toast.error(result.error)
    })
    setBulkSelectedIds(new Set())
  }

  const bulkDelete = () => {
    const ids = [...bulkSelectedIds]
    if (ids.length === 0) return
    if (!window.confirm(`Delete ${ids.length} ${ids.length === 1 ? 'deal' : 'deals'}? This can't be undone.`)) return
    startTransition(async () => {
      const result = await bulkDeleteDeals(ids)
      if (result.error) toast.error(result.error)
    })
    setBulkSelectedIds(new Set())
  }

  const togglePriority = (deal: Deal) => {
    startTransition(async () => {
      const result = await toggleDealPriority(deal.id, !deal.is_priority)
      if (result.error) toast.error(result.error)
    })
  }

  const ratedDeals = initialDeals.filter((d) => d.status !== 'lost' && d.rate_amount_cents !== null).slice(0, 5)
  const typicalRateCents =
    ratedDeals.length > 0
      ? Math.round(ratedDeals.reduce((acc, d) => acc + (d.rate_amount_cents ?? 0), 0) / ratedDeals.length)
      : null

  const moveStage = (deal: Deal, stage: Deal['status']) => {
    const currentRank = STAGES.indexOf(deal.status)
    const nextRank = STAGES.indexOf(stage)
    const isBackwardOrLost = stage === 'lost' || (deal.status !== 'lost' && nextRank < currentRank)
    if (isBackwardOrLost && !window.confirm(`Move "${deal.brand_name ?? 'this deal'}" to ${STAGE_LABEL[stage]}?`)) return
    startTransition(async () => {
      const result = await updateDealStage(deal.id, deal.status, stage)
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
    setRevealHistory(false)
  }

  const handleModalSubmit = (input: DealFormInput) => {
    startTransition(async () => {
      const result = modalMode === 'edit' && selected ? await updateDeal(selected.id, input) : await createDeal(input)
      if (result.error) toast.error(result.error)
    })
    setModalMode(null)
  }

  const handleMarkInvoiced = (deal: Deal) => {
    startTransition(async () => {
      const result = await markInvoiceSent(deal.id)
      if (result.error) toast.error(result.error)
    })
  }

  const copyReply = async (deal: Deal) => {
    try {
      await navigator.clipboard.writeText(aiReplyFor(deal))
      toast.success('Copied to clipboard.')
    } catch {
      toast.error('Could not copy — your browser may be blocking clipboard access.')
    }
  }

  const openInGmail = (deal: Deal) => {
    const subject = encodeURIComponent(`Re: ${deal.brand_name ?? 'your note'}`)
    const body = encodeURIComponent(aiReplyFor(deal))
    const to = deal.contact_email ? encodeURIComponent(deal.contact_email) : ''
    // gmail.com/mail's compose deep-link — opens the user's own inbox with
    // the draft pre-filled. No API call, no OAuth, no send happens here or
    // ever from this button; the user reviews and sends it themselves.
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`, '_blank', 'noopener,noreferrer')
  }

  const selectedHistory = selected ? stageHistory.filter((h) => h.deal_id === selected.id) : []

  const dealMetrics: Metric[] = [
    { label: 'Open deals', value: String(openDeals.length), hint: `of ${initialDeals.length} total`, icon: <Handshake size={14} /> },
    { label: 'Pipeline value', value: `$${pipelineValue.toLocaleString()}`, hint: `across ${openDeals.length} open` },
    { label: 'Collected to date', value: `$${collectedTotal.toLocaleString()}`, hint: `across ${paidDeals.length} deals` },
    { label: 'Needs a next step', value: String(needsNextStepCount) },
  ]

  return (
    <>
      <DashboardHeader
        eyebrow="Deals"
        title="Deals"
        description={`${openDeals.length} open · $${pipelineValue.toLocaleString()} pipeline value`}
        right={
          <>
            {gmailConnected && (
              <span
                title={gmailIsDemo ? 'Seeded demo data, not a live Gmail connection' : undefined}
                className="inline-flex items-center gap-1.5 font-nebula-ui text-[12px] font-medium text-emerald-300"
              >
                <Check size={13} strokeWidth={2.5} /> Gmail connected{gmailIsDemo ? ' (demo)' : ''}
              </span>
            )}
            {gmailConnected && !gmailIsDemo && (
              <button
                type="button"
                onClick={handleCheckGmail}
                disabled={isCheckingGmail}
                className={`inline-flex h-8 items-center gap-1.5 rounded-[9999px] border border-white/10 px-3 font-nebula-ui text-[12px] font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS}`}
              >
                <RefreshCw size={12} strokeWidth={2} className={isCheckingGmail ? 'animate-spin' : ''} />
                {isCheckingGmail ? 'Checking…' : 'Check for new deals'}
              </button>
            )}
            <SearchField value={query} onChange={setQuery} placeholder="Search deals" className="w-[160px]" />
            {initialDeals.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectMode}
                aria-pressed={selectMode}
                className={`inline-flex h-9 items-center gap-1.5 rounded-[9999px] border px-3.5 font-nebula-ui text-[12.5px] font-medium ${HOVER} ${FOCUS} ${
                  selectMode
                    ? 'border-orange-400/60 bg-orange-500/[0.12] text-orange-300'
                    : 'border-white/10 text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <ListChecks size={14} strokeWidth={2} />
                {selectMode ? 'Done' : 'Select'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setModalMode('add')}
              className={`nebula-cta-static inline-flex h-9 items-center gap-1.5 rounded-[9999px] px-4 font-nebula-tech text-[12.5px] font-medium ${FOCUS}`}
            >
              <span className="nebula-cta__label">
                Add deal <ArrowRight size={13} className="ml-1 inline" />
              </span>
            </button>
          </>
        }
      />

      <div className="flex h-full min-h-0 flex-1 overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {initialDeals.length > 0 && (
          <div className="shrink-0 border-b border-white/[0.06] px-4 pb-5 pt-1 sm:px-6 lg:px-8">
            <MetricGrid metrics={dealMetrics} />
          </div>
        )}

        {initialDeals.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="max-w-[26rem] text-center">
              <span aria-hidden className="mx-auto grid h-11 w-11 place-items-center rounded-[9999px] bg-orange-500/10 text-orange-400">
                <Handshake size={18} strokeWidth={2} />
              </span>
              <p className="mt-4 font-nebula-heading text-[16px] font-semibold text-white">No deals yet.</p>
              <p className="mt-1 font-nebula-ui text-[13px] text-zinc-500">
                Connect Gmail to auto-detect sponsorship emails, or add a deal manually.
              </p>
              <button
                type="button"
                onClick={() => setModalMode('add')}
                className={`nebula-cta nebula-cta--wide mt-5 inline-flex h-9 items-center rounded-[9999px] px-4 font-nebula-tech text-[12.5px] font-medium ${FOCUS}`}
              >
                <span className="nebula-cta__label">Add a deal</span>
              </button>
            </div>
          </div>
        ) : visibleDeals.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="text-center">
              <p className="font-nebula-heading text-[16px] font-semibold text-white">No deals match your search.</p>
              <p className="mt-1 font-nebula-ui text-[13px] text-zinc-500">Try a different search term.</p>
            </div>
          </div>
        ) : isLowVolume ? (
          // A handful of deals doesn't earn a six-column pipeline — it's
          // disorienting, not reassuring, for someone with one or two.
          <div className="console-scroll flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-[640px] flex-col gap-3">
              {visibleDeals.map((deal) => (
                <button
                  key={deal.id}
                  type="button"
                  onClick={() => cardClick(deal)}
                  className={`nebula-border w-full rounded-[1.25rem] bg-white/[0.03] p-5 text-left backdrop-blur-xl transition-all duration-150 hover:bg-white/[0.05] ${FOCUS_INSET} ${
                    selectedId === deal.id || bulkSelectedIds.has(deal.id) ? 'bg-white/[0.05]' : ''
                  }`}
                  style={
                    {
                      '--nebula-border-gradient':
                        selectedId === deal.id || bulkSelectedIds.has(deal.id)
                          ? SELECTED_BORDER_GRADIENT
                          : 'linear-gradient(160deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02) 55%, rgba(234,88,12,0.06))',
                    } as CSSProperties
                  }
                >
                  <div className="mb-2.5 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {selectMode && (
                        <span
                          aria-hidden
                          className={`grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border ${
                            bulkSelectedIds.has(deal.id) ? 'border-orange-400 bg-orange-500/80' : 'border-white/20'
                          }`}
                        >
                          {bulkSelectedIds.has(deal.id) && <Check size={11} strokeWidth={3} className="text-white" />}
                        </span>
                      )}
                      <InitialsChip name={deal.brand_name ?? '?'} size={34} />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-nebula-ui text-[14px] font-semibold text-zinc-100">
                          {deal.brand_name ?? 'Untitled deal'}
                          {deal.is_priority && (
                            <Star aria-hidden size={12} strokeWidth={2} className="shrink-0 fill-amber-400 text-amber-400" />
                          )}
                        </p>
                        <span className="mt-0.5 flex items-center gap-1.5">
                          <span aria-hidden className={`h-1.5 w-1.5 rounded-[9999px] ${STAGE_DOT[deal.status]}`} />
                          <span className="font-nebula-ui text-[11.5px] text-zinc-500">{STAGE_LABEL[deal.status]}</span>
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 font-nebula-mono text-[15px] font-medium text-zinc-100">
                      {formatRate(deal.rate_amount_cents)}
                    </span>
                  </div>
                  {deal.deliverables && (
                    <p className="font-nebula-ui text-[12.5px] leading-snug text-zinc-500">{deal.deliverables}</p>
                  )}
                  {formatDueDate(deal.due_date) && (
                    <p className="mt-2 font-nebula-ui text-[11px] text-zinc-600">Due {formatDueDate(deal.due_date)}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="console-scroll flex-1 overflow-x-auto overflow-y-hidden px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex h-full gap-3" style={{ minWidth: 'max-content' }}>
              {STAGES.map((stage) => {
                const stageDeals = visibleDeals.filter((d) => d.status === stage)
                return (
                  <div
                    key={stage}
                    className={`flex w-[260px] shrink-0 flex-col gap-2.5 ${stage === 'lost' ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5">
                        <span aria-hidden className={`h-1.5 w-1.5 rounded-[9999px] ${STAGE_DOT[stage]}`} />
                        <span className="font-nebula-heading text-[12.5px] font-semibold text-zinc-200">{STAGE_LABEL[stage]}</span>
                      </div>
                      <span className="rounded-[9999px] bg-white/[0.06] px-2 py-0.5 font-nebula-mono text-[10.5px] font-medium text-zinc-500">
                        {stageDeals.length}
                      </span>
                    </div>

                    <div className="console-scroll flex flex-1 flex-col gap-2 overflow-y-auto pb-4 pr-0.5">
                      {stageDeals.map((deal) => (
                        <button
                          key={deal.id}
                          type="button"
                          onClick={() => cardClick(deal)}
                          className={`nebula-border w-full rounded-[14px] bg-white/[0.03] p-3.5 text-left backdrop-blur-xl transition-all duration-150 hover:bg-white/[0.05] ${FOCUS_INSET} ${
                            selectedId === deal.id || bulkSelectedIds.has(deal.id) ? 'bg-white/[0.05]' : ''
                          }`}
                          style={
                            {
                              '--nebula-border-gradient':
                                selectedId === deal.id || bulkSelectedIds.has(deal.id)
                                  ? SELECTED_BORDER_GRADIENT
                                  : 'linear-gradient(160deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02) 55%, rgba(234,88,12,0.06))',
                            } as CSSProperties
                          }
                        >
                          <DealCardContent deal={deal} selectMode={selectMode} selected={bulkSelectedIds.has(deal.id)} />
                        </button>
                      ))}

                      {stageDeals.length === 0 && (
                        <div className="rounded-[14px] border border-dashed border-white/10 p-3.5 text-center">
                          <p className="font-nebula-ui text-[11.5px] text-zinc-600">No deals</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {selectMode && bulkSelectedIds.size > 0 && (
          <div className="flex shrink-0 flex-wrap items-center gap-2.5 border-t border-white/[0.06] bg-white/[0.03] px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
            <span className="font-nebula-ui text-[12.5px] font-medium text-zinc-300">
              {bulkSelectedIds.size} selected
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {STAGES.map((stage) => (
                <PillButton key={stage} disabled={isPending} onClick={() => bulkMove(stage)}>
                  Move to {STAGE_LABEL[stage]}
                </PillButton>
              ))}
            </div>
            <button
              type="button"
              onClick={bulkDelete}
              disabled={isPending}
              className={`ml-auto inline-flex h-8 items-center gap-1.5 rounded-[9999px] border border-white/10 px-3 font-nebula-ui text-[11.5px] font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS_INSET}`}
            >
              <Trash2 size={12} strokeWidth={2} /> Delete
            </button>
            <button
              type="button"
              onClick={() => setBulkSelectedIds(new Set())}
              disabled={isPending}
              aria-label="Clear selection"
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9999px] text-zinc-500 hover:bg-white/[0.08] hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS_INSET}`}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      {selected && (
        <aside className="console-scroll flex w-[340px] shrink-0 flex-col overflow-y-auto border-l border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
          <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <InitialsChip name={selected.brand_name ?? '?'} size={30} />
              <h2 className="font-nebula-heading text-[15px] font-semibold text-white">
                {selected.brand_name ?? 'Untitled deal'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="Close deal details"
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9999px] text-zinc-500 hover:bg-white/[0.08] hover:text-white ${HOVER} ${FOCUS_INSET}`}
            >
              <span className="text-[15px] leading-none">×</span>
            </button>
          </div>

          <div className="flex flex-col gap-5 p-5">
            <div className="flex items-center justify-between gap-3">
              <Pill tone={selected.status === 'paid' ? 'positive' : 'default'}>{STAGE_LABEL[selected.status]}</Pill>
              <button
                type="button"
                onClick={() => togglePriority(selected)}
                disabled={isPending}
                aria-pressed={selected.is_priority}
                className={`inline-flex items-center gap-1.5 rounded-[9999px] border px-2.5 py-1 font-nebula-ui text-[11.5px] font-medium disabled:opacity-50 ${HOVER} ${FOCUS_INSET} ${
                  selected.is_priority
                    ? 'border-amber-400/40 bg-amber-400/[0.1] text-amber-300'
                    : 'border-white/10 text-zinc-400 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <Star size={12} strokeWidth={2} className={selected.is_priority ? 'fill-amber-400' : ''} />
                {selected.is_priority ? 'Priority' : 'Mark priority'}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { label: 'Contact', value: selected.contact_name ?? '—' },
                { label: 'Rate', value: formatRate(selected.rate_amount_cents) },
                { label: 'Due date', value: formatDueDate(selected.due_date) ?? '—' },
                { label: 'Deliverables', value: selected.deliverables ?? '—' },
              ].map((f) => (
                <div key={f.label}>
                  <p className="mb-1 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                    {f.label}
                  </p>
                  <p className="font-nebula-ui text-[13px] leading-snug text-zinc-200">{f.value}</p>
                </div>
              ))}
              {selected.notes && (
                <div>
                  <p className="mb-1 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                    Notes
                  </p>
                  <p className="font-nebula-ui text-[13px] leading-snug text-zinc-400">{selected.notes}</p>
                </div>
              )}
            </div>

            {/* Invoice / payment tracking */}
            <div className="flex flex-col gap-2.5 border-t border-white/[0.06] pt-4">
              <p className="font-nebula-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                Invoice &amp; payment
              </p>
              <div className="flex items-center justify-between">
                <span className="font-nebula-ui text-[12.5px] text-zinc-400">Invoice sent</span>
                {selected.invoiced_at ? (
                  <span className="font-nebula-mono text-[12px] text-zinc-200">{formatDateTime(selected.invoiced_at)}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleMarkInvoiced(selected)}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1 rounded-[9999px] border border-white/10 px-2.5 py-1 font-nebula-ui text-[11px] font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS_INSET}`}
                  >
                    <Receipt size={11} strokeWidth={2} /> Mark sent
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-nebula-ui text-[12.5px] text-zinc-400">Paid</span>
                <span className="font-nebula-mono text-[12px] text-zinc-200">
                  {selected.paid_at ? formatDateTime(selected.paid_at) : '—'}
                </span>
              </div>
            </div>

            <div>
              <p className="mb-2 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                Move to stage
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.filter((s) => s !== selected.status).map((s) => (
                  <PillButton key={s} disabled={isPending} onClick={() => moveStage(selected, s)}>
                    {STAGE_LABEL[s]}
                  </PillButton>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-4">
              <button
                type="button"
                onClick={() => setRevealAiReply((v) => !v)}
                className={`nebula-cta-static flex h-9 w-full items-center justify-center gap-1.5 rounded-[9999px] font-nebula-tech text-[12.5px] font-medium ${FOCUS}`}
              >
                <span className="nebula-cta__label flex items-center gap-1.5">
                  <Sparkles size={13} strokeWidth={2} />
                  {revealAiReply ? 'Hide reply preview' : 'Draft reply — preview'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRevealReview((v) => !v)}
                className={`flex h-9 w-full items-center justify-center gap-1.5 rounded-[9999px] border border-white/10 font-nebula-ui text-[12.5px] font-medium text-zinc-300 hover:bg-white/[0.05] hover:text-white ${HOVER} ${FOCUS}`}
              >
                <FileText size={13} strokeWidth={2} />
                {revealReview ? 'Hide contract review' : 'Review contract — preview'}
              </button>
              <button
                type="button"
                onClick={() => setRevealHistory((v) => !v)}
                className={`flex h-9 w-full items-center justify-center gap-1.5 rounded-[9999px] border border-white/10 font-nebula-ui text-[12.5px] font-medium text-zinc-300 hover:bg-white/[0.05] hover:text-white ${HOVER} ${FOCUS}`}
              >
                <History size={13} strokeWidth={2} />
                {revealHistory ? 'Hide history' : `History (${selectedHistory.length})`}
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode('edit')}
                  className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[9999px] font-nebula-ui text-[12px] font-medium text-zinc-400 hover:bg-white/[0.05] hover:text-white ${HOVER} ${FOCUS}`}
                >
                  <Pencil size={12} strokeWidth={2} /> Edit deal
                </button>
                <button
                  type="button"
                  onClick={() => removeDeal(selected)}
                  disabled={isPending}
                  aria-label="Delete deal"
                  title="Delete deal"
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-[9999px] text-zinc-500 hover:bg-white/[0.08] hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS_INSET}`}
                >
                  <Trash2 size={13} strokeWidth={2} />
                </button>
              </div>
            </div>

            {revealAiReply && (
              <div className="nebula-border rounded-[12px] bg-white/[0.03] p-4">
                <p className="mb-2 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                  Draft reply — preview
                </p>
                <pre className="whitespace-pre-wrap font-nebula-ui text-[12.5px] leading-relaxed text-zinc-300">
                  {aiReplyFor(selected)}
                </pre>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyReply(selected)}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-[9999px] border border-white/10 px-3 font-nebula-ui text-[11.5px] font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white ${HOVER} ${FOCUS_INSET}`}
                  >
                    <Copy size={12} strokeWidth={2} /> Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => openInGmail(selected)}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-[9999px] border border-white/10 px-3 font-nebula-ui text-[11.5px] font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white ${HOVER} ${FOCUS_INSET}`}
                  >
                    <Mail size={12} strokeWidth={2} /> Open in Gmail
                  </button>
                </div>
                <p className="mt-2 font-nebula-ui text-[10.5px] text-zinc-600">
                  Opens your own Gmail with this draft pre-filled — nothing is sent from here.
                </p>
              </div>
            )}

            {revealReview && (
              <div className="flex flex-col gap-2.5">
                <p className="font-nebula-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                  Contract review — preview
                </p>
                {contractReviewFor(selected).map((item, i) => {
                  const style = reviewStyle[item.level]
                  const Icon = style.icon
                  return (
                    <div key={i} className={`flex items-start gap-2.5 rounded-[12px] p-3 ${style.bg}`}>
                      <Icon size={14} strokeWidth={2} className={`mt-0.5 shrink-0 ${style.color}`} />
                      <div>
                        <p className={`font-nebula-ui text-[12px] font-semibold ${style.color}`}>{item.label}</p>
                        <p className="mt-0.5 font-nebula-ui text-[12px] leading-snug text-zinc-400">{item.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {revealHistory && (
              <div className="flex flex-col gap-2">
                <p className="font-nebula-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                  Stage history
                </p>
                {selectedHistory.length === 0 ? (
                  <p className="font-nebula-ui text-[12px] text-zinc-600">
                    No transitions recorded yet — this starts tracking from here forward.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2.5">
                    {selectedHistory.map((h) => (
                      <li key={h.id} className="flex items-start gap-2.5">
                        <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-[9999px] bg-orange-400" />
                        <div>
                          <p className="font-nebula-ui text-[12px] text-zinc-300">
                            {h.from_status ? STAGE_LABEL[h.from_status] : 'Created'} → {STAGE_LABEL[h.to_status]}
                          </p>
                          <p className="font-nebula-mono text-[10.5px] text-zinc-600">{formatDateTime(h.changed_at)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {(revealAiReply || revealReview) && (
              <p className="text-center font-nebula-ui text-[11px] text-zinc-600">
                Preview only — built from a template and your rate card, not a live AI call. Nothing sends until you
                approve.
              </p>
            )}
          </div>
        </aside>
      )}
      </div>

      {modalMode && (
        <DealModal
          initial={modalMode === 'edit' ? selected : null}
          typicalRateCents={typicalRateCents}
          onClose={() => setModalMode(null)}
          onSubmit={handleModalSubmit}
          isPending={isPending}
        />
      )}
    </>
  )
}

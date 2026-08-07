import type { Metadata } from 'next'
import { Handshake, Lightbulb, FileText, Video } from 'lucide-react'
import { getDeals, getIdeas, getDrafts, getChannelStats, getIntegrations } from '@/lib/supabase/queries'
import { requireModuleAccess } from '@/lib/supabase/access'
import { canAccessModule } from '@/lib/roles'
import { getDealsNeedingFollowUp } from '@/lib/dealUrgency'
import AIAssistantBoard, { type AssistantFact, type ContextChip } from './AIAssistantBoard'

export const metadata: Metadata = { title: 'AI Assistant - CreatorFlow' }

function formatMoney(d: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    notation: d >= 100_000 ? 'compact' : 'standard',
  }).format(d)
}

function formatCompactNumber(n: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

// Wall-clock reads (Date.now()) are impure and this repo's lint rules flag
// calling them directly inside a component body — same reason dashboard's
// page.tsx wraps its own `Date.now()` in a plain helper function too.
function now() {
  return Date.now()
}

function daysSince(iso: string) {
  return Math.max(0, Math.floor((now() - new Date(iso).getTime()) / 86_400_000))
}

function daysOverdue(due: string) {
  const d = new Date(due + 'T00:00:00Z')
  const today = new Date()
  const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  return Math.max(0, Math.round((todayUTC - d.getTime()) / 86_400_000))
}

const FOLLOWUP_REASON_LABEL: Record<'stale' | 'overdue_invoice', (days: number) => string> = {
  stale: (days) => `gone quiet for ${days} day${days === 1 ? '' : 's'}`,
  overdue_invoice: (days) => `invoice overdue by ${days} day${days === 1 ? '' : 's'}`,
}

export default async function AIAssistantPage() {
  const account = await requireModuleAccess('aiAssistant')
  const role = account.role

  const [deals, ideas, drafts, momentumStats, integrations] = await Promise.all([
    getDeals(),
    getIdeas(),
    getDrafts(),
    // Fixed 28-vs-prior-28-day window, same as the dashboard's momentum card.
    getChannelStats(56),
    getIntegrations(),
  ])

  const canDeals = canAccessModule(role, 'deals')
  const canIdeas = canAccessModule(role, 'ideas')
  const canDrafts = canAccessModule(role, 'drafts')
  const canAnalyticsModule = canAccessModule(role, 'analytics')

  const youtube = integrations.find((i) => i.provider === 'youtube')
  const youtubeConnected = !!youtube

  const facts: AssistantFact[] = []
  const contextChips: ContextChip[] = []

  if (canDeals) {
    const openDeals = deals.filter((d) => d.status !== 'paid' && d.status !== 'lost')
    const pipelineValue = openDeals.reduce((acc, d) => acc + (d.rate_amount_cents ?? 0), 0) / 100
    const brandTotals = new Map<string, number>()
    for (const d of openDeals) {
      const brand = d.brand_name?.trim() || 'Unnamed brand'
      brandTotals.set(brand, (brandTotals.get(brand) ?? 0) + (d.rate_amount_cents ?? 0) / 100)
    }
    const topBrand = [...brandTotals.entries()].sort((a, b) => b[1] - a[1])[0] ?? null

    const followUpDeals = getDealsNeedingFollowUp(deals)
    const followUpLines = followUpDeals
      .slice(0, 4)
      .map(({ deal, reason }) => {
        const days = reason === 'overdue_invoice' && deal.due_date ? daysOverdue(deal.due_date) : daysSince(deal.updated_at)
        return `• ${deal.brand_name ?? 'Untitled deal'} — ${FOLLOWUP_REASON_LABEL[reason](days)}`
      })

    facts.push({
      id: 'follow-up',
      question: 'Which deals need a reply today?',
      keywords: ['follow up', 'follow-up', 'reply', 'today', 'quiet', 'overdue'],
      answer:
        followUpDeals.length === 0
          ? "You're all caught up, nothing needs a follow-up right now."
          : `${followUpDeals.length} deal${followUpDeals.length === 1 ? '' : 's'} need${followUpDeals.length === 1 ? 's' : ''} attention:\n${followUpLines.join('\n')}`,
    })

    facts.push({
      id: 'pipeline',
      question: "What's my pipeline worth right now?",
      keywords: ['pipeline', 'worth', 'value', 'open deal'],
      answer:
        openDeals.length === 0
          ? "No open deals in the pipeline right now."
          : `${openDeals.length} open deal${openDeals.length === 1 ? '' : 's'} worth ${formatMoney(pipelineValue)}.` +
            (topBrand ? ` ${topBrand[0]} is the largest at ${formatMoney(topBrand[1])}.` : ''),
    })

    contextChips.push({ label: 'Open deals', value: String(openDeals.length), icon: <Handshake size={13} /> })
  }

  if (canIdeas) {
    const sevenDaysAgoMs = now() - 7 * 86_400_000
    const ideasThisWeek = ideas.filter((i) => new Date(i.created_at).getTime() >= sevenDaysAgoMs).length
    const ideaIdsWithDraft = new Set(drafts.map((d) => d.idea_id).filter((id): id is string => id !== null))
    const ideasWithDraftCount = ideas.filter((i) => ideaIdsWithDraft.has(i.id)).length
    const draftConversionPct = ideas.length === 0 ? 0 : Math.round((ideasWithDraftCount / ideas.length) * 100)

    facts.push({
      id: 'ideas',
      question: 'How are my ideas turning into content?',
      keywords: ['ideas', 'content', 'draft', 'conversion', 'turning'],
      answer:
        ideas.length === 0
          ? 'No ideas captured yet.'
          : `${ideasThisWeek} new idea${ideasThisWeek === 1 ? '' : 's'} this week, ${ideas.length} total captured.` +
            (canDrafts
              ? ` ${ideasWithDraftCount} of those have a draft started, a ${draftConversionPct}% conversion rate.`
              : ''),
    })

    contextChips.push({ label: 'Ideas', value: String(ideas.length), icon: <Lightbulb size={13} /> })
  }

  if (canDrafts) {
    contextChips.push({ label: 'Drafts', value: String(drafts.length), icon: <FileText size={13} /> })
  }

  if (canAnalyticsModule) {
    const momentumCutoff28 = now() - 28 * 86_400_000
    const momentumCutoff56 = now() - 56 * 86_400_000
    const last28Stats = momentumStats.filter((s) => new Date(s.stat_date + 'T00:00:00Z').getTime() >= momentumCutoff28)
    const prior28Stats = momentumStats.filter((s) => {
      const t = new Date(s.stat_date + 'T00:00:00Z').getTime()
      return t >= momentumCutoff56 && t < momentumCutoff28
    })
    const last28Views = last28Stats.reduce((acc, s) => acc + s.views, 0)
    const prior28Views = prior28Stats.reduce((acc, s) => acc + s.views, 0)
    const last28SubsGained = last28Stats.reduce((acc, s) => acc + s.subscribers_gained, 0)
    const viewsDeltaPct = prior28Views === 0 ? null : ((last28Views - prior28Views) / prior28Views) * 100

    facts.push({
      id: 'channel',
      question: 'How did my channel do in the last 28 days?',
      keywords: ['channel', 'views', 'youtube', 'subscribers', '28 days', 'performance'],
      answer: !youtubeConnected
        ? "YouTube isn't connected yet, so there's no channel data to pull from. Connect it in Settings to see this."
        : `${formatCompactNumber(last28Views)} views in the last 28 days` +
          (viewsDeltaPct === null ? '' : `, ${viewsDeltaPct >= 0 ? 'up' : 'down'} ${Math.abs(viewsDeltaPct).toFixed(0)}% from the 28 days before`) +
          `, and ${last28SubsGained >= 0 ? '+' : ''}${last28SubsGained.toLocaleString()} subscribers.`,
    })

    if (youtubeConnected) {
      contextChips.push({ label: 'Views · 28d', value: formatCompactNumber(last28Views), icon: <Video size={13} /> })
    }
  }

  return <AIAssistantBoard facts={facts} contextChips={contextChips} />
}

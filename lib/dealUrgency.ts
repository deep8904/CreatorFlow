import type { Deal } from '@/lib/supabase/types'

/**
 * Shared urgency check — overdue or due within `withinDays`, and not a deal
 * that's already left the pipeline. UTC day-part comparison, same reasoning
 * as `dashboard/page.tsx`'s `dueMeta`: a naive `new Date` compare drifts by
 * a day depending on server timezone.
 */
export function isDealUrgent(deal: Deal, withinDays = 3): boolean {
  if (!deal.due_date) return false
  if (deal.status === 'paid' || deal.status === 'lost') return false
  const d = new Date(deal.due_date + 'T00:00:00Z')
  const today = new Date()
  const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  const days = Math.round((d.getTime() - todayUTC) / 86_400_000)
  return days <= withinDays
}

export function countUrgentDeals(deals: Deal[], withinDays = 3): number {
  return deals.filter((d) => isDealUrgent(d, withinDays)).length
}

/**
 * An invoice is overdue once it's been sent, hasn't been paid, and its due
 * date has passed — same UTC day-part comparison as `isDealUrgent` above.
 */
export function isDealOverdueInvoice(deal: Deal): boolean {
  if (!deal.invoiced_at || deal.paid_at || !deal.due_date) return false
  const d = new Date(deal.due_date + 'T00:00:00Z')
  const today = new Date()
  const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  return d.getTime() < todayUTC
}

// Pre-close stages a deal can go stale in — once contracted the deal has
// already been "closed," so a slow delivery/payment isn't the same kind of
// follow-up gap as a lead going cold before it's even signed.
const PRE_CLOSE_STAGES: Deal['status'][] = ['inbound', 'negotiating']

/**
 * A deal is stale if it's sat in a pre-close stage without any update for
 * `staleDays` — the "went cold" case an overdue-invoice check can't catch.
 */
export function isDealStale(deal: Deal, staleDays = 5): boolean {
  if (!PRE_CLOSE_STAGES.includes(deal.status)) return false
  const daysSinceUpdate = (Date.now() - new Date(deal.updated_at).getTime()) / 86_400_000
  return daysSinceUpdate >= staleDays
}

export type FollowUpReason = 'stale' | 'overdue_invoice'

export type FollowUpDeal = { deal: Deal; reason: FollowUpReason }

/**
 * Overdue invoice takes priority when both would technically apply — in
 * practice they're mutually exclusive, since invoicing only happens once a
 * deal is past the pre-close stages this checks for staleness.
 */
export function getDealsNeedingFollowUp(deals: Deal[], staleDays = 5): FollowUpDeal[] {
  const flagged: FollowUpDeal[] = []
  for (const deal of deals) {
    if (isDealOverdueInvoice(deal)) flagged.push({ deal, reason: 'overdue_invoice' })
    else if (isDealStale(deal, staleDays)) flagged.push({ deal, reason: 'stale' })
  }
  return flagged
}

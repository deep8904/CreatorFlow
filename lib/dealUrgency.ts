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

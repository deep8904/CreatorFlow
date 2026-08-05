import type { Draft, DraftStatus } from '@/lib/supabase/types'

export const DRAFT_STATUS_LABEL: Record<DraftStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending review',
  approved: 'Approved',
  changes_requested: 'Changes requested',
}

// Tailwind classes, not a design-token indirection — matches how other small
// status pills in this codebase (e.g. deal stage badges) are styled inline.
export const DRAFT_STATUS_CLASSES: Record<DraftStatus, string> = {
  draft: 'bg-white/[0.06] text-zinc-400',
  pending_review: 'bg-orange-500/10 text-orange-300',
  approved: 'bg-emerald-500/10 text-emerald-300',
  changes_requested: 'bg-rose-500/10 text-rose-300',
}

/** Manager/Owner review queue count — what the notification bell surfaces to a reviewer. */
export function countDraftsPendingReview(drafts: Pick<Draft, 'status'>[]): number {
  return drafts.filter((d) => d.status === 'pending_review').length
}

/** A submitter's own drafts that were sent back — what the bell surfaces to Editor/Designer. */
export function countDraftsNeedingRevision(drafts: Pick<Draft, 'status' | 'submitted_by'>[], userId: string): number {
  return drafts.filter((d) => d.status === 'changes_requested' && d.submitted_by === userId).length
}

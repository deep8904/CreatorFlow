'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, Save, Plus, FileText, Trash2, ArrowLeft, Mic, CalendarClock, Send, CheckCircle2, RotateCcw } from 'lucide-react'
import {
  updateDraftContent,
  createDraft,
  deleteDraft,
  setViewPreference,
  submitDraftForReview,
  approveDraft,
  requestDraftChanges,
} from '@/lib/supabase/actions'
import type { DraftWithIdeaTitle } from '@/lib/supabase/queries'
import { FOCUS, FOCUS_INSET, HOVER } from '@/components/dash/tokens'
import { ViewSwitcher, type ViewType } from '@/components/dash/views/ViewSwitcher'
import { GalleryView } from '@/components/dash/views/GalleryView'
import { BoardView, type BoardColumn } from '@/components/dash/views/BoardView'
import { CalendarView, type CalendarItem } from '@/components/calendar/CalendarView'
import type { ViewCardItem } from '@/components/dash/views/ViewCardItem'
import { DRAFT_STATUS_LABEL, DRAFT_STATUS_CLASSES } from '@/lib/draftReview'
import type { DraftStatus, Role } from '@/lib/supabase/types'
import { useToast } from '@/lib/toast'
import { useSpeechCapture } from '@/lib/useSpeechCapture'

const STATUS_ORDER: DraftStatus[] = ['draft', 'pending_review', 'changes_requested', 'approved']

function StatusPill({ status }: { status: DraftStatus }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-[9999px] px-2 py-0.5 font-nebula-mono text-[10px] font-medium uppercase tracking-wide ${DRAFT_STATUS_CLASSES[status]}`}
    >
      {DRAFT_STATUS_LABEL[status]}
    </span>
  )
}

type DueBucket = 'overdue' | 'this_week' | 'later' | 'none'

function dueBucket(dueDate: string | null): DueBucket {
  if (!dueDate) return 'none'
  const d = new Date(dueDate + 'T00:00:00Z')
  const today = new Date()
  const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  const days = Math.round((d.getTime() - todayUTC) / 86_400_000)
  if (days < 0) return 'overdue'
  if (days <= 7) return 'this_week'
  return 'later'
}

function formatShortDate(iso: string) {
  // timeZone: 'UTC' matters — without it, a date-only value like "2026-08-01"
  // parsed as midnight UTC can render as the previous day in any timezone
  // behind UTC (confirmed live: showed "Jul 31" for an Aug 1 due date).
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(iso + 'T00:00:00Z')
  )
}

function firstNonEmptyLine(text: string) {
  return text.split('\n').map((l) => l.trim()).find(Boolean) ?? null
}

function trimTo(text: string, max: number) {
  return text.length <= max ? text : text.slice(0, max).replace(/\s+\S*$/, '') + '…'
}

/**
 * Idea-aware, not generic — reads what's actually been written (or the
 * linked idea's title) instead of a fixed Hook/Body/Close skeleton with no
 * relationship to the content. Still a template, still honestly labelled;
 * just built from the real draft instead of nothing.
 */
function buildAiAssistSuggestion(title: string, existingContent: string, linkedIdeaTitle: string | null) {
  const topic = linkedIdeaTitle || title || 'this piece'
  const anchor = firstNonEmptyLine(existingContent)
  const lineCount = existingContent.split('\n').filter((l) => l.trim()).length

  const hook = anchor
    ? `Hook: open with "${trimTo(anchor, 90)}" — that's your strongest line so far, lead with it.`
    : `Hook: open with the single most surprising thing about "${topic}."`

  const body =
    lineCount > 1
      ? `Body: you've already got ${lineCount} lines down — expand each into 2-3 sentences of spoken narration, in order.`
      : `Body: break "${topic}" into 3 beats — what happened, why it mattered, what you'd do differently.`

  const close = `Close: one clear call to action tying back to ${topic}.`

  return `\n\n[Structure template — preview only, not a live AI call. Built from what you've written, not a generic skeleton. Starting point, edit freely.]\n${hook}\n${body}\n${close}`
}

export default function DraftsBoard({
  initialDrafts,
  initialView,
  role,
  userId,
}: {
  initialDrafts: DraftWithIdeaTitle[]
  initialView: ViewType
  role: Role
  userId: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  // Stage 3.2: Owner/Editor/Designer write content and submit for review;
  // Manager/Owner approve or reject. Owner gets both — a solo owner is their
  // own reviewer. Manager-only sees the content read-only.
  const canEditContent = role === 'owner' || role === 'editor' || role === 'designer'
  const canReview = role === 'owner' || role === 'manager'
  const [view, setView] = useState<ViewType>(initialView)
  // Deep-link support for `/drafts?draft=<id>` — same pattern as Deals'
  // `?deal=<id>`, used by the Content Calendar to jump straight to a
  // draft. Resolved via a lazy initializer (not an effect) so there's no
  // extra render cycle between the deep-linked draft and first paint.
  const [activeDraft, setActiveDraft] = useState<DraftWithIdeaTitle | null>(() => {
    const draftId = searchParams.get('draft')
    if (draftId) return initialDrafts.find((d) => d.id === draftId) ?? initialDrafts[0] ?? null
    return initialDrafts[0] ?? null
  })
  const [content, setContent] = useState(activeDraft?.body ?? '')
  const [title, setTitle] = useState(activeDraft?.title ?? '')
  const [dueDate, setDueDate] = useState(activeDraft?.due_date ?? '')
  const [isPending, startTransition] = useTransition()
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mobileShowEditor, setMobileShowEditor] = useState(() => searchParams.get('draft') !== null)
  const pendingSelectId = useRef<string | null>(null)
  const isDirty =
    activeDraft !== null &&
    (content !== activeDraft.body || title !== activeDraft.title || dueDate !== (activeDraft.due_date ?? ''))
  const { supported: speechSupported, listening, start: startListening, stop: stopListening } = useSpeechCapture(
    (transcript) => setContent((c) => (c ? `${c}\n${transcript}` : transcript))
  )

  useEffect(() => {
    if (!pendingSelectId.current) return
    const created = initialDrafts.find((d) => d.id === pendingSelectId.current)
    if (created) {
      setActiveDraft(created)
      setContent(created.body)
      setTitle(created.title)
      setDueDate(created.due_date ?? '')
      setMobileShowEditor(true)
      pendingSelectId.current = null
    }
  }, [initialDrafts])

  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const handleSelect = (draft: DraftWithIdeaTitle) => {
    if (isDirty && !window.confirm('You have unsaved changes. Switch drafts anyway?')) return
    setActiveDraft(draft)
    setContent(draft.body)
    setTitle(draft.title)
    setDueDate(draft.due_date ?? '')
    setMobileShowEditor(true)
  }

  const handleSave = () => {
    if (!activeDraft || !title.trim()) return
    const savedId = activeDraft.id
    const savedBody = content
    const savedTitle = title.trim()
    const savedDueDate = dueDate || null
    startTransition(async () => {
      const result = await updateDraftContent(savedId, savedBody, savedTitle, savedDueDate)
      if (result.error) {
        toast.error(result.error)
        return
      }
      // `activeDraft` only ever gets its initial value from the `initialDrafts`
      // prop (server data as of the last full render) — a successful save
      // doesn't itself cause that prop to refresh in this component, so
      // without this, `isDirty` keeps comparing against the pre-save
      // body/title forever and "Unsaved changes" never clears until the
      // next full page load, even though the save genuinely succeeded.
      setActiveDraft((prev) =>
        prev && prev.id === savedId ? { ...prev, body: savedBody, title: savedTitle, due_date: savedDueDate } : prev
      )
    })
  }

  const handleDelete = () => {
    if (!activeDraft) return
    if (!window.confirm(`Delete "${activeDraft.title}"? This can’t be undone.`)) return
    const id = activeDraft.id
    setIsDeleting(true)
    startTransition(async () => {
      const result = await deleteDraft(id)
      setIsDeleting(false)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setActiveDraft(null)
      setContent('')
      setTitle('')
      setDueDate('')
      router.refresh()
    })
  }

  const handleSubmitForReview = () => {
    if (!activeDraft) return
    const id = activeDraft.id
    startTransition(async () => {
      const result = await submitDraftForReview(id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setActiveDraft((prev) => (prev && prev.id === id ? { ...prev, status: 'pending_review', submitted_by: userId } : prev))
      router.refresh()
    })
  }

  const handleApprove = () => {
    if (!activeDraft) return
    const id = activeDraft.id
    startTransition(async () => {
      const result = await approveDraft(id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setActiveDraft((prev) => (prev && prev.id === id ? { ...prev, status: 'approved' } : prev))
      router.refresh()
    })
  }

  const handleRequestChanges = () => {
    if (!activeDraft) return
    const notes = window.prompt('What needs to change?')
    if (notes === null) return
    const trimmed = notes.trim()
    if (!trimmed) {
      toast.error('Explain what needs to change.')
      return
    }
    const id = activeDraft.id
    startTransition(async () => {
      const result = await requestDraftChanges(id, trimmed)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setActiveDraft((prev) =>
        prev && prev.id === id ? { ...prev, status: 'changes_requested', review_notes: trimmed } : prev
      )
      router.refresh()
    })
  }

  const handleNewDraft = async () => {
    if (isDirty && !window.confirm('You have unsaved changes. Start a new draft anyway?')) return
    setIsCreating(true)
    const { id, error } = await createDraft()
    setIsCreating(false)
    if (error || !id) {
      toast.error(error ?? 'Could not create a draft. Please try again.')
      return
    }
    pendingSelectId.current = id
    router.refresh()
  }

  useEffect(() => {
    if (searchParams.get('new') !== '1') return
    router.replace('/drafts')
    Promise.resolve().then(() => handleNewDraft())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // The initial deep-linked draft is already resolved via the lazy state
  // initializer above (covers a real page load). This effect covers the
  // other case: Board/Gallery/Calendar items link to `/drafts?draft=<id>`
  // for a same-page transition — DraftsBoard never unmounts, so without
  // this, clicking one of those cards would update the URL but never
  // actually switch the open draft or leave browse mode.
  useEffect(() => {
    const draftId = searchParams.get('draft')
    if (!draftId) return
    if (draftId === activeDraft?.id) {
      router.replace('/drafts')
      return
    }
    const target = initialDrafts.find((d) => d.id === draftId)
    if (!target) {
      router.replace('/drafts')
      return
    }
    if (isDirty && !window.confirm('You have unsaved changes. Switch drafts anyway?')) {
      router.replace('/drafts')
      return
    }
    // Deferred a tick — this project's stricter react-hooks/set-state-in-
    // effect rule flags direct setState calls in an effect body.
    queueMicrotask(() => {
      setActiveDraft(target)
      setContent(target.body)
      setTitle(target.title)
      setDueDate(target.due_date ?? '')
      setMobileShowEditor(true)
      setView('table')
    })
    router.replace('/drafts')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const changeView = (next: ViewType) => {
    setView(next)
    void setViewPreference('drafts', next)
  }

  const toCardItem = (draft: DraftWithIdeaTitle): ViewCardItem => {
    const tags = [draft.ideas?.title ? `From: ${draft.ideas.title}` : null, DRAFT_STATUS_LABEL[draft.status]].filter(
      (t): t is string => !!t
    )
    return {
      id: draft.id,
      title: draft.title,
      meta: draft.due_date ? `Due ${formatShortDate(draft.due_date)}` : undefined,
      preview: draft.body || undefined,
      tags: tags.length ? tags : undefined,
      tone:
        draft.status === 'changes_requested' || dueBucket(draft.due_date) === 'overdue'
          ? 'attention'
          : draft.status === 'approved'
            ? 'positive'
            : 'default',
      href: `/drafts?draft=${draft.id}`,
    }
  }

  // Status columns, not due-date buckets — Stage 3.2 gives Drafts a real
  // status field, so the board now surfaces the approval state (the thing
  // most worth seeing at a glance) the same way Deals' board surfaces stage.
  const boardColumns: BoardColumn[] = STATUS_ORDER.map((status) => ({
    key: status,
    label: DRAFT_STATUS_LABEL[status],
    items: initialDrafts.filter((d) => d.status === status).map(toCardItem),
  }))

  // Same honesty rule as CalendarBoard (Stage 2.3): only drafts that actually
  // have a due date show up here, nothing fabricated.
  const calendarItems: CalendarItem[] = initialDrafts
    .filter((d): d is DraftWithIdeaTitle & { due_date: string } => !!d.due_date)
    .map((d) => ({
      id: d.id,
      date: d.due_date,
      label: d.title,
      sublabel: 'Draft due',
      tone: dueBucket(d.due_date) === 'overdue' ? 'attention' : 'positive',
      href: `/drafts?draft=${d.id}`,
    }))

  const handleAiAssist = () => {
    setContent((c) => c + buildAiAssistSuggestion(title, c, activeDraft?.ideas?.title ?? null))
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-2.5 sm:px-6">
        <p className="flex items-center gap-1.5 font-nebula-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-orange-400">
          <span aria-hidden className="h-1.5 w-1.5 rounded-[9999px] bg-orange-400" />
          Drafts
        </p>
        <ViewSwitcher value={view} onChange={changeView} />
      </div>

      {view !== 'table' ? (
        <div className="console-scroll min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {initialDrafts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <span aria-hidden className="grid h-11 w-11 place-items-center rounded-[9999px] bg-orange-500/10 text-orange-400">
                <FileText size={18} strokeWidth={2} />
              </span>
              <p className="font-nebula-heading text-[16px] font-semibold text-white">No drafts yet.</p>
              <p className="font-nebula-ui text-[13px] text-zinc-500">Turn one of your ideas into a draft to start writing.</p>
            </div>
          ) : view === 'board' ? (
            <div className="flex h-full">
              <BoardView columns={boardColumns} />
            </div>
          ) : view === 'gallery' ? (
            <GalleryView items={initialDrafts.map(toCardItem)} />
          ) : (
            <CalendarView
              items={calendarItems}
              emptyState={
                <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                  <span aria-hidden className="grid h-11 w-11 place-items-center rounded-[9999px] bg-orange-500/10 text-orange-400">
                    <CalendarClock size={18} strokeWidth={2} />
                  </span>
                  <p className="font-nebula-heading text-[16px] font-semibold text-white">No due dates set.</p>
                  <p className="font-nebula-ui text-[13px] text-zinc-500">Set a due date on a draft and it shows up here.</p>
                </div>
              }
            />
          )}
        </div>
      ) : (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div
        className={`w-full shrink-0 flex-col border-r border-white/[0.06] bg-white/[0.02] backdrop-blur-xl md:flex md:w-[260px] ${
          mobileShowEditor ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-4">
          <div>
            <p className="flex items-center gap-1.5 font-nebula-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-orange-400">
              <span aria-hidden className="h-1.5 w-1.5 rounded-[9999px] bg-orange-400" />
              Drafts
            </p>
            <h1 className="mt-1 font-nebula-heading text-[17px] font-semibold text-white">Drafts</h1>
          </div>
          {canEditContent && (
            <button
              type="button"
              onClick={handleNewDraft}
              disabled={isCreating}
              aria-label="New draft"
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9999px] bg-orange-500/[0.15] text-orange-300 hover:bg-orange-500/[0.25] disabled:opacity-50 ${HOVER} ${FOCUS}`}
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>
        <div className="console-scroll flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {initialDrafts.length === 0 ? (
            <div className="p-4 text-center">
              <p className="font-nebula-ui text-[13px] text-zinc-400">No drafts yet.</p>
              <p className="mt-1 font-nebula-ui text-[12px] text-zinc-600">Turn one of your ideas into a draft to start writing.</p>
            </div>
          ) : (
            initialDrafts.map((draft) => (
              <button
                key={draft.id}
                type="button"
                onClick={() => handleSelect(draft)}
                className={`w-full rounded-[12px] px-3 py-3 text-left transition-colors ${FOCUS_INSET} ${
                  activeDraft?.id === draft.id ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                }`}
              >
                <p className="mb-1 line-clamp-2 font-nebula-ui text-[13px] font-semibold leading-snug text-zinc-100">
                  {draft.title}
                </p>
                {draft.ideas?.title && (
                  <p className="mb-1 truncate font-nebula-ui text-[11px] text-zinc-500">From: {draft.ideas.title}</p>
                )}
                <div className="flex items-center justify-between gap-2">
                  <p className="font-nebula-ui text-[11px] text-zinc-600">{new Date(draft.updated_at).toLocaleDateString()}</p>
                  {draft.status !== 'draft' && <StatusPill status={draft.status} />}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {activeDraft ? (
        <div className={`flex-1 flex-col overflow-hidden ${mobileShowEditor ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex shrink-0 flex-col gap-3 border-b border-white/[0.06] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
            <div className="flex min-w-0 items-center">
              <button
                type="button"
                onClick={() => setMobileShowEditor(false)}
                aria-label="Back to drafts list"
                className={`-ml-1 mr-2 grid h-9 w-9 shrink-0 place-items-center rounded-[9999px] text-zinc-400 hover:bg-white/[0.06] hover:text-white md:hidden ${HOVER} ${FOCUS_INSET}`}
              >
                <ArrowLeft size={16} strokeWidth={2} />
              </button>
              <div className="min-w-0 flex-1 md:mr-4">
                <div className="mb-0.5 flex items-center gap-2">
                  {activeDraft.ideas?.title && (
                    <p className="truncate font-nebula-ui text-[11px] text-zinc-600">
                      From: <span className="font-medium text-zinc-400">{activeDraft.ideas.title}</span>
                    </p>
                  )}
                  {activeDraft.status !== 'draft' && <StatusPill status={activeDraft.status} />}
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  readOnly={!canEditContent}
                  aria-label="Draft title"
                  className={`w-full truncate rounded-[6px] bg-transparent px-1 -mx-1 font-nebula-heading text-[16px] font-semibold text-white outline-none ${
                    canEditContent ? 'hover:bg-white/[0.04] focus:bg-white/[0.04]' : ''
                  } ${FOCUS}`}
                />
                <label className="mt-1 flex w-fit items-center gap-1.5 rounded-[6px] px-1 -mx-1 hover:bg-white/[0.04]">
                  <CalendarClock size={12} strokeWidth={2} className="shrink-0 text-zinc-600" />
                  <span className="sr-only">Due date</span>
                  <input
                    type="date"
                    value={dueDate ?? ''}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={!canEditContent}
                    className={`bg-transparent font-nebula-ui text-[11px] text-zinc-500 outline-none disabled:opacity-70 ${FOCUS}`}
                  />
                </label>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 overflow-x-auto">
              {isDirty && !isPending && (
                <span className="whitespace-nowrap font-nebula-ui text-[11px] text-zinc-600">Unsaved changes</span>
              )}
              {canReview && activeDraft.status === 'pending_review' && (
                <>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isPending}
                    className={`flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[9999px] bg-emerald-500/[0.15] px-3.5 font-nebula-ui text-[12px] font-medium text-emerald-300 hover:bg-emerald-500/[0.25] disabled:opacity-50 ${HOVER} ${FOCUS}`}
                  >
                    <CheckCircle2 size={14} strokeWidth={2} />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestChanges}
                    disabled={isPending}
                    className={`flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[9999px] border border-white/10 px-3.5 font-nebula-ui text-[12px] font-medium text-zinc-300 hover:bg-white/[0.05] hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS}`}
                  >
                    <RotateCcw size={13} strokeWidth={2} />
                    Request changes
                  </button>
                </>
              )}
              {canEditContent && (activeDraft.status === 'draft' || activeDraft.status === 'changes_requested') && (
                <button
                  type="button"
                  onClick={handleSubmitForReview}
                  disabled={isPending || !title.trim()}
                  className={`flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[9999px] border border-orange-500/30 bg-orange-500/[0.12] px-3.5 font-nebula-ui text-[12px] font-medium text-orange-300 hover:bg-orange-500/[0.2] disabled:pointer-events-none disabled:opacity-50 ${HOVER} ${FOCUS}`}
                >
                  <Send size={13} strokeWidth={2} />
                  {activeDraft.status === 'changes_requested' ? 'Resubmit for review' : 'Submit for review'}
                </button>
              )}
              {canEditContent && speechSupported && (
                <button
                  type="button"
                  onClick={() => (listening ? stopListening() : startListening())}
                  aria-label={listening ? 'Stop voice capture' : 'Capture draft text by voice'}
                  aria-pressed={listening}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-[9999px] ${HOVER} ${FOCUS} ${
                    listening
                      ? 'animate-pulse bg-orange-500/20 text-orange-300'
                      : 'text-zinc-500 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Mic size={15} strokeWidth={2} />
                </button>
              )}
              {canEditContent && (
                <button
                  type="button"
                  onClick={handleAiAssist}
                  title="Inserts a structure template — preview only, not a live AI call"
                  className={`flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[9999px] border border-white/10 px-3.5 font-nebula-ui text-[12px] font-medium text-zinc-300 hover:bg-white/[0.05] hover:text-white ${HOVER} ${FOCUS}`}
                >
                  <Sparkles size={13} strokeWidth={2} className="text-orange-400" />
                  AI assist — preview
                </button>
              )}
              {canEditContent && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending || !title.trim()}
                  className={`nebula-cta-static flex h-9 items-center gap-1.5 rounded-[9999px] px-4 font-nebula-tech text-[12.5px] font-medium disabled:pointer-events-none disabled:opacity-50 ${FOCUS}`}
                >
                  <span className="nebula-cta__label flex items-center gap-1.5">
                    {!isPending && <Save size={13} strokeWidth={2} />}
                    {isPending ? 'Saving…' : 'Save'}
                  </span>
                </button>
              )}
              {canEditContent && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  aria-label="Delete draft"
                  title="Delete draft"
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-[9999px] text-zinc-500 hover:bg-white/[0.08] hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS_INSET}`}
                >
                  <Trash2 size={15} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>

          {activeDraft.status === 'changes_requested' && activeDraft.review_notes && (
            <div className="mx-4 mt-4 rounded-[12px] border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 md:mx-8">
              <p className="font-nebula-mono text-[10px] font-medium uppercase tracking-wide text-rose-300">
                Changes requested
              </p>
              <p className="mt-1 font-nebula-ui text-[13px] leading-relaxed text-zinc-300">{activeDraft.review_notes}</p>
            </div>
          )}

          <textarea
            className={`flex-1 resize-none bg-transparent px-6 py-6 font-nebula-ui text-[15px] leading-[1.75] text-zinc-200 outline-none placeholder:text-zinc-600 md:px-12 md:py-10 ${FOCUS}`}
            style={{ letterSpacing: '-0.2px' }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            readOnly={!canEditContent}
            placeholder="Start writing..."
          />
        </div>
      ) : (
        <div className={`flex-1 items-center justify-center ${mobileShowEditor ? 'flex' : 'hidden md:flex'}`}>
          <div className="text-center">
            <span aria-hidden className="mx-auto grid h-11 w-11 place-items-center rounded-[9999px] bg-orange-500/10 text-orange-400">
              <FileText size={18} strokeWidth={2} />
            </span>
            <p className="mt-4 font-nebula-heading text-[16px] font-semibold text-white">No draft selected.</p>
            <p className="mt-1 font-nebula-ui text-[13px] text-zinc-500">
              Turn one of your ideas into a draft to start writing.
            </p>
          </div>
        </div>
      )}
    </div>
      )}
    </div>
  )
}

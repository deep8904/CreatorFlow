'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, Save, Plus, FileText, Trash2, ArrowLeft, Mic, CalendarClock } from 'lucide-react'
import { updateDraftContent, createDraft, deleteDraft } from '@/lib/supabase/actions'
import type { DraftWithIdeaTitle } from '@/lib/supabase/queries'
import { FOCUS, FOCUS_INSET, HOVER } from '@/components/dash/tokens'
import { useToast } from '@/lib/toast'
import { useSpeechCapture } from '@/lib/useSpeechCapture'

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

export default function DraftsBoard({ initialDrafts }: { initialDrafts: DraftWithIdeaTitle[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
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

  // The draft itself is already resolved via the lazy state initializer
  // above — this just cleans the param out of the URL once mounted.
  useEffect(() => {
    if (searchParams.get('draft')) router.replace('/drafts')
  }, [searchParams, router])

  const handleAiAssist = () => {
    setContent((c) => c + buildAiAssistSuggestion(title, c, activeDraft?.ideas?.title ?? null))
  }

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">
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
          <button
            type="button"
            onClick={handleNewDraft}
            disabled={isCreating}
            aria-label="New draft"
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9999px] bg-orange-500/[0.15] text-orange-300 hover:bg-orange-500/[0.25] disabled:opacity-50 ${HOVER} ${FOCUS}`}
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
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
                <p className="font-nebula-ui text-[11px] text-zinc-600">{new Date(draft.updated_at).toLocaleDateString()}</p>
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
                {activeDraft.ideas?.title && (
                  <p className="mb-0.5 truncate font-nebula-ui text-[11px] text-zinc-600">
                    From: <span className="font-medium text-zinc-400">{activeDraft.ideas.title}</span>
                  </p>
                )}
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  aria-label="Draft title"
                  className={`w-full truncate rounded-[6px] bg-transparent px-1 -mx-1 font-nebula-heading text-[16px] font-semibold text-white outline-none hover:bg-white/[0.04] focus:bg-white/[0.04] ${FOCUS}`}
                />
                <label className="mt-1 flex w-fit items-center gap-1.5 rounded-[6px] px-1 -mx-1 hover:bg-white/[0.04]">
                  <CalendarClock size={12} strokeWidth={2} className="shrink-0 text-zinc-600" />
                  <span className="sr-only">Due date</span>
                  <input
                    type="date"
                    value={dueDate ?? ''}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={`bg-transparent font-nebula-ui text-[11px] text-zinc-500 outline-none ${FOCUS}`}
                  />
                </label>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 overflow-x-auto">
              {isDirty && !isPending && (
                <span className="whitespace-nowrap font-nebula-ui text-[11px] text-zinc-600">Unsaved changes</span>
              )}
              {speechSupported && (
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
              <button
                type="button"
                onClick={handleAiAssist}
                title="Inserts a structure template — preview only, not a live AI call"
                className={`flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[9999px] border border-white/10 px-3.5 font-nebula-ui text-[12px] font-medium text-zinc-300 hover:bg-white/[0.05] hover:text-white ${HOVER} ${FOCUS}`}
              >
                <Sparkles size={13} strokeWidth={2} className="text-orange-400" />
                AI assist — preview
              </button>
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
            </div>
          </div>

          <textarea
            className={`flex-1 resize-none bg-transparent px-6 py-6 font-nebula-ui text-[15px] leading-[1.75] text-zinc-200 outline-none placeholder:text-zinc-600 md:px-12 md:py-10 ${FOCUS}`}
            style={{ letterSpacing: '-0.2px' }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
  )
}

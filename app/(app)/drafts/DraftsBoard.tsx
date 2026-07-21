'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, Save, Plus, FileText, Trash2 } from 'lucide-react'
import { updateDraftContent, createDraft, deleteDraft } from '@/lib/supabase/actions'
import type { DraftWithIdeaTitle } from '@/lib/supabase/queries'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { useToast } from '@/lib/toast'

const AI_ASSIST_SUGGESTION =
  '\n\n[Structure template — preview only, not a live AI call. Starting point, edit freely.]\nHook: open with the single most surprising line from your notes above.\nBody: expand each bullet into 2-3 sentences of spoken narration.\nClose: one clear call to action tying back to the hook.'

export default function DraftsBoard({ initialDrafts }: { initialDrafts: DraftWithIdeaTitle[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const [activeDraft, setActiveDraft] = useState<DraftWithIdeaTitle | null>(initialDrafts[0] ?? null)
  const [content, setContent] = useState(activeDraft?.body ?? '')
  const [title, setTitle] = useState(activeDraft?.title ?? '')
  const [isPending, startTransition] = useTransition()
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const pendingSelectId = useRef<string | null>(null)
  const isDirty = activeDraft !== null && (content !== activeDraft.body || title !== activeDraft.title)

  // Once a freshly created draft shows up in the refreshed list, select it —
  // otherwise it's created but never opened, leaving an extra manual click.
  useEffect(() => {
    if (!pendingSelectId.current) return
    const created = initialDrafts.find((d) => d.id === pendingSelectId.current)
    if (created) {
      setActiveDraft(created)
      setContent(created.body)
      setTitle(created.title)
      pendingSelectId.current = null
    }
  }, [initialDrafts])

  // Warn on tab close/refresh with unsaved edits — browsers show their own
  // generic confirmation text, the string here is ignored by modern ones.
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
  }

  const handleSave = () => {
    if (!activeDraft || !title.trim()) return
    startTransition(async () => {
      const result = await updateDraftContent(activeDraft.id, content, title)
      if (result.error) toast.error(result.error)
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

  // Deep link from the dashboard's "Start a draft" action. Deferred to a
  // microtask so the mutation isn't triggered synchronously within the effect.
  useEffect(() => {
    if (searchParams.get('new') !== '1') return
    router.replace('/drafts')
    Promise.resolve().then(() => handleNewDraft())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleAiAssist = () => {
    setContent((c) => c + AI_ASSIST_SUGGESTION)
  }

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Draft list sidebar */}
      <div className="w-[240px] shrink-0 border-r border-fog bg-linen flex flex-col">
        <div className="px-4 py-4 border-b border-fog flex items-center justify-between shrink-0">
          <h1 className="text-app-h1 text-carbon">Drafts</h1>
          <button
            onClick={handleNewDraft}
            disabled={isCreating}
            aria-label="New draft"
            className="w-7 h-7 flex items-center justify-center rounded-full bg-lavender/10 text-lavender hover:bg-lavender/20 disabled:opacity-50 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {initialDrafts.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-[13px] text-graphite">No drafts yet.</p>
              <p className="text-[12px] text-ash mt-1">Turn one of your ideas into a draft to start writing.</p>
            </div>
          ) : (
            initialDrafts.map((draft) => (
              <button
                key={draft.id}
                onClick={() => handleSelect(draft)}
                className={`w-full text-left px-3 py-3 rounded-xl transition-colors ${
                  activeDraft?.id === draft.id ? 'bg-paper-white border border-fog' : 'hover:bg-paper-white/70'
                }`}
                style={activeDraft?.id === draft.id ? { boxShadow: 'var(--shadow-subtle)' } : undefined}
              >
                <p
                  className="font-semibold text-carbon leading-snug mb-1 line-clamp-2"
                  style={{ fontSize: '13px', letterSpacing: '-0.25px' }}
                >
                  {draft.title}
                </p>
                <p className="text-[11px] text-ash">{new Date(draft.updated_at).toLocaleDateString()}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      {activeDraft ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-paper-white">
          {/* Editor header */}
          <div className="px-8 py-4 border-b border-fog flex items-center justify-between shrink-0">
            <div className="min-w-0 flex-1 mr-4">
              {activeDraft.ideas?.title && (
                <p className="text-[11px] text-ash mb-0.5">
                  From: <span className="text-graphite font-medium">{activeDraft.ideas.title}</span>
                </p>
              )}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Draft title"
                className="font-bold text-carbon truncate bg-transparent outline-none w-full rounded px-1 -mx-1 hover:bg-linen focus:bg-linen transition-colors"
                style={{ fontSize: '16px', letterSpacing: '-0.03em' }}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isDirty && !isPending && <span className="text-[11px] text-ash">Unsaved changes</span>}
              <Button
                variant="secondary"
                onClick={handleAiAssist}
                size="md"
                iconLeft={<Sparkles size={13} className="text-lavender" />}
                title="Inserts a structure template — preview only, not a live AI call"
              >
                AI assist — preview
              </Button>
              <Button onClick={handleSave} disabled={isPending || !title.trim()} loading={isPending} size="md" iconLeft={!isPending ? <Save size={13} /> : undefined}>
                Save
              </Button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                aria-label="Delete draft"
                title="Delete draft"
                className="w-9 h-9 flex items-center justify-center rounded-xl text-ash hover:text-carbon hover:bg-linen transition-colors disabled:opacity-50 shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Text area */}
          <textarea
            className="flex-1 resize-none px-12 py-10 text-carbon bg-paper-white outline-none placeholder-ash"
            style={{ fontSize: '16px', letterSpacing: '-0.3px', lineHeight: '1.75' }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-paper-white">
          <EmptyState
            icon={<FileText size={18} className="text-ash" strokeWidth={2} />}
            title="No draft selected."
            description="Turn one of your ideas into a draft to start writing."
          />
        </div>
      )}
    </div>
  )
}

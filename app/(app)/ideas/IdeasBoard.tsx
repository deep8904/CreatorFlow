'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Lightbulb, Mic, Trash2 } from 'lucide-react'
import { createIdea, createDraftFromIdea, updateIdea, deleteIdea, type IdeaFormInput } from '@/lib/supabase/actions'
import type { Idea } from '@/lib/supabase/types'
import { GlassModal } from '@/components/dash/GlassModal'
import { FieldLabel, FieldInput, FieldTextarea } from '@/components/dash/FormField'
import { SearchField } from '@/components/dash/SearchField'
import { Pill, PillButton } from '@/components/dash/Pill'
import { DashboardHeader } from '@/components/dash/DashboardHeader'
import { MetricGrid, type Metric } from '@/components/dash/MetricCard'
import { FOCUS, FOCUS_INSET, HOVER } from '@/components/dash/tokens'
import { useToast } from '@/lib/toast'
import { useSpeechCapture } from '@/lib/useSpeechCapture'

const STATUS_LABEL: Record<Idea['status'], string> = {
  new: 'New',
  in_progress: 'In Progress',
  scheduled: 'Scheduled',
  done: 'Done',
  archived: 'Archived',
}

const ALL_STATUSES: Idea['status'][] = ['new', 'in_progress', 'scheduled', 'done', 'archived']
const FILTERABLE_STATUSES: Idea['status'][] = ['new', 'in_progress', 'scheduled', 'done']

function IdeaModal({
  idea,
  onClose,
  onSubmit,
  onDelete,
  isPending,
}: {
  idea: Idea
  onClose: () => void
  onSubmit: (input: IdeaFormInput) => void
  onDelete: () => void
  isPending: boolean
}) {
  const [title, setTitle] = useState(idea.title)
  const [notes, setNotes] = useState(idea.notes ?? '')
  const [tagsText, setTagsText] = useState(idea.tags.join(', '))
  const [status, setStatus] = useState<Idea['status']>(idea.status)

  const submit = () => {
    if (!title.trim()) return
    onSubmit({
      title,
      notes,
      tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean),
      status,
    })
  }

  return (
    <GlassModal title="Edit idea" onClose={onClose}>
      <div className="flex flex-col gap-3.5">
        <div>
          <FieldLabel htmlFor="idea-title">Title</FieldLabel>
          <FieldInput id="idea-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <FieldLabel htmlFor="idea-notes">Notes</FieldLabel>
          <FieldTextarea id="idea-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>
        <div>
          <FieldLabel htmlFor="idea-tags">Tags</FieldLabel>
          <FieldInput id="idea-tags" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="setup, gear, business" />
        </div>
        <div>
          <FieldLabel>Status</FieldLabel>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {ALL_STATUSES.map((s) => (
              <PillButton key={s} active={status === s} onClick={() => setStatus(s)}>
                {STATUS_LABEL[s]}
              </PillButton>
            ))}
          </div>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={!title.trim() || isPending}
            className={`nebula-cta-static flex h-10 flex-1 items-center justify-center rounded-[9999px] font-nebula-tech text-[13px] font-medium disabled:pointer-events-none disabled:opacity-50 ${FOCUS}`}
          >
            <span className="nebula-cta__label">Save changes</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete idea"
            title="Delete idea"
            disabled={isPending}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-[9999px] text-zinc-500 hover:bg-white/[0.08] hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS_INSET}`}
          >
            <Trash2 size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </GlassModal>
  )
}

export default function IdeasBoard({ initialIdeas }: { initialIdeas: Idea[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const [filter, setFilter] = useState<Idea['status'] | 'All'>('All')
  const [query, setQuery] = useState('')
  const [newOpen, setNewOpen] = useState(() => searchParams.get('new') === '1')
  const [newTitle, setNewTitle] = useState('')
  const { supported: speechSupported, listening, start: startListening, stop: stopListening } = useSpeechCapture(
    (transcript) => setNewTitle((t) => (t ? `${t} ${transcript}` : transcript))
  )
  const [isPending, startTransition] = useTransition()
  const [turningIntoDraftId, setTurningIntoDraftId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(() => searchParams.get('open'))
  const editing = initialIdeas.find((i) => i.id === editingId) ?? null

  useEffect(() => {
    if (searchParams.get('new') === '1' || searchParams.get('open')) {
      router.replace('/ideas')
    }
  }, [searchParams, router])

  const byStatus = filter === 'All' ? initialIdeas : initialIdeas.filter((i) => i.status === filter)
  const filtered = query.trim()
    ? byStatus.filter((i) => i.title.toLowerCase().includes(query.trim().toLowerCase()))
    : byStatus

  const addIdea = () => {
    if (!newTitle.trim()) return
    const title = newTitle.trim()
    setNewTitle('')
    setNewOpen(false)
    startTransition(async () => {
      const result = await createIdea(title)
      if (result.error) toast.error(result.error)
    })
  }

  const turnIntoDraft = async (idea: Idea) => {
    setTurningIntoDraftId(idea.id)
    const result = await createDraftFromIdea(idea.id, idea.title)
    setTurningIntoDraftId(null)
    if (result.error || !result.id) {
      toast.error(result.error ?? 'Could not create a draft. Please try again.')
      return
    }
    router.push('/drafts')
  }

  const saveIdea = (input: IdeaFormInput) => {
    if (!editingId) return
    startTransition(async () => {
      const result = await updateIdea(editingId, input)
      if (result.error) toast.error(result.error)
    })
    setEditingId(null)
  }

  const removeIdea = () => {
    if (!editingId) return
    if (!window.confirm('Delete this idea? This can’t be undone.')) return
    startTransition(async () => {
      const result = await deleteIdea(editingId)
      if (result.error) toast.error(result.error)
    })
    setEditingId(null)
  }

  const ideaMetrics: Metric[] = [
    { label: 'Total ideas', value: String(initialIdeas.length), icon: <Lightbulb size={14} /> },
    { label: 'New', value: String(initialIdeas.filter((i) => i.status === 'new').length) },
    { label: 'In progress', value: String(initialIdeas.filter((i) => i.status === 'in_progress').length) },
    { label: 'Shipped', value: String(initialIdeas.filter((i) => i.status === 'done').length) },
  ]

  return (
    <>
      <DashboardHeader
        eyebrow="Ideas"
        title="Ideas"
        description={`${initialIdeas.length} ${initialIdeas.length === 1 ? 'idea' : 'ideas'} captured`}
        right={
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className={`nebula-cta-static inline-flex h-9 items-center gap-1.5 rounded-[9999px] px-4 font-nebula-tech text-[12.5px] font-medium ${FOCUS}`}
          >
            <span className="nebula-cta__label">
              New idea <ArrowRight size={13} className="ml-1 inline" />
            </span>
          </button>
        }
      />

      <main id="dashboard-main" className="console-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-[880px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6">
          <MetricGrid metrics={ideaMetrics} />
        </div>

        {newOpen && (
          <div className="nebula-border mb-5 rounded-[1.25rem] bg-white/[0.03] p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <input
                autoFocus
                placeholder="What's the idea?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) addIdea()
                }}
                className={`min-w-0 flex-1 bg-transparent font-nebula-ui text-[15px] text-white outline-none placeholder:text-zinc-600 ${FOCUS}`}
              />
              {speechSupported && (
                <button
                  type="button"
                  onClick={() => (listening ? stopListening() : startListening())}
                  aria-label={listening ? 'Stop voice capture' : 'Capture idea by voice'}
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
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addIdea}
                disabled={isPending}
                className={`nebula-cta-static inline-flex h-9 items-center rounded-[9999px] px-4 font-nebula-tech text-[12.5px] font-medium disabled:pointer-events-none disabled:opacity-50 ${FOCUS}`}
              >
                <span className="nebula-cta__label">Save idea</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewOpen(false)
                  setNewTitle('')
                }}
                className={`inline-flex h-9 items-center rounded-[9999px] px-4 font-nebula-ui text-[12.5px] font-medium text-zinc-400 hover:bg-white/[0.05] hover:text-white ${HOVER} ${FOCUS}`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-0 overflow-x-auto">
            {(['All', ...FILTERABLE_STATUSES] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`shrink-0 border-b-2 -mb-px px-3.5 py-2.5 font-nebula-ui text-[12.5px] font-medium transition-colors ${
                  filter === s ? 'border-orange-400 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {s === 'All' ? 'All' : STATUS_LABEL[s]}
              </button>
            ))}
          </div>
          <SearchField value={query} onChange={setQuery} placeholder="Search ideas" className="w-full sm:w-[180px]" />
        </div>

        {filtered.length === 0 ? (
          <div className="py-14 text-center">
            <span aria-hidden className="mx-auto grid h-11 w-11 place-items-center rounded-[9999px] bg-orange-500/10 text-orange-400">
              <Lightbulb size={18} strokeWidth={2} />
            </span>
            <p className="mt-4 font-nebula-heading text-[16px] font-semibold text-white">
              {query.trim() ? 'No ideas match your search.' : 'No ideas yet.'}
            </p>
            <p className="mt-1 font-nebula-ui text-[13px] text-zinc-500">
              {query.trim() ? 'Try a different search term.' : 'The next one you have — write it down here before it disappears.'}
            </p>
            {!query.trim() && (
              <button
                type="button"
                onClick={() => setNewOpen(true)}
                className={`nebula-cta nebula-cta--wide mt-5 inline-flex h-9 items-center rounded-[9999px] px-4 font-nebula-tech text-[12.5px] font-medium ${FOCUS}`}
              >
                <span className="nebula-cta__label">Add your first idea</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((idea) => (
              <div
                key={idea.id}
                role="button"
                tabIndex={0}
                onClick={() => setEditingId(idea.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setEditingId(idea.id)
                  }
                }}
                className={`nebula-border cursor-pointer rounded-[1.25rem] bg-white/[0.03] p-4 backdrop-blur-xl transition-colors hover:bg-white/[0.05] sm:p-5 ${FOCUS_INSET}`}
              >
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="mb-1.5 font-nebula-ui text-[14.5px] font-semibold leading-snug text-zinc-100">{idea.title}</p>
                    {idea.notes && (
                      <p className="mb-3 font-nebula-ui text-[13px] leading-relaxed text-zinc-400">{idea.notes}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={idea.status === 'done' ? 'positive' : 'default'}>{STATUS_LABEL[idea.status]}</Pill>
                      {idea.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-[9999px] border border-white/10 px-2.5 py-1 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.06em] text-zinc-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      turnIntoDraft(idea)
                    }}
                    disabled={turningIntoDraftId === idea.id}
                    className={`mt-0.5 shrink-0 whitespace-nowrap font-nebula-ui text-[12px] font-medium text-orange-400 hover:text-orange-300 disabled:opacity-50 ${HOVER} ${FOCUS_INSET} rounded-[6px] px-1 py-0.5`}
                  >
                    {turningIntoDraftId === idea.id ? 'Creating draft…' : 'Turn into draft'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <IdeaModal idea={editing} onClose={() => setEditingId(null)} onSubmit={saveIdea} onDelete={removeIdea} isPending={isPending} />
      )}
      </main>
    </>
  )
}

'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Lightbulb, Trash2 } from 'lucide-react'
import { createDraftFromIdea, updateIdea, deleteIdea, setViewPreference, type IdeaFormInput } from '@/lib/supabase/actions'
import type { Idea } from '@/lib/supabase/types'
import { GlassModal } from '@/components/dash/GlassModal'
import { QuickIdeaForm } from '@/components/dash/QuickIdeaForm'
import { FieldLabel, FieldInput, FieldTextarea } from '@/components/dash/FormField'
import { SearchField } from '@/components/dash/SearchField'
import { Pill, PillButton } from '@/components/dash/Pill'
import { DashboardHeader } from '@/components/dash/DashboardHeader'
import { MetricGrid, type Metric } from '@/components/dash/MetricCard'
import { FOCUS, FOCUS_INSET, HOVER } from '@/components/dash/tokens'
import { ViewSwitcher, type ViewType } from '@/components/dash/views/ViewSwitcher'
import { GalleryView } from '@/components/dash/views/GalleryView'
import { BoardView, type BoardColumn } from '@/components/dash/views/BoardView'
import { CalendarView, type CalendarItem } from '@/components/calendar/CalendarView'
import type { ViewCardItem } from '@/components/dash/views/ViewCardItem'
import { useToast } from '@/lib/toast'

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

export default function IdeasBoard({ initialIdeas, initialView }: { initialIdeas: Idea[]; initialView: ViewType }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const [filter, setFilter] = useState<Idea['status'] | 'All'>('All')
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ViewType>(initialView)
  const [newOpen, setNewOpen] = useState(() => searchParams.get('new') === '1')
  const [isPending, startTransition] = useTransition()
  const [turningIntoDraftId, setTurningIntoDraftId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(() => searchParams.get('open'))
  const editing = initialIdeas.find((i) => i.id === editingId) ?? null

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      router.replace('/ideas')
    }
  }, [searchParams, router])

  // Separate from the effect above: Board/Gallery/Calendar items link to
  // `/ideas?open=<id>` for a same-page transition (IdeasBoard never
  // unmounts), so `editingId`'s lazy useState initializer only ever catches
  // the very first page load — this is what makes clicking one of those
  // cards actually open the modal on every subsequent click too.
  useEffect(() => {
    const openId = searchParams.get('open')
    if (!openId || openId === editingId) return
    // Deferred a tick — this project's stricter react-hooks/set-state-in-
    // effect rule flags a direct setState call in an effect body.
    queueMicrotask(() => setEditingId(openId))
    router.replace('/ideas')
  }, [searchParams, editingId, router])

  const changeView = (next: ViewType) => {
    setView(next)
    void setViewPreference('ideas', next)
  }

  const byStatus = filter === 'All' ? initialIdeas : initialIdeas.filter((i) => i.status === filter)
  const filtered = query.trim()
    ? byStatus.filter((i) => i.title.toLowerCase().includes(query.trim().toLowerCase()))
    : byStatus

  const toCardItem = (idea: Idea): ViewCardItem => ({
    id: idea.id,
    title: idea.title,
    meta: STATUS_LABEL[idea.status],
    preview: idea.notes ?? undefined,
    tags: idea.tags,
    tone: idea.status === 'done' ? 'positive' : 'default',
    href: `/ideas?open=${idea.id}`,
  })

  const boardColumns: BoardColumn[] = ALL_STATUSES.map((status) => ({
    key: status,
    label: STATUS_LABEL[status],
    items: filtered.filter((i) => i.status === status).map(toCardItem),
  }))

  // Ideas have no due date — this is honestly labelled "Captured" rather
  // than fabricating a deadline that doesn't exist in the data.
  const calendarItems: CalendarItem[] = filtered.map((idea) => ({
    id: idea.id,
    date: idea.created_at.slice(0, 10),
    label: idea.title,
    sublabel: 'Captured',
    tone: idea.status === 'done' ? 'positive' : 'default',
    href: `/ideas?open=${idea.id}`,
  }))

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
            <QuickIdeaForm onSaved={() => setNewOpen(false)} onCancel={() => setNewOpen(false)} />
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
          <div className="flex items-center gap-2.5">
            <ViewSwitcher value={view} onChange={changeView} />
            <SearchField value={query} onChange={setQuery} placeholder="Search ideas" className="w-full sm:w-[180px]" />
          </div>
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
              {query.trim() ? 'Try a different search term.' : 'The next one you have. Write it down here before it disappears.'}
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
        ) : view === 'table' ? (
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
        ) : view === 'board' ? (
          <div className="flex h-[560px]">
            <BoardView columns={boardColumns} />
          </div>
        ) : view === 'gallery' ? (
          <GalleryView items={filtered.map(toCardItem)} />
        ) : (
          <CalendarView items={calendarItems} />
        )}
      </div>

      {editing && (
        <IdeaModal idea={editing} onClose={() => setEditingId(null)} onSubmit={saveIdea} onDelete={removeIdea} isPending={isPending} />
      )}
      </main>
    </>
  )
}

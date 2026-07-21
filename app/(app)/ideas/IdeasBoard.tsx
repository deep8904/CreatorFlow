'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Lightbulb, X, Trash2, Search } from 'lucide-react'
import { createIdea, createDraftFromIdea, updateIdea, deleteIdea, type IdeaFormInput } from '@/lib/supabase/actions'
import type { Idea } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/ui/empty-state'
import { useToast } from '@/lib/toast'
import { useEscapeKey } from '@/lib/useEscapeKey'

const STATUS_LABEL: Record<Idea['status'], string> = {
  new: 'New',
  in_progress: 'In Progress',
  scheduled: 'Scheduled',
  done: 'Done',
  archived: 'Archived',
}

const ALL_STATUSES: Idea['status'][] = ['new', 'in_progress', 'scheduled', 'done', 'archived']
const FILTERABLE_STATUSES: Idea['status'][] = ['new', 'in_progress', 'scheduled', 'done']

function statusStyle(status: Idea['status']) {
  return status === 'done' ? 'bg-lavender/10 text-lavender' : 'bg-fog text-graphite'
}

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
  useEscapeKey(onClose)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-[440px] bg-paper-white border border-fog rounded-xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-bold text-carbon">Edit idea</h2>
          <button onClick={onClose} aria-label="Close" className="w-7 h-7 flex items-center justify-center text-ash hover:text-carbon rounded-full hover:bg-linen transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          <div>
            <Label htmlFor="idea-title">Title</Label>
            <Input id="idea-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="idea-notes">Notes</Label>
            <Textarea id="idea-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
          <div>
            <Label htmlFor="idea-tags">Tags</Label>
            <Input id="idea-tags" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="setup, gear, business" />
          </div>
          <div>
            <Label>Status</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`font-label text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1.5 rounded-full transition-colors ${
                    status === s ? 'bg-lavender/15 text-lavender' : 'bg-fog text-graphite hover:opacity-80'
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Button onClick={submit} disabled={!title.trim() || isPending} size="md" className="flex-1">
              Save changes
            </Button>
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete idea"
              title="Delete idea"
              disabled={isPending}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-ash hover:text-carbon hover:bg-linen transition-colors disabled:opacity-50"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function IdeasBoard({ initialIdeas }: { initialIdeas: Idea[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const [filter, setFilter] = useState<Idea['status'] | 'All'>('All')
  const [query, setQuery] = useState('')
  // Deep link from the dashboard's "Capture an idea" action.
  const [newOpen, setNewOpen] = useState(() => searchParams.get('new') === '1')
  const [newTitle, setNewTitle] = useState('')
  const [isPending, startTransition] = useTransition()
  const [turningIntoDraftId, setTurningIntoDraftId] = useState<string | null>(null)
  // Deep link from the dashboard's "Recent ideas" list.
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

  return (
    <main className="flex-1 overflow-y-auto bg-linen">
      <div className="app-container">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-app-h1 text-carbon">Ideas</h1>
            <p className="text-[12.5px] text-ash mt-0.5">{initialIdeas.length} ideas captured</p>
          </div>
          <Button onClick={() => setNewOpen(true)} size="md" iconRight={<ArrowRight size={13} />}>
            New idea
          </Button>
        </div>

        {/* Capture input */}
        {newOpen && (
          <div
            className="bg-paper-white border border-lavender/40 rounded-xl p-5 mb-5"
            style={{ boxShadow: '0 0 0 3px rgba(249,115,22,0.08)' }}
          >
            <input
              autoFocus
              placeholder="What's the idea?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) addIdea() }}
              className="text-[15px] text-carbon placeholder-ash bg-transparent outline-none w-full mb-4"
              style={{ letterSpacing: '-0.3px' }}
            />
            <div className="flex gap-2">
              <Button onClick={addIdea} disabled={isPending} size="md">
                Save idea
              </Button>
              <Button variant="ghost" onClick={() => { setNewOpen(false); setNewTitle('') }} size="md">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Filter tabs + search */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 mb-5 border-b border-fog pb-3 sm:pb-0">
          <div className="flex items-center gap-0 overflow-x-auto">
            {(['All', ...FILTERABLE_STATUSES] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`shrink-0 px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
                  filter === s
                    ? 'text-carbon border-lavender'
                    : 'text-ash border-transparent hover:text-carbon'
                }`}
                style={{ letterSpacing: '-0.25px' }}
              >
                {s === 'All' ? 'All' : STATUS_LABEL[s]}
              </button>
            ))}
          </div>
          <div className="relative shrink-0 mb-2 w-full sm:w-[180px]">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ash pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ideas"
              className="text-[13px] bg-linen border border-fog rounded-full pl-8 pr-3 py-1.5 outline-none focus:border-lavender/60 transition-colors w-full"
            />
          </div>
        </div>

        {/* Ideas list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Lightbulb size={18} className="text-ash" strokeWidth={2} />}
            title={query.trim() ? 'No ideas match your search.' : 'No ideas yet.'}
            description={query.trim() ? 'Try a different search term.' : 'The next one you have — write it down here before it disappears.'}
            action={
              query.trim() ? undefined : (
                <Button onClick={() => setNewOpen(true)} size="md">
                  Add your first idea
                </Button>
              )
            }
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((idea) => (
              <Card
                key={idea.id}
                variant="subtle"
                className="hover:border-fog/80 transition-all cursor-pointer"
                onClick={() => setEditingId(idea.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-carbon mb-1.5"
                      style={{ fontSize: '14.5px', letterSpacing: '-0.3px', lineHeight: 1.4 }}
                    >
                      {idea.title}
                    </p>
                    {idea.notes && (
                      <p className="text-[13px] text-graphite mb-3 leading-relaxed" style={{ letterSpacing: '-0.2px' }}>
                        {idea.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-label text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full ${statusStyle(idea.status)}`}>
                        {STATUS_LABEL[idea.status]}
                      </span>
                      {idea.tags.map((tag) => (
                        <span key={tag} className="text-[11px] text-ash bg-linen px-2.5 py-1 rounded-full border border-fog">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); turnIntoDraft(idea) }}
                    disabled={turningIntoDraftId === idea.id}
                    className="shrink-0 mt-0.5 text-[12px] font-semibold text-lavender hover:opacity-70 disabled:opacity-50 transition-opacity whitespace-nowrap"
                    style={{ letterSpacing: '-0.2px' }}
                  >
                    {turningIntoDraftId === idea.id ? 'Creating draft…' : 'Turn into draft'}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <IdeaModal
          idea={editing}
          onClose={() => setEditingId(null)}
          onSubmit={saveIdea}
          onDelete={removeIdea}
          isPending={isPending}
        />
      )}
    </main>
  )
}

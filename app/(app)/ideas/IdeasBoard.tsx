'use client'

import { useState, useTransition } from 'react'
import { ArrowRight, Lightbulb } from 'lucide-react'
import { createIdea } from '@/lib/supabase/actions'
import type { Idea } from '@/lib/supabase/types'

const STATUS_LABEL: Record<Idea['status'], string> = {
  new: 'New',
  in_progress: 'In Progress',
  scheduled: 'Scheduled',
  done: 'Done',
  archived: 'Archived',
}

const FILTERABLE_STATUSES: Idea['status'][] = ['new', 'in_progress', 'scheduled', 'done']

function statusStyle(status: Idea['status']) {
  return status === 'done' ? 'bg-mint-wash text-mint' : 'bg-fog text-graphite'
}

export default function IdeasBoard({ initialIdeas }: { initialIdeas: Idea[] }) {
  const [filter, setFilter] = useState<Idea['status'] | 'All'>('All')
  const [newOpen, setNewOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = filter === 'All' ? initialIdeas : initialIdeas.filter((i) => i.status === filter)

  const addIdea = () => {
    if (!newTitle.trim()) return
    const title = newTitle.trim()
    setNewTitle('')
    setNewOpen(false)
    startTransition(() => {
      createIdea(title)
    })
  }

  return (
    <main className="flex-1 overflow-y-auto bg-linen">
      <div className="max-w-[860px] mx-auto px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-bold text-carbon" style={{ fontSize: '20px', letterSpacing: '-0.04em' }}>Ideas</h1>
            <p className="text-[12.5px] text-ash mt-0.5">{initialIdeas.length} ideas captured</p>
          </div>
          <button
            onClick={() => setNewOpen(true)}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-paper-white bg-lavender px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            style={{ boxShadow: 'rgba(145,141,246,0.3) 0px 3px 10px 0px', letterSpacing: '-0.25px' }}
          >
            New idea <ArrowRight size={13} />
          </button>
        </div>

        {/* Capture input */}
        {newOpen && (
          <div
            className="bg-paper-white border border-lavender/40 rounded-2xl p-5 mb-5"
            style={{ boxShadow: '0 0 0 3px rgba(145,141,246,0.08)' }}
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
              <button
                onClick={addIdea}
                disabled={isPending}
                className="text-[13px] font-semibold text-paper-white bg-lavender px-4 py-2 rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Save idea
              </button>
              <button
                onClick={() => { setNewOpen(false); setNewTitle('') }}
                className="text-[13px] font-medium text-graphite px-4 py-2 hover:text-carbon transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-0 mb-5 border-b border-fog">
          {(['All', ...FILTERABLE_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
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

        {/* Ideas list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-11 h-11 rounded-2xl bg-fog flex items-center justify-center">
              <Lightbulb size={18} className="text-ash" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-carbon mb-1">No ideas yet.</p>
              <p className="text-[13px] text-graphite max-w-[280px]">
                The next one you have — write it down here before it disappears.
              </p>
            </div>
            <button
              onClick={() => setNewOpen(true)}
              className="text-[13px] font-medium text-lavender hover:opacity-70 transition-opacity"
            >
              Add your first idea
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((idea) => (
              <div
                key={idea.id}
                className="bg-paper-white border border-fog rounded-2xl p-5 hover:border-fog/80 transition-all"
                style={{ boxShadow: 'rgba(0,0,0,0.03) 0px 1px 2px 0px' }}
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
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusStyle(idea.status)}`}>
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
                    className="shrink-0 mt-0.5 text-[12px] font-semibold text-lavender hover:opacity-70 transition-opacity whitespace-nowrap"
                    style={{ letterSpacing: '-0.2px' }}
                  >
                    Turn into draft
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

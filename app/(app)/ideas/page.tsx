'use client'

import { useState } from 'react'
import { ArrowRight, Lightbulb } from 'lucide-react'

type IdeaStatus = 'New' | 'In Progress' | 'Scheduled' | 'Done'

interface Idea {
  id: number
  title: string
  notes: string
  tags: string[]
  status: IdeaStatus
}

const statusCfg: Record<IdeaStatus, { color: string; bg: string }> = {
  'New':        { color: 'text-graphite', bg: 'bg-fog' },
  'In Progress':{ color: 'text-sky',      bg: 'bg-sky/10' },
  'Scheduled':  { color: 'text-mint',     bg: 'bg-mint-wash' },
  'Done':       { color: 'text-ash',      bg: 'bg-linen border border-fog' },
}

const STATUSES: IdeaStatus[] = ['New', 'In Progress', 'Scheduled', 'Done']

const sample: Idea[] = [
  { id: 1, title: '5 tools I actually use to manage brand deals', notes: 'Show CreatorFlow, Notion, Gmail. Focus on the workflow, not the tools.', tags: ['workflow', 'brand deals'], status: 'In Progress' },
  { id: 2, title: 'What YouTube actually pays per 1K views in 2025', notes: 'Break down RPM across niches. Use my own channel data.', tags: ['monetization', 'data'], status: 'New' },
  { id: 3, title: 'My complete brand deal workflow ($0 to $10K/mo)', notes: 'Full case study. Show the pipeline, templates, rate card.', tags: ['brand deals', 'income'], status: 'Scheduled' },
  { id: 4, title: 'Stop leaving money on the table — how to negotiate sponsorships', notes: '', tags: ['sponsorships', 'negotiation'], status: 'New' },
  { id: 5, title: 'I reviewed 30 brand deal contracts so you don\'t have to', notes: 'The most common bad clauses. What to look for.', tags: ['contracts', 'legal'], status: 'Done' },
]

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>(sample)
  const [filter, setFilter] = useState<IdeaStatus | 'All'>('All')
  const [newOpen, setNewOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const filtered = filter === 'All' ? ideas : ideas.filter((i) => i.status === filter)

  const addIdea = () => {
    if (!newTitle.trim()) return
    setIdeas(prev => [{ id: Date.now(), title: newTitle.trim(), notes: '', tags: [], status: 'New' }, ...prev])
    setNewTitle('')
    setNewOpen(false)
  }

  return (
    <main className="flex-1 overflow-y-auto bg-linen">
      <div className="max-w-[860px] mx-auto px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-bold text-carbon" style={{ fontSize: '20px', letterSpacing: '-0.04em' }}>Ideas</h1>
            <p className="text-[12.5px] text-ash mt-0.5">{ideas.length} ideas captured</p>
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
                className="text-[13px] font-semibold text-paper-white bg-lavender px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
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
          {(['All', ...STATUSES] as const).map((s) => (
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
              {s}
            </button>
          ))}
        </div>

        {/* Ideas list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-11 h-11 rounded-2xl bg-amber/10 flex items-center justify-center">
              <Lightbulb size={18} className="text-amber" strokeWidth={1.8} />
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
            {filtered.map((idea) => {
              const cfg = statusCfg[idea.status]
              return (
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
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                          {idea.status}
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
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

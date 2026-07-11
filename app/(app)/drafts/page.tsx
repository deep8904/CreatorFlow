'use client'

import { useState } from 'react'
import { Sparkles, Save, Plus, FileText } from 'lucide-react'

interface Draft {
  id: number
  title: string
  fromIdea: string
  preview: string
  updatedAt: string
}

const sampleDrafts: Draft[] = [
  {
    id: 1,
    title: '5 tools I actually use to manage brand deals',
    fromIdea: '5 tools I actually use to manage brand deals',
    preview: 'Most creators I talk to manage their entire brand deal pipeline inside their Gmail inbox. Which means deals get lost, follow-ups get forgotten, and money disappears into the void.\n\nHere are the 5 tools I actually use...',
    updatedAt: 'Today',
  },
  {
    id: 2,
    title: 'I reviewed 30 brand deal contracts — here\'s what I found',
    fromIdea: 'I reviewed 30 brand deal contracts so you don\'t have to',
    preview: 'Before I started reading contracts carefully, I signed a deal that included a 12-month exclusivity clause I hadn\'t noticed. It cost me two other brand deals that month.\n\nHere\'s what to look for...',
    updatedAt: 'Yesterday',
  },
]

export default function DraftsPage() {
  const [drafts] = useState<Draft[]>(sampleDrafts)
  const [activeDraft, setActiveDraft] = useState<Draft | null>(sampleDrafts[0] ?? null)
  const [content, setContent] = useState(activeDraft?.preview ?? '')

  const handleSelect = (draft: Draft) => {
    setActiveDraft(draft)
    setContent(draft.preview)
  }

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Draft list sidebar */}
      <div className="w-[240px] shrink-0 border-r border-fog bg-linen flex flex-col">
        <div className="px-4 py-4 border-b border-fog flex items-center justify-between shrink-0">
          <h1 className="text-[14px] font-bold text-carbon" style={{ letterSpacing: '-0.3px' }}>Drafts</h1>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-lavender/10 text-lavender hover:bg-lavender/20 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {drafts.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-[13px] text-graphite">No drafts yet.</p>
              <p className="text-[12px] text-ash mt-1">Turn one of your ideas into a draft to start writing.</p>
            </div>
          ) : (
            drafts.map((draft) => (
              <button
                key={draft.id}
                onClick={() => handleSelect(draft)}
                className={`w-full text-left px-3 py-3 rounded-xl transition-colors ${
                  activeDraft?.id === draft.id
                    ? 'bg-paper-white border border-fog shadow-[rgba(0,0,0,0.04)_0px_1px_2px_0px]'
                    : 'hover:bg-paper-white/70'
                }`}
              >
                <p
                  className="font-semibold text-carbon leading-snug mb-1 line-clamp-2"
                  style={{ fontSize: '13px', letterSpacing: '-0.25px' }}
                >
                  {draft.title}
                </p>
                <p className="text-[11px] text-ash">{draft.updatedAt}</p>
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
              <p className="text-[11px] text-ash mb-0.5">
                From: <span className="text-graphite font-medium">{activeDraft.fromIdea}</span>
              </p>
              <h2
                className="font-bold text-carbon truncate"
                style={{ fontSize: '16px', letterSpacing: '-0.03em' }}
              >
                {activeDraft.title}
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-graphite border border-fog px-4 py-2 rounded-full hover:bg-linen transition-colors"
                style={{ letterSpacing: '-0.25px' }}
              >
                <Sparkles size={13} className="text-lavender" /> AI assist
              </button>
              <button
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-paper-white bg-lavender px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
                style={{ boxShadow: 'rgba(145,141,246,0.3) 0px 3px 10px 0px', letterSpacing: '-0.25px' }}
              >
                <Save size={13} /> Save
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
          <div className="flex flex-col items-center gap-4 text-center max-w-[280px]">
            <div className="w-11 h-11 rounded-2xl bg-fog flex items-center justify-center">
              <FileText size={18} className="text-ash" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-carbon mb-1">No draft selected.</p>
              <p className="text-[13px] text-graphite">
                Turn one of your ideas into a draft to start writing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

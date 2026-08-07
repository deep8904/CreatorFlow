'use client'

import { useState, useTransition } from 'react'
import { Mic } from 'lucide-react'
import { createIdea } from '@/lib/supabase/actions'
import { FOCUS, HOVER } from './tokens'
import { useToast } from '@/lib/toast'
import { useSpeechCapture } from '@/lib/useSpeechCapture'

/**
 * The idea-capture form itself — title, notes, tags, voice mic — extracted
 * out of IdeasBoard so the Command Palette's "New Idea" action can be the
 * exact same form, not a second implementation of it. Closes optimistically
 * on submit (matching the original IdeasBoard behavior) rather than waiting
 * on the network round trip.
 */
export function QuickIdeaForm({
  onSaved,
  onCancel,
  autoFocus = true,
}: {
  onSaved: () => void
  onCancel: () => void
  autoFocus?: boolean
}) {
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [tagsText, setTagsText] = useState('')
  const [, startTransition] = useTransition()
  const { supported: speechSupported, listening, start: startListening, stop: stopListening } = useSpeechCapture(
    (transcript) => setTitle((t) => (t ? `${t} ${transcript}` : transcript))
  )

  const save = () => {
    if (!title.trim()) return
    const savedTitle = title.trim()
    const savedNotes = notes.trim()
    const savedTags = tagsText.split(',').map((t) => t.trim()).filter(Boolean)
    onSaved()
    startTransition(async () => {
      const result = await createIdea(savedTitle, savedNotes, savedTags)
      if (result.error) toast.error(result.error)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          autoFocus={autoFocus}
          placeholder="What's the idea?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) save()
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
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <input
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`min-w-0 flex-1 rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2 font-nebula-ui text-[13px] text-zinc-200 outline-none placeholder:text-zinc-600 ${FOCUS}`}
        />
        <input
          placeholder="Tags, comma separated"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          className={`min-w-0 flex-1 rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2 font-nebula-ui text-[13px] text-zinc-200 outline-none placeholder:text-zinc-600 ${FOCUS}`}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={!title.trim()}
          className={`nebula-cta-static inline-flex h-9 items-center rounded-[9999px] px-4 font-nebula-tech text-[12.5px] font-medium disabled:pointer-events-none disabled:opacity-50 ${FOCUS}`}
        >
          <span className="nebula-cta__label">Save idea</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`inline-flex h-9 items-center rounded-[9999px] px-4 font-nebula-ui text-[12.5px] font-medium text-zinc-400 hover:bg-white/[0.05] hover:text-white ${HOVER} ${FOCUS}`}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default QuickIdeaForm

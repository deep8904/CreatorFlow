'use client'

import { useState } from 'react'
import { Sparkles, Send } from 'lucide-react'
import { useToast } from '@/lib/toast'
import { FOCUS, HOVER } from './tokens'

const EXAMPLE_EXCHANGE = {
  q: 'Which deals need a reply today?',
  a: 'Aura Skincare and Northstar VPN are both waiting on you — Aura for 4 days, Northstar since yesterday. Everything else in your pipeline is either delivered or on the brand’s side.',
}

/**
 * Structurally the reference's chat side panel, honestly relabelled: no
 * backend exists to answer a real question, so this never pretends to.
 * Matches the "Preview only — X, not a live AI call. In production, Y."
 * voice already established on Deals' AI reply and Repurpose's suggestions.
 */
export function AIAssistantPanel() {
  const [draft, setDraft] = useState('')
  const toast = useToast()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 pb-3">
        <span
          aria-hidden
          className="grid h-6 w-6 place-items-center rounded-[7px] bg-orange-500/15 text-orange-400"
        >
          <Sparkles size={13} strokeWidth={2} />
        </span>
        <span className="rounded-[9999px] bg-white/[0.06] px-2 py-0.5 font-nebula-mono text-[9.5px] font-medium uppercase tracking-[0.1em] text-zinc-400">
          Preview
        </span>
      </div>

      <div className="console-scroll flex-1 space-y-3 overflow-y-auto px-5">
        <div className="ml-auto max-w-[85%] rounded-[12px] rounded-tr-[4px] bg-orange-500/15 px-3 py-2 font-nebula-ui text-[12.5px] text-orange-100">
          {EXAMPLE_EXCHANGE.q}
        </div>
        <div className="mr-auto max-w-[90%] rounded-[12px] rounded-tl-[4px] bg-white/[0.05] px-3 py-2 font-nebula-ui text-[12.5px] leading-relaxed text-zinc-300">
          {EXAMPLE_EXCHANGE.a}
        </div>
      </div>

      <div className="px-5 pb-2 pt-3">
        <p className="mb-2 font-nebula-ui text-[10.5px] leading-snug text-zinc-600">
          Preview only — a scripted example, not a live AI call. In production, this would query
          Gemini against your real deals and ideas.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!draft.trim()) return
            toast.info('The AI Assistant is a preview — this isn’t wired to a live model yet.')
            setDraft('')
          }}
          className="flex items-center gap-2"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about your deals…"
            aria-label="Ask the AI Assistant"
            className={`h-9 min-w-0 flex-1 rounded-[9999px] border border-white/10 bg-white/[0.04] px-3.5 font-nebula-ui text-[12.5px] text-zinc-100 placeholder:text-zinc-600 ${FOCUS}`}
          />
          <button
            type="submit"
            aria-label="Send"
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-[9999px] bg-orange-500 text-white hover:bg-orange-400 ${HOVER} ${FOCUS}`}
          >
            <Send size={14} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default AIAssistantPanel

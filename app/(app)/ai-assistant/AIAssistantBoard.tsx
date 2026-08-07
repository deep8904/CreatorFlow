'use client'

import { useId, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { DashboardHeader } from '@/components/dash/DashboardHeader'
import { Panel } from '@/components/dash/Panel'
import { Pill } from '@/components/dash/Pill'
import { FOCUS, HOVER } from '@/components/dash/tokens'

export type AssistantFact = { id: string; question: string; answer: string; keywords: string[] }
export type ContextChip = { label: string; value: string; icon: ReactNode }

type Message = { role: 'user' | 'assistant'; text: string }

const FALLBACK_ANSWER =
  "This preview only answers the questions above, it isn't a live model yet. In production this would call Gemini directly over your deals, ideas, and channel stats to handle anything you ask."

/**
 * Grounded in real data, not a live model: each suggested question maps to
 * an answer computed server-side from the user's actual deals/ideas/channel
 * stats (see page.tsx), not a scripted fictional exchange. That's the
 * honest middle ground between "fake conversation" and "wired to Gemini" —
 * the facts are real, the free-form understanding isn't there yet.
 */
function matchFact(input: string, facts: AssistantFact[]): AssistantFact | null {
  const normalized = input.toLowerCase()
  let best: { fact: AssistantFact; score: number } | null = null
  for (const fact of facts) {
    const score = fact.keywords.filter((k) => normalized.includes(k)).length
    if (score > 0 && (!best || score > best.score)) best = { fact, score }
  }
  return best?.fact ?? null
}

export function AIAssistantBoard({ facts, contextChips }: { facts: AssistantFact[]; contextChips: ContextChip[] }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const inputId = useId()

  const ask = (question: string, answer: string) => {
    setMessages((prev) => [...prev, { role: 'user', text: question }, { role: 'assistant', text: answer }])
  }

  const handleSuggested = (fact: AssistantFact) => ask(fact.question, fact.answer)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return
    const matched = matchFact(trimmed, facts)
    ask(trimmed, matched?.answer ?? FALLBACK_ANSWER)
    setDraft('')
  }

  return (
    <main id="dashboard-main" className="console-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <DashboardHeader
        eyebrow="AI Assistant"
        title="AI Assistant"
        description="Ask about your deals, ideas, and channel, grounded in your real data."
        right={<Pill>Preview</Pill>}
      />

      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {contextChips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {contextChips.map((chip) => (
              <div
                key={chip.label}
                className="inline-flex items-center gap-1.5 rounded-[9999px] border border-white/10 bg-white/[0.03] px-3 py-1.5 font-nebula-ui text-[12px] text-zinc-400"
              >
                <span aria-hidden className="text-orange-400/80">
                  {chip.icon}
                </span>
                <span className="font-nebula-mono font-medium text-zinc-200">{chip.value}</span>
                {chip.label}
              </div>
            ))}
          </div>
        )}

        <Panel title="Ask a question" titleId="assistant-h">
          <div className="flex flex-col gap-3 px-5 pb-5">
            {facts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {facts.map((fact) => (
                  <button
                    key={fact.id}
                    type="button"
                    onClick={() => handleSuggested(fact)}
                    className={`rounded-[9999px] border border-white/10 bg-white/[0.03] px-3 py-1.5 font-nebula-ui text-[12px] text-zinc-300 hover:border-orange-400/30 hover:bg-orange-500/[0.08] hover:text-orange-200 ${HOVER} ${FOCUS}`}
                  >
                    {fact.question}
                  </button>
                ))}
              </div>
            )}

            <div className="console-scroll flex h-[320px] flex-col gap-3 overflow-y-auto rounded-[12px] bg-white/[0.02] p-3.5">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2.5 text-center">
                  <span aria-hidden className="grid h-9 w-9 place-items-center rounded-[9999px] bg-orange-500/10 text-orange-400">
                    <Sparkles size={16} strokeWidth={2} />
                  </span>
                  <p className="font-nebula-ui text-[12.5px] text-zinc-500">
                    {facts.length > 0
                      ? 'Pick a question above, or type your own below.'
                      : "Nothing to ask about yet, add a deal or idea and this fills in."}
                  </p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === 'user'
                        ? 'ml-auto max-w-[85%] whitespace-pre-line rounded-[12px] rounded-tr-[4px] bg-orange-500/15 px-3 py-2 font-nebula-ui text-[12.5px] text-orange-100'
                        : 'mr-auto max-w-[90%] whitespace-pre-line rounded-[12px] rounded-tl-[4px] bg-white/[0.05] px-3 py-2 font-nebula-ui text-[12.5px] leading-relaxed text-zinc-300'
                    }
                  >
                    {m.text}
                  </div>
                ))
              )}
            </div>

            <p className="font-nebula-ui text-[10.5px] leading-snug text-zinc-600">
              Preview only, answers are assembled from templates against your real data, not a live model call. In
              production, this would call Gemini directly for open-ended questions.
            </p>

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <label htmlFor={inputId} className="sr-only">
                Ask the AI Assistant
              </label>
              <input
                id={inputId}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about your deals, ideas, or channel…"
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
        </Panel>
      </div>
    </main>
  )
}

export default AIAssistantBoard

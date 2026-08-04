'use client'

import { useState } from 'react'
import { Film, Lightbulb, FileText, Sparkles, Link as LinkIcon, CalendarClock, Clock } from 'lucide-react'
import type { ChannelVideo, RepurposedContent, Idea } from '@/lib/supabase/types'
import type { DraftWithIdeaTitle } from '@/lib/supabase/queries'
import type { BestTimeAnalysis } from '@/lib/bestTimeToPublish'
import { Panel } from '@/components/dash/Panel'
import { Pill } from '@/components/dash/Pill'
import { DashboardHeader } from '@/components/dash/DashboardHeader'
import { FOCUS, FOCUS_INSET, HOVER } from '@/components/dash/tokens'
import { useToast } from '@/lib/toast'

/**
 * "Highlighted colored boxes" per the roadmap, but never a single
 * confident-looking pick without the caveat attached — and never a pick at
 * all for a dimension whose winning bucket didn't clear
 * MIN_VIDEOS_PER_BUCKET (see lib/bestTimeToPublish.ts). Honest > punchy.
 */
function BestTimeToPublishPanel({ bestTime }: { bestTime: BestTimeAnalysis }) {
  if (bestTime.status === 'insufficient_data') {
    return (
      <Panel title="Best time to publish" titleId="best-time-h">
        <div className="flex items-start gap-3 px-5 pb-5">
          <CalendarClock size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-zinc-500" />
          <div>
            <p className="font-nebula-ui text-[13px] text-zinc-300">
              Not enough data yet — {bestTime.videoCount} of {bestTime.minRequired} videos analyzed.
            </p>
            <p className="mt-1 font-nebula-ui text-[12px] text-zinc-500">
              Publish {bestTime.minRequired - bestTime.videoCount} more and this fills in with a real pattern from
              your own channel, not a generic benchmark.
            </p>
          </div>
        </div>
      </Panel>
    )
  }

  const maxDayViews = Math.max(1, ...bestTime.dayBuckets.map((b) => b.avgViews))

  return (
    <Panel
      title="Best time to publish"
      titleId="best-time-h"
      eyebrow={`Based on your last ${bestTime.videoCount} published videos`}
    >
      <div className="flex flex-col gap-4 px-5 pb-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-[12px] bg-orange-500/[0.08] p-3.5">
            <p className="flex items-center gap-1.5 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.1em] text-orange-300">
              <CalendarClock size={11} strokeWidth={2} /> Best day
            </p>
            {bestTime.bestDay ? (
              <>
                <p className="mt-1.5 font-nebula-heading text-[17px] font-semibold text-white">{bestTime.bestDay.label}</p>
                <p className="mt-0.5 font-nebula-ui text-[11.5px] text-zinc-500">
                  Avg {bestTime.bestDay.avgViews.toLocaleString()} views across {bestTime.bestDay.count} videos
                </p>
              </>
            ) : (
              <p className="mt-1.5 font-nebula-ui text-[12.5px] text-zinc-400">
                No single day stands out yet — too few videos per weekday to call it.
              </p>
            )}
          </div>
          <div className="rounded-[12px] bg-white/[0.04] p-3.5">
            <p className="flex items-center gap-1.5 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">
              <Clock size={11} strokeWidth={2} /> Best time of day
            </p>
            {bestTime.bestDaypart ? (
              <>
                <p className="mt-1.5 font-nebula-heading text-[17px] font-semibold text-white">{bestTime.bestDaypart.label}</p>
                <p className="mt-0.5 font-nebula-ui text-[11.5px] text-zinc-500">
                  Avg {bestTime.bestDaypart.avgViews.toLocaleString()} views across {bestTime.bestDaypart.count} videos
                </p>
              </>
            ) : (
              <p className="mt-1.5 font-nebula-ui text-[12.5px] text-zinc-400">
                No single window stands out yet — too few videos per window to call it.
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">
            By day of week
          </p>
          <div className="flex items-end gap-1.5">
            {bestTime.dayBuckets.map((b) => (
              <div key={b.label} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-16 w-full items-end">
                  <div
                    className={`w-full rounded-t-[4px] ${b.count === 0 ? 'bg-white/[0.04]' : 'bg-orange-500/50'}`}
                    style={{ height: `${b.count === 0 ? 3 : Math.max(6, (b.avgViews / maxDayViews) * 100)}%` }}
                    title={b.count === 0 ? 'No videos' : `${b.count} videos, avg ${b.avgViews.toLocaleString()} views`}
                  />
                </div>
                <span className="font-nebula-mono text-[9.5px] text-zinc-600">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {!bestTime.timezoneIsAccountSpecific && (
          <p className="font-nebula-ui text-[10.5px] text-zinc-600">
            Your account has no timezone on file, so day/time grouping uses UTC — actual local-time results may
            differ.
          </p>
        )}
      </div>
    </Panel>
  )
}

type RepurposedWithVideo = RepurposedContent & { channel_videos: { title: string } | null }

type SourceKind = 'video' | 'draft' | 'idea'
type SourceItem = {
  kind: SourceKind
  id: string
  title: string
  meta: string
}

function formatCompact(n: number) {
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

function firstSentence(text: string, max = 140) {
  const clean = text.trim().replace(/\s+/g, ' ')
  if (clean.length <= max) return clean
  return clean.slice(0, max).replace(/\s+\S*$/, '') + '…'
}

/**
 * Drafts' "AI Assist" button appends a bracketed structure-template marker
 * line (e.g. "[Structure template — preview only, ...]") straight into the
 * editable draft body — it's UI scaffolding, not authored content, and was
 * leaking verbatim into this panel's summary/beats when a draft's body
 * consisted mostly of that marker. Bracketed whole-line annotations aren't
 * real prose in any draft, so they're stripped before this text is used.
 */
function stripTemplateMarkers(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/^\[.*\]$/.test(line.trim()))
    .join('\n')
    .trim()
}

/**
 * Text-source template — the honest, client-side equivalent of the seeded
 * `repurposed_content` rows, but for Drafts/Ideas rather than a channel
 * video. Same "preview only" contract as Deals' `aiReplyFor` — it reads the
 * actual content, not a fixed placeholder, so it stays specific per source.
 */
function repurposeTextSource(title: string, body: string | null): {
  summary: string
  angles: string[]
  socialPosts: string[]
} {
  const cleanBody = body ? stripTemplateMarkers(body) : body
  const lines = (cleanBody ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const beats = lines.slice(0, 3)

  return {
    summary: cleanBody ? firstSentence(cleanBody, 180) : `A quick take on "${title}" — no script yet, just the idea.`,
    angles:
      beats.length > 0
        ? beats.map((b, i) => (i === 0 ? `Open on: "${firstSentence(b, 90)}"` : firstSentence(b, 90)))
        : [`Cold open with the title as your hook: "${title}"`, 'Get to the point in the first 2 seconds — no intro.'],
    socialPosts: [
      `TikTok/Reels: 15–30s cut leading with your strongest line from "${title}".`,
      `Shorts: same cut, vertical crop, on-screen captions burned in.`,
      `Static post: one quote card pulling the sharpest sentence out of this piece.`,
    ],
  }
}

function SourceIcon({ kind }: { kind: SourceKind }) {
  if (kind === 'video') return <Film size={14} strokeWidth={2} />
  if (kind === 'draft') return <FileText size={14} strokeWidth={2} />
  return <Lightbulb size={14} strokeWidth={2} />
}

export default function RepurposeBoard({
  videos,
  repurposed,
  drafts,
  ideas,
  bestTime,
}: {
  videos: ChannelVideo[]
  repurposed: RepurposedWithVideo[]
  drafts: DraftWithIdeaTitle[]
  ideas: Idea[]
  bestTime: BestTimeAnalysis
}) {
  const toast = useToast()

  const sources: SourceItem[] = [
    ...videos.map((v) => ({ kind: 'video' as const, id: v.id, title: v.title, meta: `${formatCompact(v.views)} views` })),
    ...drafts.map((d) => ({ kind: 'draft' as const, id: d.id, title: d.title, meta: 'Draft' })),
    ...ideas.map((i) => ({ kind: 'idea' as const, id: i.id, title: i.title, meta: 'Idea' })),
  ]

  const [selected, setSelected] = useState<SourceItem | null>(sources[0] ?? null)
  const [urlInput, setUrlInput] = useState('')

  const repurposedByVideoId = new Map(repurposed.map((r) => [r.video_id, r]))

  const handleUrlSubmit = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    const match = videos.find((v) => v.youtube_video_id && trimmed.includes(v.youtube_video_id))
    if (!match) {
      toast.info(
        'This demo only recognizes pre-seeded videos from your connected channel — try picking a video, draft, or idea from the list instead.'
      )
      return
    }
    setSelected({ kind: 'video', id: match.id, title: match.title, meta: `${formatCompact(match.views)} views` })
    setUrlInput('')
  }

  const selectedVideo = selected?.kind === 'video' ? videos.find((v) => v.id === selected.id) ?? null : null
  const selectedVideoResult = selectedVideo ? repurposedByVideoId.get(selectedVideo.id) ?? null : null
  const selectedDraft = selected?.kind === 'draft' ? drafts.find((d) => d.id === selected.id) ?? null : null
  const selectedIdea = selected?.kind === 'idea' ? ideas.find((i) => i.id === selected.id) ?? null : null

  const textResult = selectedDraft
    ? repurposeTextSource(selectedDraft.title, selectedDraft.body)
    : selectedIdea
      ? repurposeTextSource(selectedIdea.title, selectedIdea.notes)
      : null

  return (
    <>
      <DashboardHeader
        eyebrow="Repurpose"
        title="Repurpose"
        description="Turn a video, draft, or idea into short-form clips and posts."
      />

      <main id="dashboard-main" className="console-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6">
            <BestTimeToPublishPanel bestTime={bestTime} />
          </div>

          <div className="mb-6 flex max-w-[560px] gap-2">
            <div className="relative flex-1">
              <LinkIcon size={13} strokeWidth={2} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="url"
                placeholder="Paste a YouTube link, or pick something below"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleUrlSubmit()
                }}
                className={`h-9 w-full rounded-[9999px] border border-white/10 bg-white/[0.04] pl-8 pr-3.5 font-nebula-ui text-[12.5px] text-zinc-100 placeholder:text-zinc-600 ${FOCUS}`}
              />
            </div>
            <button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
              className={`nebula-cta-static inline-flex h-9 shrink-0 items-center rounded-[9999px] px-4 font-nebula-tech text-[12.5px] font-medium disabled:pointer-events-none disabled:opacity-50 ${FOCUS}`}
            >
              <span className="nebula-cta__label">Analyze</span>
            </button>
          </div>

          {sources.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <span aria-hidden className="grid h-11 w-11 place-items-center rounded-[9999px] bg-orange-500/10 text-orange-400">
                <Film size={18} strokeWidth={2} />
              </span>
              <p className="font-nebula-ui text-[13px] text-zinc-500">
                Capture an idea or start a draft, and it'll show up here to repurpose.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
              <Panel title="Pick something" titleId="source-h" className="h-fit">
                <div className="console-scroll max-h-[560px] overflow-y-auto pb-2">
                  {sources.map((s) => {
                    const isSelected = selected?.kind === s.kind && selected.id === s.id
                    const hasReady = s.kind === 'video' && repurposedByVideoId.has(s.id)
                    return (
                      <button
                        key={`${s.kind}-${s.id}`}
                        type="button"
                        onClick={() => setSelected(s)}
                        className={`flex w-full items-start gap-2.5 border-t border-white/[0.05] px-5 py-3 text-left first:border-t-0 ${HOVER} ${FOCUS_INSET} ${
                          isSelected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                        }`}
                      >
                        <span aria-hidden className="mt-0.5 shrink-0 text-zinc-500">
                          <SourceIcon kind={s.kind} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block line-clamp-2 font-nebula-ui text-[12.5px] font-medium leading-snug text-zinc-200">
                            {s.title}
                          </span>
                          <span className="mt-1 flex items-center gap-2">
                            <span className="font-nebula-mono text-[10.5px] text-zinc-600">{s.meta}</span>
                            {hasReady && <Pill tone="positive">Ready</Pill>}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </Panel>

              <div>
                {!selected ? (
                  <div className="flex flex-col items-center gap-3 py-20 text-center">
                    <Film size={20} strokeWidth={2} className="text-zinc-600" />
                    <p className="font-nebula-ui text-[13px] text-zinc-500">Pick something to see repurposing suggestions.</p>
                  </div>
                ) : selectedVideo ? (
                  selectedVideoResult ? (
                    <div className="flex flex-col gap-4">
                      <Panel title="Summary" titleId="rp-summary-h">
                        <div className="px-5 pb-5">
                          <p className="font-nebula-ui text-[13.5px] leading-relaxed text-zinc-300">
                            {selectedVideoResult.summary}
                          </p>
                        </div>
                      </Panel>

                      <Panel title="Clip-worthy moments" titleId="rp-clips-h">
                        <div className="flex flex-col gap-3 px-5 pb-5">
                          {selectedVideoResult.clip_worthy_moments.map((m, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="mt-0.5 shrink-0 font-nebula-mono text-[11px] font-medium text-orange-400">
                                {m.timestamp}
                              </span>
                              <p className="font-nebula-ui text-[13px] leading-snug text-zinc-400">{m.description}</p>
                            </div>
                          ))}
                        </div>
                      </Panel>

                      <Panel title="Social post ideas" titleId="rp-social-h">
                        <div className="flex flex-col gap-2.5 px-5 pb-5">
                          {selectedVideoResult.social_post_ideas.map((idea, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <Sparkles size={13} strokeWidth={2} className="mt-0.5 shrink-0 text-orange-400" />
                              <p className="font-nebula-ui text-[13px] leading-snug text-zinc-300">{idea}</p>
                            </div>
                          ))}
                        </div>
                      </Panel>

                      {selectedVideoResult.blog_outline && (
                        <Panel title="Blog post outline" titleId="rp-blog-h">
                          <div className="px-5 pb-5">
                            <pre className="whitespace-pre-wrap font-nebula-ui text-[13px] leading-relaxed text-zinc-400">
                              {selectedVideoResult.blog_outline}
                            </pre>
                          </div>
                        </Panel>
                      )}

                      <p className="text-center font-nebula-ui text-[11px] text-zinc-600">
                        Preview only — seeded example suggestions, not a live AI call. In production, generating this
                        calls Gemini against the video&apos;s real transcript.
                      </p>
                    </div>
                  ) : (
                    <div className="nebula-border rounded-[1.25rem] bg-white/[0.03] p-8 text-center backdrop-blur-xl">
                      <p className="mb-1.5 font-nebula-heading text-[15px] font-semibold text-white">
                        No repurposing generated for this video yet.
                      </p>
                      <p className="mx-auto max-w-[360px] font-nebula-ui text-[13px] text-zinc-500">
                        This demo includes pre-generated suggestions for a few videos, marked &quot;Ready&quot; in the
                        list. In production, generating new suggestions here calls Gemini against the video&apos;s real
                        transcript.
                      </p>
                    </div>
                  )
                ) : textResult ? (
                  <div className="flex flex-col gap-4">
                    <Panel title="Summary" titleId="rp-text-summary-h">
                      <div className="px-5 pb-5">
                        <p className="font-nebula-ui text-[13.5px] leading-relaxed text-zinc-300">{textResult.summary}</p>
                      </div>
                    </Panel>

                    <Panel title="Short-form angles" titleId="rp-angles-h">
                      <div className="flex flex-col gap-3 px-5 pb-5">
                        {textResult.angles.map((a, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <Sparkles size={13} strokeWidth={2} className="mt-0.5 shrink-0 text-orange-400" />
                            <p className="font-nebula-ui text-[13px] leading-snug text-zinc-400">{a}</p>
                          </div>
                        ))}
                      </div>
                    </Panel>

                    <Panel title="Social post ideas" titleId="rp-text-social-h">
                      <div className="flex flex-col gap-2.5 px-5 pb-5">
                        {textResult.socialPosts.map((idea, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <Sparkles size={13} strokeWidth={2} className="mt-0.5 shrink-0 text-orange-400" />
                            <p className="font-nebula-ui text-[13px] leading-snug text-zinc-300">{idea}</p>
                          </div>
                        ))}
                      </div>
                    </Panel>

                    <p className="text-center font-nebula-ui text-[11px] text-zinc-600">
                      Preview only — built from what you&apos;ve written so far, not a live AI call. In production,
                      this would call Gemini against your full draft.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

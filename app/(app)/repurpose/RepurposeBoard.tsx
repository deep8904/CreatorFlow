'use client'

import { useState } from 'react'
import { Film, Sparkles } from 'lucide-react'
import type { ChannelVideo, RepurposedContent } from '@/lib/supabase/types'

type RepurposedWithVideo = RepurposedContent & { channel_videos: { title: string } | null }

function formatCompact(n: number) {
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export default function RepurposeBoard({
  videos,
  repurposed,
}: {
  videos: ChannelVideo[]
  repurposed: RepurposedWithVideo[]
}) {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(videos[0]?.id ?? null)
  const [urlInput, setUrlInput] = useState('')

  const repurposedByVideoId = new Map(repurposed.map((r) => [r.video_id, r]))
  const selectedVideo = videos.find((v) => v.id === selectedVideoId) ?? null
  const selectedResult = selectedVideoId ? (repurposedByVideoId.get(selectedVideoId) ?? null) : null

  const handleUrlSubmit = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    const match = videos.find((v) => v.youtube_video_id && trimmed.includes(v.youtube_video_id))
    if (match) {
      setSelectedVideoId(match.id)
      setUrlInput('')
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-linen">
      <div className="app-container">
        <div className="mb-6">
          <h1 className="text-app-h1 text-carbon">Repurpose</h1>
          <p className="text-[12.5px] text-ash mt-0.5">Turn a published video into more content</p>
        </div>

        {/* URL input */}
        <div className="bg-paper-white border border-fog rounded-xl p-5 mb-6" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
          <p className="text-[14px] font-medium text-carbon mb-3">Paste a YouTube link, or pick one of your connected channel&apos;s videos below.</p>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleUrlSubmit() }}
              className="flex-1 bg-linen border border-fog rounded-xl px-4 py-2.5 text-[14px] text-carbon placeholder-ash outline-none focus:border-lavender/60 transition-colors"
            />
            <button
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
              className="text-[13px] font-medium text-paper-white bg-lavender px-5 py-2.5 rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Analyze
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
          {/* Video picker */}
          <div className="bg-paper-white border border-fog rounded-xl overflow-hidden h-fit" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
            <div className="px-4 py-3 border-b border-fog">
              <h2 className="text-[12.5px] font-semibold text-carbon">Your videos</h2>
            </div>
            <div className="max-h-[480px] overflow-y-auto">
              {videos.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVideoId(v.id)}
                  className={`w-full text-left px-4 py-3 border-b border-fog last:border-b-0 transition-colors ${
                    selectedVideoId === v.id ? 'bg-lavender/10' : 'hover:bg-linen'
                  }`}
                >
                  <p className="text-[12.5px] font-medium text-carbon leading-snug line-clamp-2 mb-1">{v.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-ash">{formatCompact(v.views)} views</span>
                    {repurposedByVideoId.has(v.id) && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-mint-wash text-mint">Ready</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Result panel */}
          <div>
            {!selectedVideo ? (
              <div className="flex flex-col items-center gap-3 py-20 text-center">
                <Film size={20} className="text-ash" />
                <p className="text-[13px] text-graphite">Pick a video to see repurposing suggestions.</p>
              </div>
            ) : selectedResult ? (
              <div className="flex flex-col gap-4">
                <div className="bg-paper-white border border-fog rounded-xl p-5" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
                  <p className="font-label text-[10.5px] font-semibold text-ash uppercase tracking-widest mb-2">Summary</p>
                  <p className="text-[13.5px] text-carbon leading-relaxed">{selectedResult.summary}</p>
                </div>

                <div className="bg-paper-white border border-fog rounded-xl p-5" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
                  <p className="font-label text-[10.5px] font-semibold text-ash uppercase tracking-widest mb-3">Clip-worthy moments</p>
                  <div className="flex flex-col gap-3">
                    {selectedResult.clip_worthy_moments.map((m, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="font-label text-[11px] font-semibold text-lavender shrink-0 mt-0.5">{m.timestamp}</span>
                        <p className="text-[13px] text-graphite leading-snug">{m.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-paper-white border border-fog rounded-xl p-5" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
                  <p className="font-label text-[10.5px] font-semibold text-ash uppercase tracking-widest mb-3">Social post ideas</p>
                  <div className="flex flex-col gap-2.5">
                    {selectedResult.social_post_ideas.map((idea, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Sparkles size={13} className="text-lavender shrink-0 mt-0.5" />
                        <p className="text-[13px] text-carbon leading-snug">{idea}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedResult.blog_outline && (
                  <div className="bg-paper-white border border-fog rounded-xl p-5" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
                    <p className="font-label text-[10.5px] font-semibold text-ash uppercase tracking-widest mb-2">Blog post outline</p>
                    <pre className="text-[13px] text-graphite leading-relaxed whitespace-pre-wrap font-sans">{selectedResult.blog_outline}</pre>
                  </div>
                )}

                <p className="text-[11px] text-ash text-center">
                  These are AI-generated starting points — review before you publish.
                </p>
              </div>
            ) : (
              <div className="bg-paper-white border border-fog rounded-xl p-8 text-center" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
                <p className="text-[14px] font-semibold text-carbon mb-1.5">No repurposing generated for this video yet.</p>
                <p className="text-[13px] text-graphite max-w-[360px] mx-auto">
                  This demo includes pre-generated suggestions for a few videos, marked &quot;Ready&quot; in the list.
                  In production, generating new suggestions here calls Gemini against the video&apos;s real transcript.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

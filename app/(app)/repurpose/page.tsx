'use client'

import { useState } from 'react'

const sampleResult = {
  summary: 'This video breaks down a 5-step workflow for landing brand sponsorships without an agent. The creator shares their rate card template, follow-up timing strategy, and how they use Gmail filters to never miss an inbound deal.',
  clipMoments: [
    { time: '2:14', quote: '"Most creators don\'t follow up. That\'s how I close 80% of deals."' },
    { time: '5:40', quote: 'The rate card reveal — shows the actual document on screen' },
    { time: '8:02', quote: '"Never accept the first number. It\'s almost always negotiable."' },
  ],
  socialPosts: [
    'Most creators lose brand deals not because they\'re not good enough — but because they never follow up. Here\'s the exact timing I use 👇',
    'I\'ve landed $50K+ in sponsorships this year without an agent. The secret? A one-page rate card that does the selling for me.',
    'Hot take: brands respect creators who know their rate and don\'t apologize for it.',
  ],
  blogOutline: [
    'Introduction: The sponsorship follow-up problem',
    '1. Build a rate card that answers questions before they\'re asked',
    '2. The 3-email follow-up sequence (with timing)',
    '3. How to handle lowball offers without burning the relationship',
    '4. When to say no',
    'Conclusion: Consistency beats hustle',
  ],
}

export default function RepurposePage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<typeof sampleResult | null>(null)

  const handleSubmit = () => {
    if (!url.trim()) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setResult(sampleResult) }, 1800)
  }

  return (
    <main className="flex-1 overflow-y-auto bg-linen">
    <div className="max-w-[860px] mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="font-bold text-carbon" style={{ fontSize: '20px', letterSpacing: '-0.04em' }}>Repurpose</h1>
        <p className="text-[12.5px] text-ash mt-0.5">Turn a published video into more content</p>
      </div>

      {/* URL input */}
      <div className="bg-paper-white border border-fog rounded-2xl p-5 mb-8" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
        <p className="text-[14px] font-medium text-carbon mb-3">Paste a YouTube link, or pick one of your connected channel&apos;s videos.</p>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmit() }}
            className="flex-1 bg-linen border border-fog rounded-xl px-4 py-2.5 text-[14px] text-carbon placeholder-ash outline-none focus:border-lavender/60 transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={!url.trim() || loading}
            className="text-[13px] font-medium text-paper-white bg-lavender px-5 py-2.5 rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ boxShadow: 'rgba(0,0,0,0.08) 0px 1px 1px 1px, rgba(0,0,0,0.06) 0px 0px 0px 0.5px' }}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-ash text-[14px]">Fetching transcript and generating suggestions...</div>
      )}

      {result && !loading && (
        <div className="flex flex-col gap-6">
          <p className="text-[12px] text-ash italic">These are AI-generated starting points — review before you publish.</p>

          {/* Summary */}
          <div className="bg-paper-white border border-fog rounded-2xl p-5" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
            <h3 className="text-[13px] font-semibold text-carbon uppercase tracking-wider mb-3">Summary</h3>
            <p className="text-[14px] text-graphite leading-relaxed">{result.summary}</p>
          </div>

          {/* Clip moments */}
          <div className="bg-paper-white border border-fog rounded-2xl p-5" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
            <h3 className="text-[13px] font-semibold text-carbon uppercase tracking-wider mb-3">Clip-worthy moments</h3>
            <div className="flex flex-col gap-3">
              {result.clipMoments.map((c) => (
                <div key={c.time} className="flex gap-3 items-start">
                  <span className="text-[12px] font-semibold text-lavender bg-lavender/10 px-2 py-1 rounded-full shrink-0">{c.time}</span>
                  <p className="text-[14px] text-graphite italic leading-snug">{c.quote}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Social posts */}
          <div className="bg-paper-white border border-fog rounded-2xl p-5" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
            <h3 className="text-[13px] font-semibold text-carbon uppercase tracking-wider mb-3">Social post ideas</h3>
            <div className="flex flex-col gap-3">
              {result.socialPosts.map((post, i) => (
                <div key={i} className="flex gap-3 items-start bg-linen rounded-xl p-3">
                  <p className="text-[14px] text-carbon flex-1">{post}</p>
                  <button className="text-[11px] font-medium text-lavender hover:opacity-80 shrink-0">Copy</button>
                </div>
              ))}
            </div>
          </div>

          {/* Blog outline */}
          <div className="bg-paper-white border border-fog rounded-2xl p-5" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
            <h3 className="text-[13px] font-semibold text-carbon uppercase tracking-wider mb-3">Blog post outline</h3>
            <ol className="flex flex-col gap-2">
              {result.blogOutline.map((item, i) => (
                <li key={i} className="flex gap-2.5 items-start text-[14px] text-graphite">
                  <span className="text-[12px] font-semibold text-ash shrink-0 mt-0.5">{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
    </main>
  )
}

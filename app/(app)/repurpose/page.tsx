'use client'

import { useState } from 'react'

export default function RepurposePage() {
  const [url, setUrl] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!url.trim()) return
    setSubmitted(true)
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
            disabled={!url.trim()}
            className="text-[13px] font-medium text-paper-white bg-lavender px-5 py-2.5 rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ boxShadow: 'rgba(0,0,0,0.08) 0px 1px 1px 1px, rgba(0,0,0,0.06) 0px 0px 0px 0.5px' }}
          >
            Analyze
          </button>
        </div>
      </div>

      {submitted && (
        <div className="text-center py-12">
          <p className="text-[14px] font-semibold text-carbon mb-1">This feature isn&apos;t live yet.</p>
          <p className="text-[13px] text-graphite max-w-[360px] mx-auto">
            Video repurposing is coming in a future update — we&apos;ll fetch the transcript and generate real suggestions here.
          </p>
        </div>
      )}
    </div>
    </main>
  )
}

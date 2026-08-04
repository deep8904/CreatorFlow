'use client'

import { useTransition } from 'react'
import { Copy, ExternalLink, RefreshCw, Eye, Video, ThumbsUp, Handshake } from 'lucide-react'
import { regenerateMediaKitShareToken, updateMediaKitVisibility } from '@/lib/supabase/actions'
import type { ChannelVideo, Deal, MediaKit } from '@/lib/supabase/types'
import { computeVideoStats, formatCompactNumber } from '@/lib/mediaKit'
import { DashboardHeader } from '@/components/dash/DashboardHeader'
import { Panel } from '@/components/dash/Panel'
import { HOVER, FOCUS, FOCUS_INSET } from '@/components/dash/tokens'
import { useToast } from '@/lib/toast'

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}

export default function MediaKitBoard({
  mediaKit,
  closedDeals,
  channelVideos,
  youtubeConnected,
  youtubeHandle,
  youtubeIsDemo,
}: {
  mediaKit: MediaKit | null
  closedDeals: Deal[]
  channelVideos: ChannelVideo[]
  youtubeConnected: boolean
  youtubeHandle: string | null
  youtubeIsDemo: boolean
}) {
  const toast = useToast()
  const [isPending, startTransition] = useTransition()

  if (!mediaKit) {
    return (
      <main id="dashboard-main" className="console-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <DashboardHeader eyebrow="Media Kit" title="Media Kit" description="Couldn't load your media kit." />
        <div className="mx-auto w-full max-w-[720px] px-4 py-10 sm:px-6 lg:px-8">
          <p className="font-nebula-ui text-[13px] text-zinc-500">Please refresh the page and try again.</p>
        </div>
      </main>
    )
  }

  const sharePath = `/mediakit/${mediaKit.share_token}`
  const { videoCount, totalViews, totalLikes, topVideos } = computeVideoStats(channelVideos)

  const copyLink = async () => {
    try {
      // Resolved at click time (not during render) so there's no server/
      // client markup mismatch from `window` only existing in the browser.
      await navigator.clipboard.writeText(`${window.location.origin}${sharePath}`)
      toast.success('Link copied.')
    } catch {
      toast.error('Could not copy — your browser may be blocking clipboard access.')
    }
  }

  const toggleVisibility = () => {
    startTransition(async () => {
      const result = await updateMediaKitVisibility(!mediaKit.show_dollar_amounts)
      if (result.error) toast.error(result.error)
    })
  }

  const regenerate = () => {
    if (
      !window.confirm(
        'Regenerate the share link? The old link will stop working immediately — anyone you sent it to will need the new one.'
      )
    )
      return
    startTransition(async () => {
      const result = await regenerateMediaKitShareToken()
      if (result.error) toast.error(result.error)
      else toast.success('Share link regenerated.')
    })
  }

  return (
    <main id="dashboard-main" className="console-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <DashboardHeader
        eyebrow="Media Kit"
        title="Media Kit"
        description="A shareable page built from your real channel stats and closed deals — no Canva required."
      />

      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel title="Share link" titleId="share-link-h">
            <div className="flex flex-col gap-4 px-5 pb-5">
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={sharePath}
                  onFocus={(e) => e.currentTarget.select()}
                  className="h-9 min-w-0 flex-1 rounded-[9999px] border border-white/10 bg-white/[0.03] px-3.5 font-nebula-mono text-[12px] text-zinc-300 outline-none"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[9999px] border border-white/10 px-3 font-nebula-ui text-[12px] font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white ${HOVER} ${FOCUS}`}
                >
                  <Copy size={12} strokeWidth={2} /> Copy
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={sharePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex h-9 items-center gap-1.5 rounded-[9999px] border border-white/10 px-3.5 font-nebula-ui text-[12px] font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white ${HOVER} ${FOCUS}`}
                >
                  <ExternalLink size={12} strokeWidth={2} /> View public page
                </a>
                <button
                  type="button"
                  onClick={regenerate}
                  disabled={isPending}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-[9999px] border border-white/10 px-3.5 font-nebula-ui text-[12px] font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS}`}
                >
                  <RefreshCw size={12} strokeWidth={2} /> Regenerate link
                </button>
              </div>

              <div className="flex items-center gap-2 border-t border-white/[0.06] pt-4 font-nebula-ui text-[12.5px] text-zinc-400">
                <Eye size={13} strokeWidth={2} className="text-zinc-500" />
                {mediaKit.view_count === 0
                  ? 'No views yet.'
                  : `${mediaKit.view_count.toLocaleString()} ${mediaKit.view_count === 1 ? 'view' : 'views'}`}
              </div>
            </div>
          </Panel>

          <Panel title="Visibility" titleId="visibility-h">
            <div className="flex flex-col gap-3 px-5 pb-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-nebula-ui text-[13px] font-medium text-zinc-200">Show dollar amounts publicly</p>
                  <p className="mt-1 font-nebula-ui text-[12px] leading-relaxed text-zinc-500">
                    {mediaKit.show_dollar_amounts
                      ? 'Visitors see the rate for each closed deal.'
                      : 'Visitors see "X brand partnerships completed" — no dollar figures.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleVisibility}
                  disabled={isPending}
                  role="switch"
                  aria-checked={mediaKit.show_dollar_amounts}
                  aria-label={mediaKit.show_dollar_amounts ? 'Hide dollar amounts publicly' : 'Show dollar amounts publicly'}
                  className={`relative mt-0.5 h-6 w-10 shrink-0 rounded-[9999px] transition-colors disabled:opacity-50 ${HOVER} ${FOCUS_INSET} ${
                    mediaKit.show_dollar_amounts ? 'bg-orange-500' : 'bg-white/[0.12]'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-[9999px] bg-white transition-transform ${
                      mediaKit.show_dollar_amounts ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Panel>
        </div>

        <Panel
          title="Public preview"
          titleId="preview-h"
          eyebrow="What a visitor sees — no login required"
        >
          <div className="flex flex-col gap-5 px-5 pb-5">
            <div>
              <p className="mb-2 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                Channel
              </p>
              {!youtubeConnected ? (
                <p className="font-nebula-ui text-[12.5px] text-zinc-500">
                  Connect YouTube in Settings to show real channel performance here.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="font-nebula-ui text-[13px] text-zinc-200">{youtubeHandle ?? 'Connected channel'}</p>
                  {youtubeIsDemo && (
                    <p className="font-nebula-ui text-[10.5px] text-zinc-600">Seeded demo data, not a live connection.</p>
                  )}
                  {videoCount === 0 ? (
                    <p className="font-nebula-ui text-[12.5px] text-zinc-500">No video performance yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-1.5 font-nebula-ui text-[12.5px] text-zinc-300">
                        <Video size={13} strokeWidth={2} className="text-zinc-500" />
                        {videoCount} {videoCount === 1 ? 'video' : 'videos'}
                      </div>
                      <div className="flex items-center gap-1.5 font-nebula-ui text-[12.5px] text-zinc-300">
                        <Eye size={13} strokeWidth={2} className="text-zinc-500" />
                        {formatCompactNumber(totalViews)} views
                      </div>
                      <div className="flex items-center gap-1.5 font-nebula-ui text-[12.5px] text-zinc-300">
                        <ThumbsUp size={13} strokeWidth={2} className="text-zinc-500" />
                        {formatCompactNumber(totalLikes)} likes
                      </div>
                    </div>
                  )}
                  {topVideos.length > 0 && (
                    <ul className="flex flex-col gap-1.5">
                      {topVideos.map((v) => (
                        <li key={v.id} className="flex items-center justify-between gap-3 font-nebula-ui text-[12px] text-zinc-400">
                          <span className="min-w-0 flex-1 truncate">{v.title}</span>
                          <span className="shrink-0 font-nebula-mono text-zinc-500">{formatCompactNumber(v.views)} views</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.06] pt-4">
              <p className="mb-2 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                Brand partnerships
              </p>
              {closedDeals.length === 0 ? (
                <p className="font-nebula-ui text-[12.5px] text-zinc-500">No completed partnerships yet.</p>
              ) : mediaKit.show_dollar_amounts ? (
                <ul className="flex flex-col gap-1.5">
                  {closedDeals.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 font-nebula-ui text-[12.5px] text-zinc-300">
                      <span className="flex items-center gap-1.5 truncate">
                        <Handshake size={12} strokeWidth={2} className="shrink-0 text-zinc-500" />
                        {d.brand_name ?? 'Untitled deal'}
                      </span>
                      <span className="shrink-0 font-nebula-mono text-zinc-400">
                        {d.rate_amount_cents === null ? '—' : formatMoney(d.rate_amount_cents)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-nebula-ui text-[13px] text-zinc-200">
                  {closedDeals.length} brand {closedDeals.length === 1 ? 'partnership' : 'partnerships'} completed
                </p>
              )}
            </div>
          </div>
        </Panel>
      </div>
    </main>
  )
}

import type { Metadata } from 'next'
import { Eye, Video, ThumbsUp, Handshake } from 'lucide-react'
import { createSupabaseServiceRoleClient } from '@/lib/supabase/serviceRole'
import { computeVideoStats, formatCompactNumber } from '@/lib/mediaKit'
import type { ChannelVideo, Deal } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'Media Kit - CreatorFlow' }

// Public, unauthenticated route — deliberately outside app/(app), which is
// the only auth-gated layout in this app (see app/(app)/layout.tsx). Every
// query here runs through the service-role client and an explicit column
// allowlist, never `select('*')` on a table an anonymous visitor shouldn't
// see in full — the same posture CLAUDE.md requires for `integrations`.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}

function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-2 bg-black px-6 text-center text-white">
      <p className="font-nebula-heading text-[18px] font-semibold">This media kit link isn&apos;t valid.</p>
      <p className="font-nebula-ui text-[13px] text-zinc-500">It may have been regenerated or the link was mistyped.</p>
    </div>
  )
}

export default async function PublicMediaKitPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = await params
  if (!UUID_RE.test(shareToken)) return <NotFound />

  const supabase = createSupabaseServiceRoleClient()
  if (!supabase) return <NotFound />

  const { data: mediaKit } = await supabase
    .from('media_kits')
    .select('id, user_id, show_dollar_amounts, view_count')
    .eq('share_token', shareToken)
    .maybeSingle()
  if (!mediaKit) return <NotFound />

  const [{ data: integration }, { data: channelVideos }, { data: deals }, { data: profile }] = await Promise.all([
    supabase
      .from('integrations')
      .select('provider, metadata, is_demo')
      .eq('user_id', mediaKit.user_id)
      .eq('provider', 'youtube')
      .maybeSingle(),
    supabase
      .from('channel_videos')
      .select('id, title, published_at, views, likes, comments, duration_seconds')
      .eq('user_id', mediaKit.user_id)
      .order('views', { ascending: false }),
    supabase
      .from('deals')
      .select('id, brand_name, rate_amount_cents, paid_at')
      .eq('user_id', mediaKit.user_id)
      .eq('status', 'paid')
      .order('paid_at', { ascending: false }),
    supabase.from('profiles').select('full_name').eq('id', mediaKit.user_id).maybeSingle(),
  ])

  // Best-effort, non-atomic increment — acceptable for a low-traffic share
  // link; a simple count is the spec, not a precise analytics pipeline.
  await supabase
    .from('media_kits')
    .update({ view_count: mediaKit.view_count + 1 })
    .eq('id', mediaKit.id)

  const videos = (channelVideos as ChannelVideo[] | null) ?? []
  const closedDeals = (deals as Deal[] | null) ?? []
  const { videoCount, totalViews, totalLikes, topVideos } = computeVideoStats(videos, 8)
  const metadata = (integration?.metadata ?? {}) as Record<string, unknown>
  const handle = typeof metadata.email === 'string' ? metadata.email : null
  const creatorName = profile?.full_name?.trim() || handle || 'This creator'

  return (
    <div className="min-h-screen w-full bg-black text-white antialiased selection:bg-orange-500/30 selection:text-orange-200">
      <main className="mx-auto flex w-full max-w-[820px] flex-col gap-10 px-6 py-16 sm:px-8">
        <header className="flex flex-col gap-2">
          <p className="font-nebula-mono text-[11px] font-medium uppercase tracking-[0.16em] text-orange-400">Media Kit</p>
          <h1 className="font-nebula-heading text-[30px] font-semibold leading-tight text-white sm:text-[36px]">
            {creatorName}
          </h1>
          {handle && <p className="font-nebula-ui text-[14px] text-zinc-500">{handle}</p>}
          {integration?.is_demo && (
            <p className="font-nebula-ui text-[11px] text-zinc-600">Seeded demo data, not a live channel connection.</p>
          )}
        </header>

        <section aria-labelledby="channel-h" className="nebula-border rounded-[1.25rem] bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 id="channel-h" className="mb-4 font-nebula-heading text-[15px] font-semibold text-white">
            Channel performance
          </h2>
          {!integration || videoCount === 0 ? (
            <p className="font-nebula-ui text-[13px] text-zinc-500">No video performance published yet.</p>
          ) : (
            <>
              <div className="mb-5 flex flex-wrap gap-6">
                <div>
                  <p className="font-nebula-mono text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">
                    <Video size={11} strokeWidth={2} className="mr-1 inline" /> Videos
                  </p>
                  <p className="mt-1 font-nebula-heading text-[20px] font-semibold text-white">{videoCount}</p>
                </div>
                <div>
                  <p className="font-nebula-mono text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">
                    <Eye size={11} strokeWidth={2} className="mr-1 inline" /> Total views
                  </p>
                  <p className="mt-1 font-nebula-heading text-[20px] font-semibold text-white">{formatCompactNumber(totalViews)}</p>
                </div>
                <div>
                  <p className="font-nebula-mono text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-500">
                    <ThumbsUp size={11} strokeWidth={2} className="mr-1 inline" /> Total likes
                  </p>
                  <p className="mt-1 font-nebula-heading text-[20px] font-semibold text-white">{formatCompactNumber(totalLikes)}</p>
                </div>
              </div>
              <ul className="flex flex-col divide-y divide-white/[0.06] border-t border-white/[0.06]">
                {topVideos.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-4 py-2.5">
                    <span className="min-w-0 flex-1 truncate font-nebula-ui text-[13px] text-zinc-200">{v.title}</span>
                    <span className="shrink-0 font-nebula-mono text-[12px] text-zinc-500">
                      {formatCompactNumber(v.views)} views
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section aria-labelledby="deals-h" className="nebula-border rounded-[1.25rem] bg-white/[0.03] p-6 backdrop-blur-xl">
          <h2 id="deals-h" className="mb-4 font-nebula-heading text-[15px] font-semibold text-white">
            Brand partnerships
          </h2>
          {closedDeals.length === 0 ? (
            <p className="font-nebula-ui text-[13px] text-zinc-500">No completed partnerships yet.</p>
          ) : mediaKit.show_dollar_amounts ? (
            <ul className="flex flex-col divide-y divide-white/[0.06] border-t border-white/[0.06]">
              {closedDeals.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="flex min-w-0 items-center gap-2 truncate font-nebula-ui text-[13px] text-zinc-200">
                    <Handshake size={13} strokeWidth={2} className="shrink-0 text-zinc-500" />
                    {d.brand_name ?? 'Undisclosed brand'}
                  </span>
                  <span className="shrink-0 font-nebula-mono text-[12.5px] text-zinc-400">
                    {d.rate_amount_cents === null ? '—' : formatMoney(d.rate_amount_cents)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-nebula-ui text-[15px] text-zinc-200">
              {closedDeals.length} brand {closedDeals.length === 1 ? 'partnership' : 'partnerships'} completed
            </p>
          )}
        </section>

        <footer className="pt-2 text-center">
          <p className="font-nebula-ui text-[11px] text-zinc-600">Built with CreatorFlow, free with no cut of any deal.</p>
        </footer>
      </main>
    </div>
  )
}

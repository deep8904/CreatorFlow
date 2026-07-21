import { NextResponse } from 'next/server'
import { createSupabaseServerClient, getAuthenticatedUser } from '@/lib/supabase/server'

// Every table queried here already has an owner-only RLS policy, so this reads
// through the caller's own session — no service role needed. The one exception
// is `integrations`: per CLAUDE.md's non-negotiable security requirements, that
// table is never read via a direct client query (it holds encrypted OAuth
// tokens) — it goes through the same get-integrations edge function Settings
// uses, which only ever selects/returns non-sensitive metadata columns.
export async function GET() {
  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const [profile, deals, ideas, drafts, automations, channelStats, channelVideos, repurposedContent, integrationsResult] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('deals').select('*').eq('user_id', user.id),
      supabase.from('ideas').select('*').eq('user_id', user.id),
      supabase.from('drafts').select('*').eq('user_id', user.id),
      supabase.from('automations').select('*').eq('user_id', user.id),
      supabase.from('channel_stats_daily').select('*').eq('user_id', user.id),
      supabase.from('channel_videos').select('*').eq('user_id', user.id),
      supabase.from('repurposed_content').select('*').eq('user_id', user.id),
      supabase.functions.invoke('get-integrations'),
    ])

  const payload = {
    exported_at: new Date().toISOString(),
    profile: profile.data ?? null,
    deals: deals.data ?? [],
    ideas: ideas.data ?? [],
    drafts: drafts.data ?? [],
    automations: automations.data ?? [],
    channel_stats_daily: channelStats.data ?? [],
    channel_videos: channelVideos.data ?? [],
    repurposed_content: repurposedContent.data ?? [],
    connected_accounts: integrationsResult.data?.integrations ?? [],
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="creatorflow-export.json"',
    },
  })
}

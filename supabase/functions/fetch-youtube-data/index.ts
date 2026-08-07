// On-demand real YouTube Data API v3 fetch for a connected (non-demo)
// account, replacing the seeded channel_videos rows with the creator's
// actual recent uploads.
//
// Scope note: the `youtube.readonly` scope this account was granted covers
// the Data API (channel snippet/statistics, video list) but NOT the
// separate YouTube Analytics API (`yt-analytics.readonly`), which is what
// would be needed for a real day-by-day views/watch-time trend. Writing the
// channel's all-time cumulative view count into channel_stats_daily's
// per-day `views` column would misrepresent it as a daily figure — that's
// exactly the kind of fake-looking-real data this pass is trying to
// eliminate, so this function deliberately leaves channel_stats_daily
// alone. The trend chart's existing "no data" empty state is the honest
// result until the account adds yt-analytics.readonly and reconnects.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { getValidAccessToken } from '../_shared/google.ts'

function parseIsoDuration(iso: string | undefined): number | null {
  if (!iso) return null
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso)
  if (!match) return null
  const [, h, m, s] = match
  return (Number(h ?? 0) * 3600) + (Number(m ?? 0) * 60) + Number(s ?? 0)
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: userData, error: userError } = await callerClient.auth.getUser()
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  const { data: memberships, error: membershipError } = await adminClient
    .from('team_members')
    .select('account_id')
    .eq('user_id', userData.user.id)
  if (membershipError) {
    return new Response(JSON.stringify({ error: membershipError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const joinedAccount = memberships?.find((m) => m.account_id !== userData.user.id)
  const accountId = joinedAccount?.account_id ?? userData.user.id

  const { data: row, error: rowError } = await adminClient
    .from('integrations')
    .select('is_demo, access_token_secret_id, refresh_token_secret_id, expires_at')
    .eq('user_id', accountId)
    .eq('provider', 'youtube')
    .maybeSingle()
  if (rowError) {
    return new Response(JSON.stringify({ error: rowError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (!row || row.is_demo) {
    return new Response(JSON.stringify({ error: 'No real YouTube connection for this account.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const tokenResult = await getValidAccessToken(adminClient, accountId, row)
  if ('error' in tokenResult) {
    return new Response(JSON.stringify({ error: tokenResult.error }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const authHeaders = { Authorization: `Bearer ${tokenResult.accessToken}` }

  const channelResp = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true',
    { headers: authHeaders },
  )
  const channelJson = await channelResp.json()
  if (!channelResp.ok) {
    return new Response(JSON.stringify({ error: channelJson.error?.message ?? 'YouTube channels.list failed.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const channel = channelJson.items?.[0]
  if (!channel) {
    return new Response(JSON.stringify({ error: 'No YouTube channel found for this Google account.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads as string | undefined
  let videos: Record<string, unknown>[] = []

  if (uploadsPlaylistId) {
    const playlistResp = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=15`,
      { headers: authHeaders },
    )
    const playlistJson = await playlistResp.json()
    const videoIds = (playlistJson.items ?? [])
      .map((item: { contentDetails?: { videoId?: string } }) => item.contentDetails?.videoId)
      .filter((id: string | undefined): id is string => !!id)

    if (videoIds.length > 0) {
      const videosResp = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(',')}`,
        { headers: authHeaders },
      )
      const videosJson = await videosResp.json()
      videos = videosJson.items ?? []
    }
  }

  const videoRows = videos.map((v) => {
    const vv = v as {
      id: string
      snippet?: { title?: string; publishedAt?: string }
      statistics?: { viewCount?: string; likeCount?: string; commentCount?: string }
      contentDetails?: { duration?: string }
    }
    return {
      user_id: accountId,
      youtube_video_id: vv.id,
      title: vv.snippet?.title ?? 'Untitled video',
      published_at: vv.snippet?.publishedAt ?? new Date().toISOString(),
      views: Number(vv.statistics?.viewCount ?? 0),
      likes: Number(vv.statistics?.likeCount ?? 0),
      comments: Number(vv.statistics?.commentCount ?? 0),
      duration_seconds: parseIsoDuration(vv.contentDetails?.duration),
      watch_time_minutes: 0, // not derivable from the Data API — needs yt-analytics.readonly
    }
  })

  // Full replace on each on-demand refresh — simplest correct v1 behavior,
  // matching "on-demand refresh is fine for v1" scope.
  const { error: deleteError } = await adminClient.from('channel_videos').delete().eq('user_id', accountId)
  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (videoRows.length > 0) {
    const { error: insertError } = await adminClient.from('channel_videos').insert(videoRows)
    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  const handle = (channel.snippet?.customUrl as string | undefined) ?? (channel.snippet?.title as string | undefined) ?? null
  await adminClient
    .from('integrations')
    .update({ metadata: { email: handle }, updated_at: new Date().toISOString() })
    .eq('user_id', accountId)
    .eq('provider', 'youtube')

  return new Response(
    JSON.stringify({
      success: true,
      videosFetched: videoRows.length,
      subscriberCount: Number(channel.statistics?.subscriberCount ?? 0),
      totalViewCount: Number(channel.statistics?.viewCount ?? 0),
      trendNote:
        'Views/watch-time trend not populated: this Google grant only has youtube.readonly, which covers the Data API, not the Analytics API needed for a daily trend.',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})

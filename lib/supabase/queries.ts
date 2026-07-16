import { createSupabaseServerClient, getAuthenticatedUser } from './server'
import type {
  Automation,
  ChannelStatsDaily,
  ChannelVideo,
  Deal,
  Draft,
  Idea,
  Profile,
  RepurposedContent,
  TeamInvite,
  TeamMember,
} from './types'

export async function getCurrentProfile(): Promise<Profile | null> {
  const { user } = await getAuthenticatedUser()
  if (!user) return null

  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return (data as Profile) ?? null
}

export async function getIdeas(): Promise<Idea[]> {
  const { user } = await getAuthenticatedUser()
  if (!user) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('ideas')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  return (data as Idea[]) ?? []
}

export type DraftWithIdeaTitle = Draft & { ideas: { title: string } | null }

export async function getDrafts(): Promise<DraftWithIdeaTitle[]> {
  const { user } = await getAuthenticatedUser()
  if (!user) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('drafts')
    .select('*, ideas(title)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
  return (data as DraftWithIdeaTitle[]) ?? []
}

export async function getDeals(): Promise<Deal[]> {
  const { user } = await getAuthenticatedUser()
  if (!user) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('deals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  return (data as Deal[]) ?? []
}

export async function getAutomations(): Promise<Automation[]> {
  const { user } = await getAuthenticatedUser()
  if (!user) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('automations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  return (data as Automation[]) ?? []
}

export type IntegrationStatus = {
  provider: string
  connected: boolean
  connectedAt: string
  accountLabel: string | null
}

export async function getIntegrations(): Promise<IntegrationStatus[]> {
  const { user } = await getAuthenticatedUser()
  if (!user) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  // Reads go through the get-integrations edge function (service role), never a direct
  // client-facing query — the integrations table's RLS policy blocks direct client selects
  // entirely, and the function only ever selects non-token columns to begin with.
  const { data, error } = await supabase.functions.invoke('get-integrations')
  if (error) return []
  return (data?.integrations as IntegrationStatus[]) ?? []
}

async function getAccountId(userId: string): Promise<string> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return userId

  const { data } = await supabase
    .from('team_members')
    .select('account_id')
    .eq('user_id', userId)
    .maybeSingle()
  return (data?.account_id as string | undefined) ?? userId
}

export type TeamData = {
  accountId: string
  members: (TeamMember & { profile: Profile | null })[]
  pendingInvite: TeamInvite | null
  isOwner: boolean
}

export async function getTeam(): Promise<TeamData | null> {
  const { user } = await getAuthenticatedUser()
  if (!user) return null

  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const accountId = await getAccountId(user.id)

  const [{ data: memberRows }, { data: inviteRows }] = await Promise.all([
    supabase.from('team_members').select('*').eq('account_id', accountId).order('joined_at', { ascending: true }),
    supabase
      .from('team_invites')
      .select('*')
      .eq('account_id', accountId)
      .eq('status', 'pending')
      .maybeSingle(),
  ])

  const members = (memberRows as TeamMember[]) ?? []
  const profileIds = members.map((m) => m.user_id)
  const { data: profileRows } = profileIds.length
    ? await supabase.from('profiles').select('*').in('id', profileIds)
    : { data: [] as Profile[] }

  const profilesById = new Map((profileRows as Profile[] ?? []).map((p) => [p.id, p]))

  return {
    accountId,
    members: members.map((m) => ({ ...m, profile: profilesById.get(m.user_id) ?? null })),
    pendingInvite: (inviteRows as TeamInvite | null) ?? null,
    isOwner: members.some((m) => m.user_id === user.id && m.role === 'owner'),
  }
}

// Cached/seeded channel performance — see channel_stats_daily table notes. Stands
// in for a live YouTube Analytics pull when no real account is connected.
export async function getChannelStats(days = 120): Promise<ChannelStatsDaily[]> {
  const { user } = await getAuthenticatedUser()
  if (!user) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
  const { data } = await supabase
    .from('channel_stats_daily')
    .select('*')
    .eq('user_id', user.id)
    .gte('stat_date', since)
    .order('stat_date', { ascending: true })
  return (data as ChannelStatsDaily[]) ?? []
}

export async function getChannelVideos(): Promise<ChannelVideo[]> {
  const { user } = await getAuthenticatedUser()
  if (!user) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('channel_videos')
    .select('*')
    .eq('user_id', user.id)
    .order('published_at', { ascending: false })
  return (data as ChannelVideo[]) ?? []
}

export type RepurposedContentWithVideo = RepurposedContent & { channel_videos: { title: string } | null }

export async function getRepurposedContent(): Promise<RepurposedContentWithVideo[]> {
  const { user } = await getAuthenticatedUser()
  if (!user) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('repurposed_content')
    .select('*, channel_videos(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  return (data as RepurposedContentWithVideo[]) ?? []
}

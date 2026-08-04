import { createSupabaseServerClient, getAuthenticatedUser } from './server'
import type {
  Account,
  Automation,
  ChannelStatsDaily,
  ChannelVideo,
  Deal,
  DealStageHistory,
  Draft,
  Idea,
  MediaKit,
  Profile,
  RepurposedContent,
  Role,
  TeamInvite,
  TeamMember,
} from './types'

export async function getCurrentProfile(): Promise<Profile | null> {
  const { user } = await getAuthenticatedUser()
  if (!user) return null

  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (error) throw new Error(error.message)
  return (data as Profile) ?? null
}

export type CurrentAccount = {
  accountId: string
  role: Role
}

/**
 * Resolves which account the signed-in user is acting on, and their role in
 * it. `handle_new_team_owner()` guarantees every user has at least their own
 * solo owner row, but a user can also belong to a team they joined — in
 * which case that joined account takes priority, since a teammate signing in
 * is there to work on the account they were invited to, not their own
 * (usually empty) solo account.
 */
export async function getCurrentAccount(): Promise<CurrentAccount | null> {
  const { user } = await getAuthenticatedUser()
  if (!user) return null

  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const { data, error } = await supabase.from('team_members').select('account_id, role').eq('user_id', user.id)
  if (error) throw new Error(error.message)
  const memberships = (data as { account_id: string; role: Role }[] | null) ?? []
  const resolved =
    memberships.find((m) => m.account_id !== user.id) ?? memberships.find((m) => m.account_id === user.id)
  if (!resolved) return null

  return { accountId: resolved.account_id, role: resolved.role }
}

export async function getIdeas(): Promise<Idea[]> {
  const account = await getCurrentAccount()
  if (!account) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('user_id', account.accountId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as Idea[]) ?? []
}

export type DraftWithIdeaTitle = Draft & { ideas: { title: string } | null }

export async function getDrafts(): Promise<DraftWithIdeaTitle[]> {
  const account = await getCurrentAccount()
  if (!account) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('drafts')
    .select('*, ideas(title)')
    .eq('user_id', account.accountId)
    .order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as DraftWithIdeaTitle[]) ?? []
}

export async function getDeals(): Promise<Deal[]> {
  const account = await getCurrentAccount()
  if (!account) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('user_id', account.accountId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as Deal[]) ?? []
}

/**
 * All history rows for the account in one query — grouped by `deal_id` on
 * the client. A handful of deals with a few transitions each is small
 * enough that this beats an N+1 per-deal fetch.
 */
export async function getDealStageHistory(): Promise<DealStageHistory[]> {
  const account = await getCurrentAccount()
  if (!account) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('deal_stage_history')
    .select('*')
    .eq('user_id', account.accountId)
    .order('changed_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as DealStageHistory[]) ?? []
}

export async function getAutomations(): Promise<Automation[]> {
  const account = await getCurrentAccount()
  if (!account) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('automations')
    .select('*')
    .eq('user_id', account.accountId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data as Automation[]) ?? []
}

export type IntegrationStatus = {
  provider: string
  connected: boolean
  connectedAt: string
  accountLabel: string | null
  isDemo: boolean
}

export async function getIntegrations(): Promise<IntegrationStatus[]> {
  const { user } = await getAuthenticatedUser()
  if (!user) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  // Reads go through the get-integrations edge function (service role), never a direct
  // client-facing query — the integrations table's RLS policy blocks direct client selects
  // entirely, and the function only ever selects non-token columns to begin with. The edge
  // function resolves the caller's account itself, so no accountId is passed here.
  const { data, error } = await supabase.functions.invoke('get-integrations')
  if (error) return []
  return (data?.integrations as IntegrationStatus[]) ?? []
}

/**
 * Lightweight check for the onboarding checklist's "invite a teammate" item
 * — a count of two lookups, not the full member/invite/profile join getTeam()
 * does for the actual Team page.
 */
export async function hasInvitedTeammate(): Promise<boolean> {
  const account = await getCurrentAccount()
  if (!account) return false

  const supabase = await createSupabaseServerClient()
  if (!supabase) return false

  const [{ count: memberCount }, { count: inviteCount }] = await Promise.all([
    supabase.from('team_members').select('user_id', { count: 'exact', head: true }).eq('account_id', account.accountId),
    supabase
      .from('team_invites')
      .select('id', { count: 'exact', head: true })
      .eq('account_id', account.accountId)
      .eq('status', 'pending'),
  ])
  return (memberCount ?? 0) > 1 || (inviteCount ?? 0) > 0
}

export type TeamData = {
  accountId: string
  workspaceName: string
  members: (TeamMember & { profile: Profile | null })[]
  pendingInvites: TeamInvite[]
  isOwner: boolean
  currentRole: Role
}

export async function getTeam(): Promise<TeamData | null> {
  const { user } = await getAuthenticatedUser()
  if (!user) return null

  const account = await getCurrentAccount()
  if (!account) return null

  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const [membersResult, invitesResult, accountResult] = await Promise.all([
    supabase
      .from('team_members')
      .select('*')
      .eq('account_id', account.accountId)
      .order('joined_at', { ascending: true }),
    supabase
      .from('team_invites')
      .select('*')
      .eq('account_id', account.accountId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    supabase.from('accounts').select('*').eq('id', account.accountId).maybeSingle(),
  ])
  if (membersResult.error) throw new Error(membersResult.error.message)
  if (invitesResult.error) throw new Error(invitesResult.error.message)
  if (accountResult.error) throw new Error(accountResult.error.message)

  const members = (membersResult.data as TeamMember[]) ?? []
  const profileIds = members.map((m) => m.user_id)
  const { data: profileRows, error: profileError } = profileIds.length
    ? await supabase.from('profiles').select('*').in('id', profileIds)
    : { data: [] as Profile[], error: null }
  if (profileError) throw new Error(profileError.message)

  const profilesById = new Map((profileRows as Profile[] ?? []).map((p) => [p.id, p]))

  return {
    accountId: account.accountId,
    workspaceName: (accountResult.data as Account | null)?.workspace_name ?? 'My Workspace',
    members: members.map((m) => ({ ...m, profile: profilesById.get(m.user_id) ?? null })),
    pendingInvites: (invitesResult.data as TeamInvite[] | null) ?? [],
    isOwner: members.some((m) => m.user_id === user.id && m.role === 'owner'),
    currentRole: account.role,
  }
}

// RLS scopes this to pending invites addressed to the caller's own email
// (see the "Invited user can view their own pending invite" policy) —
// this is what lets a not-yet-a-member user see what they're accepting.
export async function getInviteById(id: string): Promise<TeamInvite | null> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const { data, error } = await supabase.from('team_invites').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return (data as TeamInvite) ?? null
}

// Cached/seeded channel performance — see channel_stats_daily table notes. Stands
// in for a live YouTube Analytics pull when no real account is connected.
export async function getChannelStats(days = 120): Promise<ChannelStatsDaily[]> {
  const account = await getCurrentAccount()
  if (!account) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('channel_stats_daily')
    .select('*')
    .eq('user_id', account.accountId)
    .gte('stat_date', since)
    .order('stat_date', { ascending: true })
  if (error) throw new Error(error.message)
  return (data as ChannelStatsDaily[]) ?? []
}

export async function getChannelVideos(): Promise<ChannelVideo[]> {
  const account = await getCurrentAccount()
  if (!account) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('channel_videos')
    .select('*')
    .eq('user_id', account.accountId)
    .order('published_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as ChannelVideo[]) ?? []
}

// Get-or-create — every account gets exactly one media kit row, lazily
// created the first time the Media Kit page (or a regenerate/toggle
// action) touches it, rather than provisioning one at signup for accounts
// that may never use the feature.
export async function getOrCreateMediaKit(): Promise<MediaKit | null> {
  const account = await getCurrentAccount()
  if (!account) return null

  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const { data: existing, error: selectError } = await supabase
    .from('media_kits')
    .select('*')
    .eq('user_id', account.accountId)
    .maybeSingle()
  if (selectError) throw new Error(selectError.message)
  if (existing) return existing as MediaKit

  const { data: created, error: insertError } = await supabase
    .from('media_kits')
    .insert({ user_id: account.accountId })
    .select('*')
    .single()
  if (insertError) throw new Error(insertError.message)
  return created as MediaKit
}

export type RepurposedContentWithVideo = RepurposedContent & { channel_videos: { title: string } | null }

export async function getRepurposedContent(): Promise<RepurposedContentWithVideo[]> {
  const account = await getCurrentAccount()
  if (!account) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('repurposed_content')
    .select('*, channel_videos(title)')
    .eq('user_id', account.accountId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as RepurposedContentWithVideo[]) ?? []
}

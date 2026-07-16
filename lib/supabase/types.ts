export type Profile = {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  onboarding_completed: boolean
  timezone: string | null
  locale: string | null
  created_at: string
  updated_at: string
}

export type Idea = {
  id: string
  user_id: string
  title: string
  notes: string | null
  tags: string[]
  status: 'new' | 'in_progress' | 'scheduled' | 'done' | 'archived'
  created_at: string
  updated_at: string
}

export type Draft = {
  id: string
  user_id: string
  idea_id: string | null
  title: string
  body: string
  created_at: string
  updated_at: string
}

export type Deal = {
  id: string
  user_id: string
  brand_name: string | null
  contact_name: string | null
  contact_email: string | null
  status: 'inbound' | 'negotiating' | 'contracted' | 'delivered' | 'paid'
  rate_amount_cents: number | null
  deliverables: string | null
  notes: string | null
  email_thread_id: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export type Integration = {
  id: string
  user_id: string
  provider: string
  access_token_encrypted: string | null
  refresh_token_encrypted: string | null
  expires_at: string | null
  scope: string[] | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export type Automation = {
  id: string
  user_id: string
  name: string
  trigger_type: string
  action_type: string
  config: Record<string, unknown> | null
  enabled: boolean
  created_at: string
  updated_at: string
}

export type TeamMember = {
  id: string
  account_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
}

export type TeamInvite = {
  id: string
  account_id: string
  invited_email: string
  role: 'owner' | 'member'
  status: 'pending' | 'accepted' | 'revoked'
  created_at: string
  accepted_at: string | null
  accepted_by: string | null
}

// Cached/seeded YouTube channel performance — stands in for a live API pull
// when no real YouTube account is connected (see the `integrations` table).
export type ChannelStatsDaily = {
  id: string
  user_id: string
  stat_date: string
  views: number
  watch_time_minutes: number
  subscribers_total: number
  subscribers_gained: number
  created_at: string
}

export type ChannelVideo = {
  id: string
  user_id: string
  youtube_video_id: string | null
  title: string
  published_at: string
  views: number
  watch_time_minutes: number
  likes: number
  comments: number
  duration_seconds: number | null
  created_at: string
}

export type RepurposedContent = {
  id: string
  user_id: string
  video_id: string | null
  source_url: string | null
  summary: string | null
  clip_worthy_moments: { timestamp: string; description: string }[]
  social_post_ideas: string[]
  blog_outline: string | null
  created_at: string
}

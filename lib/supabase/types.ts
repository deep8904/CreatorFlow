export type Profile = {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  onboarding_completed: boolean
  onboarding_checklist_dismissed: boolean
  timezone: string | null
  locale: string | null
  notify_deal_reminders: boolean
  // Last-used multi-view per module, e.g. {"ideas": "board", "drafts": "gallery"}.
  view_preferences: Record<string, string>
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

export type DraftStatus = 'draft' | 'pending_review' | 'approved' | 'changes_requested'

export type Draft = {
  id: string
  user_id: string
  idea_id: string | null
  title: string
  body: string
  created_at: string
  updated_at: string
  due_date: string | null
  status: DraftStatus
  submitted_by: string | null
  review_notes: string | null
}

export type Deal = {
  id: string
  user_id: string
  brand_name: string | null
  contact_name: string | null
  contact_email: string | null
  status: 'inbound' | 'negotiating' | 'contracted' | 'delivered' | 'paid' | 'lost'
  rate_amount_cents: number | null
  deliverables: string | null
  notes: string | null
  email_thread_id: string | null
  due_date: string | null
  invoiced_at: string | null
  paid_at: string | null
  is_priority: boolean
  created_at: string
  updated_at: string
  // Schema-only today, no app logic reads/writes it yet — see
  // supabase/migrations/20260729030000_deal_archive_flag.sql.
  archived: boolean
  usage_rights_expires_at: string | null
}

export type DealStageHistory = {
  id: string
  deal_id: string
  user_id: string
  from_status: Deal['status'] | null
  to_status: Deal['status']
  changed_at: string
}

// Tokens live in Supabase Vault — these are secret references, never the
// token value itself (matches supabase/schema.sql's public.integrations).
export type Integration = {
  id: string
  user_id: string
  provider: string
  access_token_secret_id: string | null
  refresh_token_secret_id: string | null
  is_demo: boolean
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
  // Stage 3.3: a real cron expression (UTC); null for event-based rules.
  schedule: string | null
  schedule_label: string | null
}

// Stage 3.3: one row per pg_cron-triggered run, written by the
// run-scheduled-automations edge function.
export type AutomationActivity = {
  id: string
  automation_id: string
  user_id: string
  ran_at: string
  summary: string
  details: Record<string, unknown> | null
}

export type MediaKit = {
  id: string
  user_id: string
  share_token: string
  show_dollar_amounts: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export type Role = 'owner' | 'manager' | 'editor' | 'designer' | 'moderator'

export type TeamMember = {
  id: string
  account_id: string
  user_id: string
  role: Role
  joined_at: string
}

export type TeamInvite = {
  id: string
  account_id: string
  invited_email: string
  role: Role
  status: 'pending' | 'accepted' | 'revoked'
  created_at: string
  accepted_at: string | null
  accepted_by: string | null
}

export type Account = {
  id: string
  workspace_name: string
  created_at: string
  updated_at: string
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
  // Schema-only today, no app logic reads/writes it yet — see
  // supabase/migrations/20260729030100_channel_video_repurpose_suggested.sql.
  repurpose_suggested: boolean
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

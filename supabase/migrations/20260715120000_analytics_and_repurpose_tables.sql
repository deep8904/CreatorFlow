-- Cached/seeded YouTube channel performance, standing in for a live API pull when
-- no real YouTube account is connected (see integrations table). Daily granularity
-- so the Analytics screen can compute "this month vs last month" comparisons.
create table if not exists public.channel_stats_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stat_date date not null,
  views integer not null default 0,
  watch_time_minutes integer not null default 0,
  subscribers_total integer not null default 0,
  subscribers_gained integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, stat_date)
);

-- A lightweight catalog of the creator's published videos — backs both the
-- Analytics "Top videos" section and the Repurpose page's video picker.
create table if not exists public.channel_videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  youtube_video_id text,
  title text not null,
  published_at timestamptz not null default now(),
  views integer not null default 0,
  watch_time_minutes integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

-- Saved AI repurposing runs against a published video.
create table if not exists public.repurposed_content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid references public.channel_videos(id) on delete set null,
  source_url text,
  summary text,
  clip_worthy_moments jsonb not null default '[]',
  social_post_ideas jsonb not null default '[]',
  blog_outline text,
  created_at timestamptz not null default now()
);

alter table public.channel_stats_daily enable row level security;
alter table public.channel_videos enable row level security;
alter table public.repurposed_content enable row level security;

create policy "Users can manage own channel stats" on public.channel_stats_daily
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own channel videos" on public.channel_videos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own repurposed content" on public.repurposed_content
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

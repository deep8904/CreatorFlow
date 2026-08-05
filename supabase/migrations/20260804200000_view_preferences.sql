-- Backs Stage 3.1's multi-view records (board/calendar/gallery/table for
-- Ideas and Drafts) — the last-used view per module, per user. A plain jsonb
-- map keyed by module ('ideas' | 'drafts') rather than a new table: this is
-- a small, per-user UI preference, not a first-class record.
alter table public.profiles
  add column if not exists view_preferences jsonb not null default '{}'::jsonb;

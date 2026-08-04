-- Stage 2.3: Content Calendar. Additive date columns for the two sources
-- the calendar reads from — usage-rights expiry didn't exist anywhere on
-- deals yet, and drafts had no due-date concept at all (see Gate 0 of the
-- Stage 2 build).
alter table public.deals
  add column if not exists usage_rights_expires_at date;

alter table public.drafts
  add column if not exists due_date date;

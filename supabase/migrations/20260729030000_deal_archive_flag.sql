-- Backfilled migration file: this column was already applied directly to
-- the live project (as "deal_archive_flag", 2026-07-29) but the migration
-- was never committed to this repo, so local history and schema.sql/
-- types.ts had drifted from what's actually live. Adding the file now to
-- reconcile — statement matches exactly what's live, unmodified.
--
-- No application code reads or writes this column yet (confirmed via
-- repo-wide search) — the "Deal marked Paid → Archive contract" automation
-- row in AutomationsBoard.tsx is still explicitly labeled preview-only.
-- This column is the schema half of that feature with no app logic wired
-- to it; building that logic is out of scope here.
alter table public.deals
  add column if not exists archived boolean not null default false;

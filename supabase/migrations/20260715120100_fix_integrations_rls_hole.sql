-- Fix: "Users can manage own integrations" (for all) and "Integrations are
-- read-only via service role" (for select using (false)) were both present as
-- permissive policies on public.integrations. Postgres ORs multiple permissive
-- policies together for the same command, so the owner-access policy alone was
-- enough to let an authenticated user select their own integrations row
-- directly via the client REST API — including the token columns — completely
-- bypassing the get-integrations edge function this table was designed to be
-- read through exclusively. Confirmed exploitable via a direct authenticated
-- REST request before this fix.
--
-- Fix: drop both policies. With RLS enabled and zero permissive policies,
-- every direct client operation (select/insert/update/delete) is denied by
-- default. All access must go through the service role.
drop policy if exists "Users can manage own integrations" on public.integrations;
drop policy if exists "Integrations are read-only via service role" on public.integrations;

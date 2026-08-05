-- Stage 3.2: Approval-as-a-Capability for Drafts.
--
-- Adds a review state machine to drafts (draft -> pending_review ->
-- approved | changes_requested -> pending_review ...) plus who submitted a
-- draft, so a personal "your draft was approved/needs changes" notification
-- is possible despite drafts.user_id being the account id, not the author
-- (see the architectural note on that column).
alter table public.drafts
  add column if not exists status text not null default 'draft'
    check (status = any (array['draft', 'pending_review', 'approved', 'changes_requested'])),
  add column if not exists submitted_by uuid references auth.users(id) on delete set null,
  add column if not exists review_notes text;

-- Manager gets read access to Drafts for review purposes (Gate 0 flagged
-- Manager/Designer as having zero Drafts access today). This is additive to
-- the policy below, not a replacement — Manager still cannot insert/update/
-- delete a draft's content directly through it.
create policy "Manager can view drafts for review" on public.drafts
  for select using (public.has_role_access(user_id, array['owner', 'manager']));

-- Widen content-edit access to Designer (the other half of the Gate 0 gap),
-- and add a with-check that blocks Editor/Designer from ever setting status
-- to approved/changes_requested themselves — those transitions only happen
-- through approve_draft()/request_draft_changes() below, which check for
-- Manager/Owner explicitly. This is enforced at the RLS layer, not just in
-- the UI, so it holds even against a direct API call.
drop policy if exists "Role-scoped drafts access" on public.drafts;
create policy "Role-scoped drafts access" on public.drafts
  for all using (public.has_role_access(user_id, array['owner', 'editor', 'designer']))
  with check (
    public.has_role_access(user_id, array['owner'])
    or (
      public.has_role_access(user_id, array['editor', 'designer'])
      and status = any (array['draft', 'pending_review'])
    )
  );

create or replace function public.approve_draft(p_draft_id uuid, p_notes text default null)
returns public.drafts
language plpgsql
security definer set search_path = public
as $$
declare
  v_draft public.drafts;
begin
  select * into v_draft from public.drafts where id = p_draft_id for update;
  if v_draft is null then
    raise exception 'Draft not found.';
  end if;
  if not public.has_role_access(v_draft.user_id, array['owner', 'manager']) then
    raise exception 'Only a Manager or Owner can approve a draft.';
  end if;

  update public.drafts
    set status = 'approved', review_notes = p_notes, updated_at = now()
    where id = p_draft_id
    returning * into v_draft;

  return v_draft;
end;
$$;

create or replace function public.request_draft_changes(p_draft_id uuid, p_notes text)
returns public.drafts
language plpgsql
security definer set search_path = public
as $$
declare
  v_draft public.drafts;
begin
  if p_notes is null or btrim(p_notes) = '' then
    raise exception 'Review notes are required when requesting changes.';
  end if;

  select * into v_draft from public.drafts where id = p_draft_id for update;
  if v_draft is null then
    raise exception 'Draft not found.';
  end if;
  if not public.has_role_access(v_draft.user_id, array['owner', 'manager']) then
    raise exception 'Only a Manager or Owner can request changes on a draft.';
  end if;

  update public.drafts
    set status = 'changes_requested', review_notes = p_notes, updated_at = now()
    where id = p_draft_id
    returning * into v_draft;

  return v_draft;
end;
$$;

revoke all on function public.approve_draft(uuid, text) from public;
revoke all on function public.request_draft_changes(uuid, text) from public;
grant execute on function public.approve_draft(uuid, text) to authenticated;
grant execute on function public.request_draft_changes(uuid, text) to authenticated;

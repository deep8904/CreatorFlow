-- Accept-invite flow: an invited (non-member) user has no RLS access to
-- insert into team_members or update team_invites (both are owner-only by
-- policy, matching the pattern used by handle_new_team_owner()). A
-- SECURITY DEFINER function is the same escape hatch used there, scoped
-- narrowly to "the calling user accepting their own pending invite."
create or replace function public.accept_team_invite(p_invite_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
  v_caller_email text;
begin
  select email into v_caller_email from auth.users where id = auth.uid();
  if v_caller_email is null then
    return jsonb_build_object('success', false, 'error', 'You must be signed in.');
  end if;

  select * into v_invite from public.team_invites where id = p_invite_id for update;
  if v_invite is null then
    return jsonb_build_object('success', false, 'error', 'This invite could not be found.');
  end if;
  if v_invite.status <> 'pending' then
    return jsonb_build_object('success', false, 'error', 'This invite is no longer pending.');
  end if;
  if lower(v_invite.invited_email) <> lower(v_caller_email) then
    return jsonb_build_object('success', false, 'error', 'This invite was sent to a different email address.');
  end if;

  insert into public.team_members (account_id, user_id, role)
  values (v_invite.account_id, auth.uid(), v_invite.role)
  on conflict (account_id, user_id) do nothing;

  update public.team_invites
  set status = 'accepted', accepted_at = now(), accepted_by = auth.uid()
  where id = p_invite_id;

  return jsonb_build_object('success', true);
end;
$$;

-- Let the invited (not-yet-a-member) user look up their own pending invite
-- by email, so the accept-invite page can show who/what they're joining
-- before they confirm. Additive to the existing "Account members can view
-- invites" policy, not a replacement.
create policy "Invited user can view their own pending invite" on public.team_invites
  for select using (
    status = 'pending'
    and lower(invited_email) = lower((select email from auth.users where id = auth.uid()))
  );

-- PostgREST (and therefore supabase-js's .rpc()) only exposes the `public`
-- schema by default — `vault.create_secret`/`vault.decrypted_secrets` aren't
-- reachable directly from an edge function's admin client without either
-- widening the project's exposed-schema config (a project-level setting,
-- not something to change for one feature) or wrapping them. These three
-- thin SECURITY DEFINER wrappers are the latter, restricted to service_role
-- only — the same pattern already used for accept_team_invite,
-- transfer_account_ownership, etc.

create or replace function public.vault_create_secret_for_integration(p_secret text, p_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  return vault.create_secret(p_secret, p_name);
end;
$$;

create or replace function public.vault_read_secret_for_integration(p_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where id = p_id;
  return v_secret;
end;
$$;

create or replace function public.vault_update_secret_for_integration(p_id uuid, p_secret text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform vault.update_secret(p_id, p_secret);
end;
$$;

create or replace function public.vault_delete_secret_for_integration(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from vault.secrets where id = p_id;
end;
$$;

revoke execute on function public.vault_create_secret_for_integration(text, text) from public, anon, authenticated;
revoke execute on function public.vault_read_secret_for_integration(uuid) from public, anon, authenticated;
revoke execute on function public.vault_update_secret_for_integration(uuid, text) from public, anon, authenticated;
revoke execute on function public.vault_delete_secret_for_integration(uuid) from public, anon, authenticated;

grant execute on function public.vault_create_secret_for_integration(text, text) to service_role;
grant execute on function public.vault_read_secret_for_integration(uuid) to service_role;
grant execute on function public.vault_update_secret_for_integration(uuid, text) to service_role;
grant execute on function public.vault_delete_secret_for_integration(uuid) to service_role;

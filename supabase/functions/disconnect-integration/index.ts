// Deletes public.integrations rows on the caller's behalf using the service
// role, since the table has zero permissive RLS policies for authenticated
// clients by design. For a real (non-demo) connection this also revokes the
// grant at Google and unlinks the Google identity — Gmail and YouTube share
// a single Google OAuth grant (see connect-integration), so disconnecting
// either one tears down both rather than leaving one half-alive.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { revokeGoogleToken } from '../_shared/google.ts'

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let provider: string | undefined
  try {
    const body = await req.json()
    provider = body?.provider
  } catch {
    // fall through to validation below
  }
  if (provider !== 'gmail' && provider !== 'youtube') {
    return new Response(JSON.stringify({ error: 'provider must be "gmail" or "youtube"' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: userData, error: userError } = await callerClient.auth.getUser()
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  // integrations.user_id is the account id, not necessarily the caller's id.
  // Resolve which account the caller belongs to, and only let the account
  // owner disconnect it — connections aren't assigned to any other role in
  // the workspace's permission matrix.
  const { data: memberships, error: membershipError } = await adminClient
    .from('team_members')
    .select('account_id, role')
    .eq('user_id', userData.user.id)

  if (membershipError) {
    return new Response(JSON.stringify({ error: membershipError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const joinedMembership = memberships?.find((m) => m.account_id !== userData.user.id)
  const membership = joinedMembership ?? memberships?.find((m) => m.account_id === userData.user.id)

  if (!membership || membership.role !== 'owner') {
    return new Response(JSON.stringify({ error: 'Only the workspace owner can disconnect a connection.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data: rows, error: fetchError } = await adminClient
    .from('integrations')
    .select('id, provider, is_demo, access_token_secret_id, refresh_token_secret_id')
    .eq('user_id', membership.account_id)
    .in('provider', ['gmail', 'youtube'])

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const realRow = rows?.find((r) => !r.is_demo && (r.access_token_secret_id || r.refresh_token_secret_id))
  if (realRow) {
    const revokeTarget = realRow.refresh_token_secret_id ?? realRow.access_token_secret_id
    if (revokeTarget) {
      const { data: token } = await adminClient.rpc('vault_read_secret_for_integration', { p_id: revokeTarget })
      if (token) await revokeGoogleToken(token as string)
    }
    if (realRow.access_token_secret_id) {
      await adminClient.rpc('vault_delete_secret_for_integration', { p_id: realRow.access_token_secret_id })
    }
    if (realRow.refresh_token_secret_id && realRow.refresh_token_secret_id !== realRow.access_token_secret_id) {
      await adminClient.rpc('vault_delete_secret_for_integration', { p_id: realRow.refresh_token_secret_id })
    }
  }

  // Always check for a lingering Google identity, independent of whether a
  // real integrations row exists — connect-integration can fail after
  // linkIdentity has already succeeded at the Auth level (e.g. Google/
  // Supabase completing the link without a provider_token coming back), and
  // that leaves an identity linked with no integrations row at all.
  // linkIdentity permanently refuses to re-link an already-linked identity,
  // so if this cleanup only ran when realRow existed, that orphaned case
  // could never be un-stuck — there'd be no integrations row for a
  // "Disconnect" click to key off of, and Connect would fail forever with
  // "Identity is already linked". Best-effort: unlinking isn't exposed via
  // the admin SDK, only the GoTrue REST API directly.
  const { data: adminUser } = await adminClient.auth.admin.getUserById(membership.account_id)
  const googleIdentity = adminUser?.user?.identities?.find((i) => i.provider === 'google')
  if (googleIdentity) {
    await fetch(`${supabaseUrl}/auth/v1/admin/users/${membership.account_id}/identities/${googleIdentity.identity_id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey },
    }).catch(() => {})
  }

  const { error } = await adminClient
    .from('integrations')
    .delete()
    .eq('user_id', membership.account_id)
    .in('provider', ['gmail', 'youtube'])

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

// Reads public.integrations using the service role, so it never depends on (or is blocked
// by) the client-facing RLS policy on that table. Only non-sensitive columns are selected
// here — access/refresh token columns are never fetched, let alone returned, by construction.
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Verify the caller's JWT and resolve their user id server-side — never trust a
  // client-supplied user id.
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

  // integrations.user_id is really "which account this row belongs to" — the
  // account owner's own id, not necessarily the caller's id. A teammate
  // acting on someone else's account must see THAT account's connection
  // status, not their own (usually integration-less) solo account. Prefer
  // any joined team over the caller's own solo-owner account, matching the
  // account-resolution rule used elsewhere in the app.
  const { data: memberships, error: membershipError } = await adminClient
    .from('team_members')
    .select('account_id')
    .eq('user_id', userData.user.id)

  if (membershipError) {
    return new Response(JSON.stringify({ error: membershipError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const joinedAccount = memberships?.find((m) => m.account_id !== userData.user.id)
  const accountId = joinedAccount?.account_id ?? userData.user.id

  const { data, error } = await adminClient
    .from('integrations')
    .select('provider, expires_at, metadata, created_at')
    .eq('user_id', accountId)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const integrations = (data ?? []).map((row) => {
    const metadata = (row.metadata ?? {}) as Record<string, unknown>
    const notExpired = !row.expires_at || new Date(row.expires_at) > new Date()
    return {
      provider: row.provider as string,
      connected: notExpired,
      connectedAt: row.created_at as string,
      accountLabel: typeof metadata.email === 'string' ? metadata.email : null,
    }
  })

  return new Response(JSON.stringify({ integrations }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

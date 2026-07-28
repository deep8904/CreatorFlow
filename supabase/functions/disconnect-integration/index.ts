// Deletes a row from public.integrations on the caller's behalf using the service
// role, since the table has zero permissive RLS policies for authenticated clients
// by design (see the integrations RLS fix migration). This is the only sanctioned
// write path for that table until a real OAuth callback route exists.
import { createClient } from 'npm:@supabase/supabase-js@2'

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

  const { error } = await adminClient
    .from('integrations')
    .delete()
    .eq('user_id', membership.account_id)
    .eq('provider', provider)

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

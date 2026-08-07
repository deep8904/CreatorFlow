// Persists the Google OAuth tokens captured by app/auth/callback/route.ts
// right after linkIdentity completes. Tokens are only ever handled
// server-side (this function and fetch-youtube-data/fetch-gmail-deals) —
// the browser never sees them, and public.integrations itself has zero
// permissive RLS policies, so this service-role path is the only way in.
//
// One Google grant covers both Gmail and YouTube (Supabase allows exactly
// one linked identity per provider per user), so this writes two
// integrations rows — 'gmail' and 'youtube' — pointing at the same pair of
// Vault secrets, rather than trying to keep two independent grants in sync.
import { createClient } from 'npm:@supabase/supabase-js@2'

const DEFAULT_EXPIRY_SECONDS = 55 * 60 // conservative: Google access tokens are typically 3600s

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let accessToken: string | undefined | null
  let refreshToken: string | null | undefined
  let expiresIn: number | null | undefined
  try {
    const body = await req.json()
    accessToken = body?.accessToken
    refreshToken = body?.refreshToken ?? null
    expiresIn = body?.expiresIn ?? null
  } catch {
    // fall through to validation below
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

  // Google/Supabase can finish linkIdentity — the identity row exists,
  // auth.identities shows a real link — without ever handing back a
  // provider_token (seen live: a transient PKCE/timing gap). Since
  // linkIdentity permanently refuses to re-link an already-linked identity,
  // leaving that identity in place would strand the account: every future
  // "Connect" click would fail with "Identity is already linked" and there'd
  // be no integrations row for Disconnect to key off of. Self-heal instead —
  // unlink immediately so the next "Connect" click starts clean.
  if (!accessToken) {
    const googleIdentity = userData.user.identities?.find((i) => i.provider === 'google')
    if (googleIdentity) {
      await fetch(`${supabaseUrl}/auth/v1/admin/users/${userData.user.id}/identities/${googleIdentity.identity_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey },
      }).catch(() => {})
    }
    return new Response(
      JSON.stringify({ error: "Google didn't finish granting access. Please click Connect and try again." }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // Same account-resolution rule as every other integrations write: connect
  // on behalf of the account the caller belongs to (their own solo account,
  // or a joined team's account if they have one), not always themselves.
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
    return new Response(JSON.stringify({ error: 'Only the workspace owner can connect an integration.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const googleIdentity = userData.user.identities?.find((i) => i.provider === 'google')
  const email = typeof googleIdentity?.identity_data?.email === 'string' ? googleIdentity.identity_data.email : null

  // Was this a demo account before this connect? If so, the seeded
  // channel_stats_daily/channel_videos rows are fake data left over from
  // scripts/seed-demo-data.ts, not something a real connection should ever
  // display — get-integrations only gates the "(demo)" label on the
  // *integration* row's is_demo, so leaving stale demo rows in these tables
  // would show fabricated numbers as real with no disclaimer at all.
  const { data: priorYoutubeRow } = await adminClient
    .from('integrations')
    .select('is_demo')
    .eq('user_id', membership.account_id)
    .eq('provider', 'youtube')
    .maybeSingle()
  const wasDemo = priorYoutubeRow?.is_demo ?? false
  if (wasDemo) {
    await adminClient.from('channel_stats_daily').delete().eq('user_id', membership.account_id)
    await adminClient.from('channel_videos').delete().eq('user_id', membership.account_id)
  }

  const { data: accessSecretId, error: accessSecretError } = await adminClient.rpc('vault_create_secret_for_integration', {
    p_secret: accessToken,
    p_name: `integration:${membership.account_id}:google:access:${Date.now()}`,
  })
  if (accessSecretError) {
    return new Response(JSON.stringify({ error: accessSecretError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let refreshSecretId: string | null = null
  if (refreshToken) {
    const { data, error: refreshSecretError } = await adminClient.rpc('vault_create_secret_for_integration', {
      p_secret: refreshToken,
      p_name: `integration:${membership.account_id}:google:refresh:${Date.now()}`,
    })
    if (refreshSecretError) {
      return new Response(JSON.stringify({ error: refreshSecretError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    refreshSecretId = data
  }

  const expiresAt = new Date(Date.now() + (expiresIn ?? DEFAULT_EXPIRY_SECONDS) * 1000).toISOString()
  const scope = ['gmail.readonly', 'youtube.readonly']

  const rows = ['gmail', 'youtube'].map((provider) => ({
    user_id: membership.account_id,
    provider,
    access_token_secret_id: accessSecretId,
    refresh_token_secret_id: refreshSecretId,
    expires_at: expiresAt,
    scope,
    metadata: email ? { email } : {},
    is_demo: false,
    updated_at: new Date().toISOString(),
  }))

  const { error: upsertError } = await adminClient.from('integrations').upsert(rows, { onConflict: 'user_id,provider' })
  if (upsertError) {
    return new Response(JSON.stringify({ error: upsertError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true, hasRefreshToken: !!refreshToken }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

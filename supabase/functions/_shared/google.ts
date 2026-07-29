// Shared by every edge function that needs to call Google's APIs on a
// connected account's behalf (fetch-youtube-data, fetch-gmail-deals) or tear
// down a connection (disconnect-integration).
//
// Supabase does not auto-refresh provider tokens — CLAUDE.md flags this
// explicitly, and it's true: Session.provider_token/provider_refresh_token
// are handed back once at OAuth-exchange time and never touched again by
// supabase-js. Everything past that point is our own responsibility.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke'
const REFRESH_BUFFER_MS = 5 * 60 * 1000

export type IntegrationTokenRow = {
  access_token_secret_id: string | null
  refresh_token_secret_id: string | null
  expires_at: string | null
}

async function readSecret(adminClient: SupabaseClient, secretId: string): Promise<string | null> {
  const { data, error } = await adminClient.rpc('vault_read_secret_for_integration', { p_id: secretId })
  if (error) return null
  return (data as string | null) ?? null
}

/**
 * Returns a valid Google access token for an account, refreshing it first
 * if it's expired or within 5 minutes of expiring. Vault and expires_at are
 * updated in place when a refresh happens, so the next call (and
 * get-integrations' "connected" check) both see the new state.
 */
export async function getValidAccessToken(
  adminClient: SupabaseClient,
  accountId: string,
  row: IntegrationTokenRow,
): Promise<{ accessToken: string } | { error: string }> {
  if (!row.access_token_secret_id) return { error: 'No Google connection found for this account.' }

  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : 0
  const needsRefresh = expiresAt - Date.now() < REFRESH_BUFFER_MS

  if (!needsRefresh) {
    const accessToken = await readSecret(adminClient, row.access_token_secret_id)
    if (!accessToken) return { error: 'Could not read the stored access token.' }
    return { accessToken }
  }

  if (!row.refresh_token_secret_id) {
    return { error: 'This connection has expired and cannot refresh itself. Please reconnect Google in Settings.' }
  }

  const refreshToken = await readSecret(adminClient, row.refresh_token_secret_id)
  if (!refreshToken) return { error: 'Could not read the stored refresh token.' }

  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
  if (!clientId || !clientSecret) {
    return { error: 'GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are not set as edge function secrets.' }
  }

  const resp = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const json = await resp.json().catch(() => ({}))
  if (!resp.ok) {
    return { error: `Google token refresh failed: ${json.error_description ?? json.error ?? resp.statusText}` }
  }

  const newAccessToken = json.access_token as string
  const expiresIn = typeof json.expires_in === 'number' ? json.expires_in : 3600

  await adminClient.rpc('vault_update_secret_for_integration', {
    p_id: row.access_token_secret_id,
    p_secret: newAccessToken,
  })
  // Both provider rows share this token pair — keep them in sync.
  await adminClient
    .from('integrations')
    .update({ expires_at: new Date(Date.now() + expiresIn * 1000).toISOString() })
    .eq('user_id', accountId)
    .eq('access_token_secret_id', row.access_token_secret_id)

  return { accessToken: newAccessToken }
}

/** Best-effort revoke at Google — a failure here shouldn't block local cleanup. */
export async function revokeGoogleToken(token: string): Promise<void> {
  try {
    await fetch(`${GOOGLE_REVOKE_URL}?token=${encodeURIComponent(token)}`, { method: 'POST' })
  } catch {
    // Nothing more we can do — the local integrations rows and Vault
    // secrets still get deleted by the caller regardless.
  }
}

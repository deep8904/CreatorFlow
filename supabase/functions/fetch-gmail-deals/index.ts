// On-demand Gmail sponsorship-email detection for a connected (non-demo)
// account, feeding the "New sponsorship email → Create a deal" automation.
// Only runs anything if that automation exists and is enabled — this is a
// real side effect (creates real deals), so it's opt-in, not automatic.
//
// Keyword list intentionally duplicated from lib/integrations/gmailClassifier.ts
// rather than imported — Deno edge functions can't reach into the Next.js
// app's module tree, and every other edge function in this project is
// self-contained for the same reason.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { getValidAccessToken } from '../_shared/google.ts'

const DEAL_KEYWORDS = ['brand deal', 'sponsorship', 'paid partnership', 'partnership', 'campaign', 'sponsor', 'endorsement', 'collab']

function classifyGmailDeal(subject: string, body: string): boolean {
  const haystack = `${subject} ${body}`.toLowerCase()
  return DEAL_KEYWORDS.some((keyword) => haystack.includes(keyword))
}

function decodeHeaderValue(raw: string): { name: string | null; email: string | null } {
  // "Priya Nair <priya@brand.com>" or just "priya@brand.com"
  const match = /^(.*?)\s*<([^>]+)>\s*$/.exec(raw.trim())
  if (match) return { name: match[1].replace(/^"|"$/g, '').trim() || null, email: match[2].trim() }
  return { name: null, email: raw.trim() || null }
}

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

  const { data: automation } = await adminClient
    .from('automations')
    .select('enabled')
    .eq('user_id', accountId)
    .eq('trigger_type', 'gmail.sponsorship_email_detected')
    .maybeSingle()
  if (!automation?.enabled) {
    return new Response(
      JSON.stringify({ success: true, skipped: true, reason: 'The "New sponsorship email → Create a deal" automation is off.' }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { data: row, error: rowError } = await adminClient
    .from('integrations')
    .select('is_demo, access_token_secret_id, refresh_token_secret_id, expires_at')
    .eq('user_id', accountId)
    .eq('provider', 'gmail')
    .maybeSingle()
  if (rowError) {
    return new Response(JSON.stringify({ error: rowError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (!row || row.is_demo) {
    return new Response(JSON.stringify({ error: 'No real Gmail connection for this account.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const tokenResult = await getValidAccessToken(adminClient, accountId, row)
  if ('error' in tokenResult) {
    return new Response(JSON.stringify({ error: tokenResult.error }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const authHeaders = { Authorization: `Bearer ${tokenResult.accessToken}` }

  // Pre-filter at the Gmail API level (keyword OR, last 30 days) to keep
  // quota and payload small; classifyGmailDeal still re-checks every
  // candidate itself rather than trusting Gmail's own search ranking.
  const query = `(${DEAL_KEYWORDS.map((k) => (k.includes(' ') ? `"${k}"` : k)).join(' OR ')}) newer_than:30d`
  const listResp = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25&q=${encodeURIComponent(query)}`,
    { headers: authHeaders },
  )
  const listJson = await listResp.json()
  if (!listResp.ok) {
    return new Response(JSON.stringify({ error: listJson.error?.message ?? 'Gmail messages.list failed.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const messageRefs = (listJson.messages ?? []) as { id: string; threadId: string }[]

  let dealsCreated = 0
  const errors: string[] = []

  for (const ref of messageRefs) {
    const msgResp = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${ref.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
      { headers: authHeaders },
    )
    if (!msgResp.ok) {
      errors.push(`Could not read message ${ref.id}.`)
      continue
    }
    const msg = await msgResp.json()
    const headers = (msg.payload?.headers ?? []) as { name: string; value: string }[]
    const subject = headers.find((h) => h.name === 'Subject')?.value ?? ''
    const from = headers.find((h) => h.name === 'From')?.value ?? ''
    const snippet = (msg.snippet as string | undefined) ?? ''

    if (!classifyGmailDeal(subject, snippet)) continue

    const { name: contactName, email: contactEmail } = decodeHeaderValue(from)
    const brandName = contactName ?? contactEmail?.split('@')[1]?.split('.')[0] ?? 'Unknown brand'

    const { error: insertError, data: inserted } = await adminClient
      .from('deals')
      .upsert(
        {
          user_id: accountId,
          brand_name: brandName,
          contact_name: contactName,
          contact_email: contactEmail,
          status: 'inbound',
          email_thread_id: ref.threadId,
          notes: `Auto-detected from Gmail: "${subject}"`,
        },
        { onConflict: 'user_id,email_thread_id', ignoreDuplicates: true },
      )
      .select('id')
    if (insertError) {
      errors.push(insertError.message)
      continue
    }
    if (inserted && inserted.length > 0) dealsCreated += 1
  }

  return new Response(
    JSON.stringify({ success: true, messagesScanned: messageRefs.length, dealsCreated, errors: errors.slice(0, 5) }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})

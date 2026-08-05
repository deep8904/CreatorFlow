// Stage 3.3: the genuinely-scheduled half of the Automations engine. Called
// by pg_cron (via pg_net's http_post) on a real cron schedule, never by an
// end user directly. The platform's verify_jwt already rejects anything
// unsigned, but it accepts ANY valid project JWT (a regular user's own
// access token included) — this endpoint reads/writes every account's
// data, so it additionally decodes the token's own `role` claim and
// requires exactly 'service_role', rather than string-comparing against
// Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') (that env var turned out to be
// in Supabase's newer sb_secret_ key format at runtime, while the Vault
// secret this project's cron job authenticates with is deliberately the
// legacy JWT format — comparing the two literal strings would never match).
//
// Two jobs share this one function (via the `job` field in the request
// body) rather than two separate functions, since they're both "iterate
// every account with this automation enabled, write one activity row per
// account" — the same shape, different query.
//
// Detection logic is intentionally re-implemented here rather than imported
// from lib/dealUrgency.ts — Deno edge functions can't reach into the
// Next.js app's module tree, same reasoning as fetch-gmail-deals duplicating
// lib/integrations/gmailClassifier.ts's keyword list.
import { createClient } from 'npm:@supabase/supabase-js@2'

type Deal = {
  id: string
  user_id: string
  brand_name: string | null
  status: string
  due_date: string | null
  invoiced_at: string | null
  paid_at: string | null
  updated_at: string
}

type Draft = {
  id: string
  user_id: string
  title: string
  due_date: string | null
}

function todayUTC(): number {
  const now = new Date()
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
}

function isDealOverdueInvoice(deal: Deal): boolean {
  if (!deal.invoiced_at || deal.paid_at || !deal.due_date) return false
  return new Date(deal.due_date + 'T00:00:00Z').getTime() < todayUTC()
}

const PRE_CLOSE_STAGES = new Set(['inbound', 'negotiating'])

function isDealStale(deal: Deal, staleDays = 5): boolean {
  if (!PRE_CLOSE_STAGES.has(deal.status)) return false
  const daysSinceUpdate = (Date.now() - new Date(deal.updated_at).getTime()) / 86_400_000
  return daysSinceUpdate >= staleDays
}

function isDueThisWeek(dueDate: string | null): boolean {
  if (!dueDate) return false
  const days = Math.round((new Date(dueDate + 'T00:00:00Z').getTime() - todayUTC()) / 86_400_000)
  return days >= 0 && days <= 7
}

async function runFollowUpCheck(admin: ReturnType<typeof createClient>) {
  const { data: automations, error } = await admin
    .from('automations')
    .select('id, user_id')
    .eq('trigger_type', 'deals.needs_follow_up')
    .eq('enabled', true)
  if (error) throw error

  let processed = 0
  for (const automation of automations ?? []) {
    const { data: deals } = await admin
      .from('deals')
      .select('id, user_id, brand_name, status, due_date, invoiced_at, paid_at, updated_at')
      .eq('user_id', automation.user_id)
    const flagged = (deals ?? []).filter((d: Deal) => isDealOverdueInvoice(d) || isDealStale(d))

    const summary =
      flagged.length === 0
        ? 'Checked — nothing needs follow-up right now.'
        : `Checked — ${flagged.length} deal${flagged.length === 1 ? '' : 's'} need${flagged.length === 1 ? 's' : ''} follow-up: ${flagged
            .map((d: Deal) => d.brand_name ?? 'Untitled deal')
            .slice(0, 5)
            .join(', ')}${flagged.length > 5 ? ', …' : ''}.`

    await admin.from('automation_activity').insert({
      automation_id: automation.id,
      user_id: automation.user_id,
      summary,
      details: { flagged_deal_ids: flagged.map((d: Deal) => d.id) },
    })
    processed += 1
  }
  return processed
}

async function runWeeklyDigest(admin: ReturnType<typeof createClient>) {
  const { data: automations, error } = await admin
    .from('automations')
    .select('id, user_id')
    .eq('trigger_type', 'schedule.weekly_digest')
    .eq('enabled', true)
  if (error) throw error

  let processed = 0
  for (const automation of automations ?? []) {
    const [{ data: deals }, { data: drafts }] = await Promise.all([
      admin.from('deals').select('id, user_id, brand_name, status, due_date, invoiced_at, paid_at, updated_at').eq('user_id', automation.user_id),
      admin.from('drafts').select('id, user_id, title, due_date').eq('user_id', automation.user_id),
    ])
    const dealsDue = (deals ?? []).filter((d: Deal) => isDueThisWeek(d.due_date) && d.status !== 'paid' && d.status !== 'lost')
    const draftsDue = (drafts ?? []).filter((d: Draft) => isDueThisWeek(d.due_date))

    const parts: string[] = []
    if (dealsDue.length > 0) parts.push(`${dealsDue.length} deal${dealsDue.length === 1 ? '' : 's'} due`)
    if (draftsDue.length > 0) parts.push(`${draftsDue.length} draft${draftsDue.length === 1 ? '' : 's'} due`)
    const summary = parts.length === 0 ? 'This week: nothing due.' : `This week: ${parts.join(', ')}.`

    await admin.from('automation_activity').insert({
      automation_id: automation.id,
      user_id: automation.user_id,
      summary,
      details: { deal_ids: dealsDue.map((d: Deal) => d.id), draft_ids: draftsDue.map((d: Draft) => d.id) },
    })
    processed += 1
  }
  return processed
}

function isServiceRoleJwt(authHeader: string): boolean {
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const parts = token.split('.')
  if (parts.length !== 3) return false
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.role === 'service_role'
  } catch {
    return false
  }
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!isServiceRoleJwt(authHeader)) {
    return new Response(JSON.stringify({ error: 'Unauthorized — this endpoint is for the scheduler only.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  let job: string | undefined
  try {
    const body = await req.json()
    job = body?.job
  } catch {
    return new Response(JSON.stringify({ error: 'Expected a JSON body with a "job" field.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, serviceRoleKey)

  try {
    if (job === 'follow_up') {
      const processed = await runFollowUpCheck(admin)
      return new Response(JSON.stringify({ success: true, job, accountsProcessed: processed }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    if (job === 'digest') {
      const processed = await runWeeklyDigest(admin)
      return new Response(JSON.stringify({ success: true, job, accountsProcessed: processed }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ error: `Unknown job "${job}". Expected "follow_up" or "digest".` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

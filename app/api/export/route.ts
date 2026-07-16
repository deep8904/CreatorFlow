import { NextResponse } from 'next/server'
import { createSupabaseServerClient, getAuthenticatedUser } from '@/lib/supabase/server'

// Every table queried here already has an owner-only RLS policy, so this reads
// through the caller's own session — no service role needed.
export async function GET() {
  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const [profile, deals, ideas, drafts, automations] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('deals').select('*').eq('user_id', user.id),
    supabase.from('ideas').select('*').eq('user_id', user.id),
    supabase.from('drafts').select('*').eq('user_id', user.id),
    supabase.from('automations').select('*').eq('user_id', user.id),
  ])

  const payload = {
    exported_at: new Date().toISOString(),
    profile: profile.data ?? null,
    deals: deals.data ?? [],
    ideas: ideas.data ?? [],
    drafts: drafts.data ?? [],
    automations: automations.data ?? [],
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="creatorflow-export.json"',
    },
  })
}

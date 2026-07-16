'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getAuthenticatedUser } from './server'
import type { Deal } from './types'

export async function createIdea(title: string) {
  const trimmed = title.trim()
  if (!trimmed) return

  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return

  await supabase.from('ideas').insert({ user_id: user.id, title: trimmed, status: 'new' })
  revalidatePath('/ideas')
  revalidatePath('/dashboard')
}

export async function toggleAutomation(id: string, enabled: boolean) {
  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return

  await supabase.from('automations').update({ enabled }).eq('id', id).eq('user_id', user.id)
  revalidatePath('/automations')
}

export async function updateDraftContent(id: string, body: string) {
  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return

  await supabase.from('drafts').update({ body }).eq('id', id).eq('user_id', user.id)
  revalidatePath('/drafts')
}

export async function createDraft(title = 'Untitled draft', ideaId: string | null = null) {
  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return null

  const { data } = await supabase
    .from('drafts')
    .insert({ user_id: user.id, idea_id: ideaId, title, body: '' })
    .select('id')
    .single()
  revalidatePath('/drafts')
  return (data?.id as string | undefined) ?? null
}

export async function createDraftFromIdea(ideaId: string, ideaTitle: string) {
  const id = await createDraft(ideaTitle, ideaId)
  revalidatePath('/ideas')
  return id
}

export async function updateDealStage(id: string, stage: Deal['status']) {
  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return

  await supabase.from('deals').update({ status: stage }).eq('id', id).eq('user_id', user.id)
  revalidatePath('/deals')
  revalidatePath('/dashboard')
}

export type DealFormInput = {
  brand_name: string
  contact_name?: string
  rate_amount_cents?: number | null
  deliverables?: string
  notes?: string
  due_date?: string | null
}

export async function createDeal(input: DealFormInput) {
  const brandName = input.brand_name.trim()
  if (!brandName) return

  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return

  await supabase.from('deals').insert({
    user_id: user.id,
    brand_name: brandName,
    contact_name: input.contact_name?.trim() || null,
    rate_amount_cents: input.rate_amount_cents ?? null,
    deliverables: input.deliverables?.trim() || null,
    notes: input.notes?.trim() || null,
    due_date: input.due_date || null,
    status: 'inbound',
  })
  revalidatePath('/deals')
  revalidatePath('/dashboard')
}

export async function updateDeal(id: string, input: DealFormInput) {
  const brandName = input.brand_name.trim()
  if (!brandName) return

  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return

  await supabase
    .from('deals')
    .update({
      brand_name: brandName,
      contact_name: input.contact_name?.trim() || null,
      rate_amount_cents: input.rate_amount_cents ?? null,
      deliverables: input.deliverables?.trim() || null,
      notes: input.notes?.trim() || null,
      due_date: input.due_date || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
  revalidatePath('/deals')
  revalidatePath('/dashboard')
}

export async function updateProfile(fullName: string) {
  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return

  await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', user.id)
  revalidatePath('/settings')
}

export async function disconnectIntegration(provider: 'gmail' | 'youtube'): Promise<ActionResult> {
  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return { error: 'You must be signed in.' }

  const { data, error } = await supabase.functions.invoke('disconnect-integration', { body: { provider } })
  if (error || !data?.success) return { error: 'Could not disconnect. Please try again.' }

  revalidatePath('/settings')
  revalidatePath('/analytics')
  revalidatePath('/deals')
  revalidatePath('/dashboard')
  return {}
}

export async function deleteAccount(): Promise<ActionResult> {
  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return { error: 'You must be signed in.' }

  const { data, error } = await supabase.functions.invoke('delete-account')
  if (error || !data?.success) return { error: 'Could not delete the account. Please try again.' }

  await supabase.auth.signOut()
  return {}
}

type ActionResult = { error?: string }

export async function sendTeamInvite(email: string, role: 'owner' | 'member'): Promise<ActionResult> {
  const trimmedEmail = email.trim().toLowerCase()
  if (!trimmedEmail) return { error: 'Enter an email address.' }

  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return { error: 'You must be signed in to invite a collaborator.' }

  const { data: ownerRow } = await supabase
    .from('team_members')
    .select('account_id')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .maybeSingle()

  if (!ownerRow) return { error: 'Only the account owner can invite a collaborator.' }
  const accountId = ownerRow.account_id as string

  // Free plan: owner + at most one collaborator. Check both an existing member and an
  // existing pending invite before attempting the insert, so the error is clear rather
  // than a raw unique-constraint violation.
  const [{ count: memberCount }, { data: existingInvite }] = await Promise.all([
    supabase
      .from('team_members')
      .select('id', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .eq('role', 'member'),
    supabase
      .from('team_invites')
      .select('id')
      .eq('account_id', accountId)
      .eq('status', 'pending')
      .maybeSingle(),
  ])

  if ((memberCount ?? 0) > 0) {
    return { error: 'You already have a collaborator. Remove them before inviting someone new.' }
  }
  if (existingInvite) {
    return { error: 'There is already a pending invite. Revoke it before sending another.' }
  }

  const { error } = await supabase.from('team_invites').insert({
    account_id: accountId,
    invited_email: trimmedEmail,
    role,
    status: 'pending',
  })

  if (error) {
    // Backstop for a race against the partial unique index — the checks above should
    // normally catch this first.
    return { error: 'Could not send the invite. Please try again.' }
  }

  revalidatePath('/team')
  return {}
}

export async function revokeInvite(id: string): Promise<ActionResult> {
  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return { error: 'You must be signed in.' }

  const { error } = await supabase.from('team_invites').update({ status: 'revoked' }).eq('id', id)
  if (error) return { error: 'Could not revoke the invite.' }

  revalidatePath('/team')
  return {}
}

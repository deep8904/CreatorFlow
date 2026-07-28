'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getAuthenticatedUser } from './server'
import { getCurrentAccount } from './queries'
import type { Deal, Idea, Role } from './types'
import { ASSIGNABLE_ROLES } from '@/lib/roles'

export type ActionResult = { error?: string }

export async function createIdea(title: string, notes?: string, tags?: string[]): Promise<ActionResult> {
  const trimmed = title.trim()
  if (!trimmed) return { error: 'Give the idea a title.' }

  const supabase = await createSupabaseServerClient()
  const account = await getCurrentAccount()
  if (!account || !supabase) return { error: 'You must be signed in.' }

  const { error } = await supabase.from('ideas').insert({
    user_id: account.accountId,
    title: trimmed,
    notes: notes?.trim() || null,
    tags: tags ?? [],
    status: 'new',
  })
  if (error) return { error: 'Could not save the idea. Please try again.' }

  revalidatePath('/ideas')
  revalidatePath('/dashboard')
  return {}
}

export type IdeaFormInput = {
  title: string
  notes?: string
  tags?: string[]
  status: Idea['status']
}

export async function updateIdea(id: string, input: IdeaFormInput): Promise<ActionResult> {
  const title = input.title.trim()
  if (!title) return { error: 'Give the idea a title.' }

  const supabase = await createSupabaseServerClient()
  const account = await getCurrentAccount()
  if (!account || !supabase) return { error: 'You must be signed in.' }

  const { error } = await supabase
    .from('ideas')
    .update({
      title,
      notes: input.notes?.trim() || null,
      tags: input.tags ?? [],
      status: input.status,
    })
    .eq('id', id)
    .eq('user_id', account.accountId)
  if (error) return { error: 'Could not save the idea. Please try again.' }

  revalidatePath('/ideas')
  revalidatePath('/dashboard')
  return {}
}

export async function deleteIdea(id: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const account = await getCurrentAccount()
  if (!account || !supabase) return { error: 'You must be signed in.' }

  const { error } = await supabase.from('ideas').delete().eq('id', id).eq('user_id', account.accountId)
  if (error) return { error: 'Could not delete the idea. Please try again.' }

  revalidatePath('/ideas')
  revalidatePath('/dashboard')
  return {}
}

export async function toggleAutomation(id: string, enabled: boolean): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const account = await getCurrentAccount()
  if (!account || !supabase) return { error: 'You must be signed in.' }

  const { error } = await supabase.from('automations').update({ enabled }).eq('id', id).eq('user_id', account.accountId)
  if (error) return { error: 'Could not update the automation.' }

  revalidatePath('/automations')
  return {}
}

export async function updateDraftContent(id: string, body: string, title?: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const account = await getCurrentAccount()
  if (!account || !supabase) return { error: 'You must be signed in.' }

  const trimmedTitle = title?.trim()
  if (title !== undefined && !trimmedTitle) return { error: 'Give the draft a title.' }

  const { error } = await supabase
    .from('drafts')
    .update(trimmedTitle ? { body, title: trimmedTitle } : { body })
    .eq('id', id)
    .eq('user_id', account.accountId)
  if (error) return { error: 'Could not save the draft. Please try again.' }

  revalidatePath('/drafts')
  return {}
}

export async function deleteDraft(id: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const account = await getCurrentAccount()
  if (!account || !supabase) return { error: 'You must be signed in.' }

  const { error } = await supabase.from('drafts').delete().eq('id', id).eq('user_id', account.accountId)
  if (error) return { error: 'Could not delete the draft. Please try again.' }

  revalidatePath('/drafts')
  return {}
}

export async function createDraft(
  title = 'Untitled draft',
  ideaId: string | null = null,
): Promise<{ id: string | null; error?: string }> {
  const supabase = await createSupabaseServerClient()
  const account = await getCurrentAccount()
  if (!account || !supabase) return { id: null, error: 'You must be signed in.' }

  const { data, error } = await supabase
    .from('drafts')
    .insert({ user_id: account.accountId, idea_id: ideaId, title, body: '' })
    .select('id')
    .single()
  if (error || !data) return { id: null, error: 'Could not create the draft. Please try again.' }

  revalidatePath('/drafts')
  return { id: data.id as string }
}

export async function createDraftFromIdea(ideaId: string, ideaTitle: string) {
  const result = await createDraft(ideaTitle, ideaId)
  revalidatePath('/ideas')
  return result
}

/**
 * `fromStatus` comes from the caller rather than a fresh select — the client
 * already has the deal in hand when it initiates a move, so this avoids an
 * extra round trip just to look up what it already knows.
 */
export async function updateDealStage(
  id: string,
  fromStatus: Deal['status'],
  toStatus: Deal['status']
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const account = await getCurrentAccount()
  if (!account || !supabase) return { error: 'You must be signed in.' }

  const update: { status: Deal['status']; paid_at?: string } = { status: toStatus }
  if (toStatus === 'paid') update.paid_at = new Date().toISOString().slice(0, 10)

  const { error } = await supabase.from('deals').update(update).eq('id', id).eq('user_id', account.accountId)
  if (error) return { error: 'Could not move the deal. Please try again.' }

  // Best-effort — a failed history insert shouldn't roll back or fail a
  // stage move the user already saw succeed.
  await supabase
    .from('deal_stage_history')
    .insert({ deal_id: id, user_id: account.accountId, from_status: fromStatus, to_status: toStatus })

  revalidatePath('/deals')
  revalidatePath('/dashboard')
  return {}
}

export async function markInvoiceSent(id: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const account = await getCurrentAccount()
  if (!account || !supabase) return { error: 'You must be signed in.' }

  const { error } = await supabase
    .from('deals')
    .update({ invoiced_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', account.accountId)
  if (error) return { error: 'Could not mark the invoice as sent. Please try again.' }

  revalidatePath('/deals')
  return {}
}

export type DealFormInput = {
  brand_name: string
  contact_name?: string
  rate_amount_cents?: number | null
  deliverables?: string
  notes?: string
  due_date?: string | null
}

export async function createDeal(input: DealFormInput): Promise<ActionResult> {
  const brandName = input.brand_name.trim()
  if (!brandName) return { error: 'Give the deal a brand name.' }

  const supabase = await createSupabaseServerClient()
  const account = await getCurrentAccount()
  if (!account || !supabase) return { error: 'You must be signed in.' }

  const { error } = await supabase.from('deals').insert({
    user_id: account.accountId,
    brand_name: brandName,
    contact_name: input.contact_name?.trim() || null,
    rate_amount_cents: input.rate_amount_cents ?? null,
    deliverables: input.deliverables?.trim() || null,
    notes: input.notes?.trim() || null,
    due_date: input.due_date || null,
    status: 'inbound',
  })
  if (error) return { error: 'Could not save the deal. Please try again.' }

  revalidatePath('/deals')
  revalidatePath('/dashboard')
  return {}
}

export async function updateDeal(id: string, input: DealFormInput): Promise<ActionResult> {
  const brandName = input.brand_name.trim()
  if (!brandName) return { error: 'Give the deal a brand name.' }

  const supabase = await createSupabaseServerClient()
  const account = await getCurrentAccount()
  if (!account || !supabase) return { error: 'You must be signed in.' }

  const { error } = await supabase
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
    .eq('user_id', account.accountId)
  if (error) return { error: 'Could not save the deal. Please try again.' }

  revalidatePath('/deals')
  revalidatePath('/dashboard')
  return {}
}

export async function deleteDeal(id: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const account = await getCurrentAccount()
  if (!account || !supabase) return { error: 'You must be signed in.' }

  const { error } = await supabase.from('deals').delete().eq('id', id).eq('user_id', account.accountId)
  if (error) return { error: 'Could not delete the deal. Please try again.' }

  revalidatePath('/deals')
  revalidatePath('/dashboard')
  return {}
}

export async function toggleDealPriority(id: string, isPriority: boolean): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const account = await getCurrentAccount()
  if (!account || !supabase) return { error: 'You must be signed in.' }

  const { error } = await supabase
    .from('deals')
    .update({ is_priority: isPriority })
    .eq('id', id)
    .eq('user_id', account.accountId)
  if (error) return { error: 'Could not update the deal. Please try again.' }

  revalidatePath('/deals')
  return {}
}

export async function bulkUpdateDealStage(ids: string[], toStatus: Deal['status']): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const account = await getCurrentAccount()
  if (!account || !supabase) return { error: 'You must be signed in.' }
  if (ids.length === 0) return {}

  const update: { status: Deal['status']; paid_at?: string } = { status: toStatus }
  if (toStatus === 'paid') update.paid_at = new Date().toISOString().slice(0, 10)

  const { error } = await supabase.from('deals').update(update).in('id', ids).eq('user_id', account.accountId)
  if (error) return { error: 'Could not move those deals. Please try again.' }

  revalidatePath('/deals')
  revalidatePath('/dashboard')
  return {}
}

export async function bulkDeleteDeals(ids: string[]): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  const account = await getCurrentAccount()
  if (!account || !supabase) return { error: 'You must be signed in.' }
  if (ids.length === 0) return {}

  const { error } = await supabase.from('deals').delete().in('id', ids).eq('user_id', account.accountId)
  if (error) return { error: 'Could not delete those deals. Please try again.' }

  revalidatePath('/deals')
  revalidatePath('/dashboard')
  return {}
}

export async function completeOnboarding(): Promise<ActionResult> {
  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return { error: 'You must be signed in.' }

  const { error } = await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)
  if (error) return { error: 'Could not save. Please try again.' }

  return {}
}

export async function updateProfile(fullName: string): Promise<ActionResult> {
  const trimmed = fullName.trim()
  if (!trimmed) return { error: 'Your name can’t be empty.' }

  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return { error: 'You must be signed in.' }

  const { error } = await supabase.from('profiles').update({ full_name: trimmed }).eq('id', user.id)
  if (error) return { error: 'Could not save your changes. Please try again.' }

  revalidatePath('/settings')
  return {}
}

export async function updateWorkspaceName(name: string): Promise<ActionResult> {
  const trimmed = name.trim()
  if (!trimmed) return { error: "Your workspace needs a name." }

  const supabase = await createSupabaseServerClient()
  const account = await getCurrentAccount()
  if (!account || !supabase) return { error: 'You must be signed in.' }
  if (account.role !== 'owner') return { error: 'Only the workspace owner can rename it.' }

  // RLS ("Owner updates workspace") backstops the role check above.
  const { error } = await supabase
    .from('accounts')
    .update({ workspace_name: trimmed })
    .eq('id', account.accountId)
  if (error) return { error: 'Could not save your changes. Please try again.' }

  revalidatePath('/settings')
  revalidatePath('/team')
  revalidatePath('/', 'layout')
  return {}
}

export async function updateNotifyDealReminders(enabled: boolean): Promise<ActionResult> {
  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return { error: 'You must be signed in.' }

  const { error } = await supabase.from('profiles').update({ notify_deal_reminders: enabled }).eq('id', user.id)
  if (error) return { error: 'Could not save your changes. Please try again.' }

  revalidatePath('/settings')
  revalidatePath('/', 'layout')
  return {}
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

export async function sendTeamInvite(email: string, role: Role): Promise<ActionResult> {
  const trimmedEmail = email.trim().toLowerCase()
  if (!trimmedEmail) return { error: 'Enter an email address.' }
  if (!ASSIGNABLE_ROLES.includes(role)) {
    return { error: 'Ownership can only change hands by transferring an existing member — invite them as a role first.' }
  }

  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return { error: 'You must be signed in to invite a collaborator.' }

  const { data: ownerRow, error: ownerLookupError } = await supabase
    .from('team_members')
    .select('account_id')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .maybeSingle()

  if (ownerLookupError) return { error: 'Could not send the invite. Please try again.' }
  if (!ownerRow) return { error: 'Only the account owner can invite a collaborator.' }
  const accountId = ownerRow.account_id as string

  // No seat cap and no cap on concurrent pending invites — just guard against
  // sending a second invite to an email that already has one pending.
  const { data: existingInvites, error: existingInvitesError } = await supabase
    .from('team_invites')
    .select('id')
    .eq('account_id', accountId)
    .eq('status', 'pending')
    .eq('invited_email', trimmedEmail)
    .limit(1)

  if (existingInvitesError) return { error: 'Could not send the invite. Please try again.' }
  if (existingInvites && existingInvites.length > 0) {
    return { error: 'There is already a pending invite for that email.' }
  }

  const { error } = await supabase.from('team_invites').insert({
    account_id: accountId,
    invited_email: trimmedEmail,
    role,
    status: 'pending',
  })

  if (error) return { error: 'Could not send the invite. Please try again.' }

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

export async function removeMember(memberId: string): Promise<ActionResult> {
  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return { error: 'You must be signed in.' }

  // RLS backstops this too ("Owner removes non-owner team members", role <> 'owner'),
  // but the friendlier message only shows up if we check it here first.
  const { error } = await supabase.from('team_members').delete().eq('id', memberId).neq('role', 'owner')
  if (error) return { error: 'Could not remove the collaborator. Please try again.' }

  revalidatePath('/team')
  return {}
}

export async function updateMemberRole(memberId: string, role: Role): Promise<ActionResult> {
  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return { error: 'You must be signed in.' }

  const { data: target, error: targetError } = await supabase
    .from('team_members')
    .select('user_id')
    .eq('id', memberId)
    .maybeSingle()
  if (targetError) return { error: 'Could not update their role. Please try again.' }
  if (target?.user_id === user.id) return { error: 'You can’t change your own role.' }

  // Promoting to owner is really a transfer — the account can only have one
  // owner (enforced by team_members_one_owner_per_account), so the current
  // owner has to be demoted in the same transaction. A plain UPDATE here
  // always fails that constraint; the RPC does both rows atomically.
  if (role === 'owner') {
    const { data, error } = await supabase.rpc('transfer_account_ownership', { p_new_owner_member_id: memberId })
    if (error || !data?.success) return { error: data?.error ?? 'Could not transfer ownership. Please try again.' }
    revalidatePath('/team')
    return {}
  }

  const { error } = await supabase.from('team_members').update({ role }).eq('id', memberId)
  if (error) return { error: 'Could not update their role. Please try again.' }

  revalidatePath('/team')
  return {}
}

export async function acceptTeamInvite(id: string): Promise<ActionResult> {
  const { user } = await getAuthenticatedUser()
  const supabase = await createSupabaseServerClient()
  if (!user || !supabase) return { error: 'You must be signed in.' }

  const { data, error } = await supabase.rpc('accept_team_invite', { p_invite_id: id })
  if (error || !data?.success) return { error: data?.error ?? 'Could not accept the invite. Please try again.' }

  revalidatePath('/team')
  return {}
}

'use client'

import { useState } from 'react'
import { sendTeamInvite, revokeInvite, removeMember, updateMemberRole } from '@/lib/supabase/actions'
import type { TeamData } from '@/lib/supabase/queries'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/lib/toast'

export default function TeamBoard({ team }: { team: TeamData | null }) {
  const toast = useToast()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'Member' | 'Owner'>('Member')
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const members = team?.members ?? []
  const pendingInvite = team?.pendingInvite ?? null
  const hasCollaborator = members.some((m) => m.role === 'member') || !!pendingInvite

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return
    if (inviteRole === 'Owner' && !window.confirm(
      `Grant ${inviteEmail.trim()} full Owner access, including billing and team management? This can’t be undone by revoking the invite once they’ve accepted.`
    )) return
    setIsBusy(true)
    setError(null)
    const result = await sendTeamInvite(inviteEmail, inviteRole === 'Owner' ? 'owner' : 'member')
    setIsBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setInviteEmail('')
  }

  const cancelInvite = async () => {
    if (!pendingInvite) return
    setIsBusy(true)
    const result = await revokeInvite(pendingInvite.id)
    setIsBusy(false)
    if (result.error) toast.error(result.error)
  }

  const changeRole = async (memberId: string, name: string, role: 'Member' | 'Owner') => {
    // An account has exactly one owner — promoting someone else to Owner
    // transfers it away from you, the opposite of "without giving up
    // control." Confirm before doing something that surprising.
    if (role === 'Owner' && !window.confirm(
      `Make ${name} the account owner? You'll become a Member and lose access to billing and team management — they'll have full control instead.`
    )) return
    setIsBusy(true)
    const result = await updateMemberRole(memberId, role === 'Owner' ? 'owner' : 'member')
    setIsBusy(false)
    if (result.error) toast.error(result.error)
  }

  const remove = async (memberId: string, name: string) => {
    if (!window.confirm(`Remove ${name} from your team?`)) return
    setIsBusy(true)
    const result = await removeMember(memberId)
    setIsBusy(false)
    if (result.error) toast.error(result.error)
  }

  return (
    <main className="flex-1 overflow-y-auto bg-linen">
      <div className="app-container-narrow">
      <div className="mb-8">
        <h1 className="text-app-h1 text-carbon">Team</h1>
        <p className="text-[12.5px] text-ash mt-0.5">Bring in a collaborator without giving up control.</p>
      </div>

      {/* Members list */}
      <Card variant="subtle" padding="none" className="overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-fog">
          <h2 className="text-[14px] font-semibold text-carbon">Members</h2>
        </div>

        <div className="divide-y divide-fog">
          {members.map((m) => {
            const name = m.profile?.full_name ?? 'You'
            const manageable = team?.isOwner && m.role === 'member'
            return (
              <div key={m.id} className="flex items-center gap-4 px-5 py-4">
                <Avatar name={name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-carbon">{name}</p>
                </div>
                {manageable ? (
                  <select
                    value={m.role === 'owner' ? 'Owner' : 'Member'}
                    onChange={(e) => changeRole(m.id, name, e.target.value as 'Member' | 'Owner')}
                    disabled={isBusy}
                    className="font-label text-[11px] font-semibold text-graphite bg-linen px-2.5 py-1.5 rounded-full uppercase tracking-widest outline-none focus:border-lavender/60 border border-transparent disabled:opacity-50"
                  >
                    <option value="Member">Member</option>
                    <option value="Owner">Owner</option>
                  </select>
                ) : (
                  <span className="font-label text-[10px] font-semibold text-graphite bg-linen px-2.5 py-1 rounded-full uppercase tracking-widest">
                    {m.role}
                  </span>
                )}
                {manageable && (
                  <button
                    onClick={() => remove(m.id, name)}
                    disabled={isBusy}
                    className="text-[12px] font-medium text-ash hover:text-carbon transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            )
          })}

          {pendingInvite && (
            <div className="flex items-center gap-4 px-5 py-4">
              <Avatar name={pendingInvite.invited_email} size="sm" tone="neutral" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-carbon">{pendingInvite.invited_email}</p>
              </div>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-linen text-graphite border border-fog">
                Invited — waiting for them to accept
              </span>
              {team?.isOwner && (
                <button
                  onClick={cancelInvite}
                  disabled={isBusy}
                  className="text-[12px] font-medium text-ash hover:text-carbon transition-colors disabled:opacity-50"
                >
                  Revoke
                </button>
              )}
            </div>
          )}
        </div>

        {!hasCollaborator && (
          <div className="px-5 py-8 text-center flex flex-col items-center gap-2 border-t border-fog">
            <p className="text-[14px] font-medium text-carbon">It&apos;s just you right now.</p>
            <p className="text-[13px] text-graphite">Invite a collaborator to help manage deals and automations.</p>
          </div>
        )}
      </Card>

      {/* Invite */}
      {team?.isOwner && !hasCollaborator && (
        <Card variant="subtle" padding="lg">
          <h2 className="text-[14px] font-semibold text-carbon mb-1">Invite by email</h2>
          <p className="text-[13px] text-graphite mb-5">They&apos;ll get an invitation to create their own account.</p>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Input
              type="email"
              placeholder="colleague@gmail.com"
              value={inviteEmail}
              onChange={(e) => { setInviteEmail(e.target.value); setError(null) }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) sendInvite() }}
              className="flex-1"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'Member' | 'Owner')}
              className="bg-linen border border-fog rounded-xl px-3 py-2.5 text-[13px] text-carbon outline-none focus:border-lavender/60 transition-colors"
            >
              <option value="Member">Member</option>
              <option value="Owner">Owner</option>
            </select>
            <Button onClick={sendInvite} disabled={!inviteEmail.trim() || isBusy} loading={isBusy} size="md">
              Send invite
            </Button>
          </div>

          {error && <p className="text-[12.5px] font-semibold text-carbon mb-4">{error}</p>}

          {/* Role descriptions */}
          <div className="flex flex-col gap-2 bg-linen rounded-xl p-4">
            <div>
              <p className="text-[13px] font-semibold text-carbon">Owner</p>
              <p className="text-[12px] text-graphite">Full access, including billing and team management.</p>
            </div>
            <div className="border-t border-fog pt-2 mt-1">
              <p className="text-[13px] font-semibold text-carbon">Member</p>
              <p className="text-[12px] text-graphite">Can manage deals, ideas, and automations, but not settings or billing.</p>
            </div>
          </div>
        </Card>
      )}
      </div>
    </main>
  )
}

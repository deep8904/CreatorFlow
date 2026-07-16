'use client'

import { useState } from 'react'
import { sendTeamInvite, revokeInvite } from '@/lib/supabase/actions'
import type { TeamData } from '@/lib/supabase/queries'

function initialsFor(name: string) {
  return (
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '—'
  )
}

export default function TeamBoard({ team }: { team: TeamData | null }) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'Member' | 'Owner'>('Member')
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const members = team?.members ?? []
  const pendingInvite = team?.pendingInvite ?? null
  const hasCollaborator = members.some((m) => m.role === 'member') || !!pendingInvite

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return
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
    if (result.error) setError(result.error)
  }

  return (
    <main className="flex-1 overflow-y-auto bg-linen">
      <div className="app-container-narrow">
      <div className="mb-8">
        <h1 className="text-app-h1 text-carbon">Team</h1>
        <p className="text-[12.5px] text-ash mt-0.5">Bring in a collaborator without giving up control.</p>
      </div>

      {/* Members list */}
      <div className="bg-paper-white border border-fog rounded-xl overflow-hidden mb-6" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
        <div className="px-5 py-4 border-b border-fog">
          <h2 className="text-[14px] font-semibold text-carbon">Members</h2>
        </div>

        <div className="divide-y divide-fog">
          {members.map((m) => {
            const name = m.profile?.full_name ?? 'You'
            return (
              <div key={m.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-lavender/10 flex items-center justify-center shrink-0">
                  <span className="text-[12px] font-semibold text-lavender">{initialsFor(name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-carbon">{name}</p>
                </div>
                <span className="text-[12px] font-medium text-graphite bg-linen px-2.5 py-1 rounded-full capitalize">
                  {m.role}
                </span>
              </div>
            )
          })}

          {pendingInvite && (
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-full bg-fog flex items-center justify-center shrink-0">
                <span className="text-[12px] font-semibold text-graphite">{initialsFor(pendingInvite.invited_email)}</span>
              </div>
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
      </div>

      {/* Invite */}
      {team?.isOwner && !hasCollaborator && (
        <div className="bg-paper-white border border-fog rounded-xl p-6" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
          <h2 className="text-[14px] font-semibold text-carbon mb-1">Invite by email</h2>
          <p className="text-[13px] text-graphite mb-5">They&apos;ll get an invitation to create their own account.</p>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="email"
              placeholder="colleague@gmail.com"
              value={inviteEmail}
              onChange={(e) => { setInviteEmail(e.target.value); setError(null) }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) sendInvite() }}
              className="flex-1 bg-linen border border-fog rounded-xl px-4 py-2.5 text-[14px] text-carbon placeholder-ash outline-none focus:border-lavender/60 transition-colors"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'Member' | 'Owner')}
              className="bg-linen border border-fog rounded-xl px-3 py-2.5 text-[13px] text-carbon outline-none focus:border-lavender/60 transition-colors"
            >
              <option value="Member">Member</option>
              <option value="Owner">Owner</option>
            </select>
            <button
              onClick={sendInvite}
              disabled={!inviteEmail.trim() || isBusy}
              className="text-[13px] font-medium text-paper-white bg-lavender px-5 py-2.5 rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Send invite
            </button>
          </div>

          {error && <p className="text-[12.5px] text-ember mb-4">{error}</p>}

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
        </div>
      )}
      </div>
    </main>
  )
}

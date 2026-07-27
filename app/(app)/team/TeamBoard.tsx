'use client'

import { useState } from 'react'
import { Users, Crown, X, Check } from 'lucide-react'
import { sendTeamInvite, revokeInvite, removeMember, updateMemberRole } from '@/lib/supabase/actions'
import type { TeamData } from '@/lib/supabase/queries'
import { InitialsChip } from '@/components/dash/InitialsChip'
import { Panel } from '@/components/dash/Panel'
import { DashboardHeader } from '@/components/dash/DashboardHeader'
import { FieldLabel, FieldInput } from '@/components/dash/FormField'
import { FOCUS, FOCUS_INSET, HOVER } from '@/components/dash/tokens'
import { useToast } from '@/lib/toast'

const ROLE_CAPS: { role: 'Owner' | 'Member'; icon: typeof Crown; items: string[] }[] = [
  { role: 'Owner', icon: Crown, items: ['Deals, ideas, drafts & automations', 'Invite, remove & re-role teammates', 'Account & integration settings'] },
  { role: 'Member', icon: Users, items: ['Deals, ideas, drafts & automations', 'Cannot manage teammates', 'Cannot change account settings'] },
]

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
    if (
      inviteRole === 'Owner' &&
      !window.confirm(
        `Grant ${inviteEmail.trim()} full Owner access, including team and account management? This can't be undone by revoking the invite once they've accepted.`,
      )
    )
      return
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
    if (
      role === 'Owner' &&
      !window.confirm(
        `Make ${name} the account owner? You'll become a Member and lose access to team and account management — they'll have full control instead.`,
      )
    )
      return
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
    <main id="dashboard-main" className="console-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <DashboardHeader eyebrow="Team" title="Team" description="Bring in a collaborator without giving up control." />

      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Panel title="Members" eyebrow={`${members.length} ${members.length === 1 ? 'person' : 'people'}`} titleId="team-members-heading">
          <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
            {members.map((m) => {
              const name = m.profile?.full_name ?? 'You'
              const manageable = team?.isOwner && m.role === 'member'
              return (
                <div key={m.id} className="flex items-center gap-4 px-5 py-4">
                  <InitialsChip name={name} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-nebula-ui text-[13.5px] font-medium text-zinc-100">{name}</p>
                  </div>
                  {manageable ? (
                    <select
                      value={m.role === 'owner' ? 'Owner' : 'Member'}
                      onChange={(e) => changeRole(m.id, name, e.target.value as 'Member' | 'Owner')}
                      disabled={isBusy}
                      className={`rounded-[9999px] border border-white/10 bg-white/[0.05] px-2.5 py-1.5 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-300 outline-none disabled:opacity-50 ${FOCUS}`}
                    >
                      <option value="Member">Member</option>
                      <option value="Owner">Owner</option>
                    </select>
                  ) : (
                    <span className="rounded-[9999px] bg-white/[0.06] px-2.5 py-1 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">
                      {m.role}
                    </span>
                  )}
                  {manageable && (
                    <button
                      type="button"
                      onClick={() => remove(m.id, name)}
                      disabled={isBusy}
                      aria-label={`Remove ${name}`}
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9999px] text-zinc-500 hover:bg-white/[0.08] hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS_INSET}`}
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  )}
                </div>
              )
            })}

            {pendingInvite && (
              <div className="flex items-center gap-4 px-5 py-4">
                <InitialsChip name={pendingInvite.invited_email} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-nebula-ui text-[13.5px] font-medium text-zinc-100">{pendingInvite.invited_email}</p>
                  <p className="font-nebula-ui text-[11.5px] text-zinc-500">Invited — waiting for them to accept</p>
                </div>
                {team?.isOwner && (
                  <button
                    type="button"
                    onClick={cancelInvite}
                    disabled={isBusy}
                    className={`shrink-0 font-nebula-ui text-[12px] font-medium text-zinc-500 hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS_INSET} rounded-[6px] px-1.5 py-1`}
                  >
                    Revoke
                  </button>
                )}
              </div>
            )}

            {!hasCollaborator && (
              <div className="flex flex-col items-center gap-1.5 px-5 py-10 text-center">
                <span aria-hidden className="mb-1 grid h-9 w-9 place-items-center rounded-[9999px] bg-orange-500/10 text-orange-400">
                  <Users size={16} strokeWidth={2} />
                </span>
                <p className="font-nebula-heading text-[14.5px] font-semibold text-white">It&apos;s just you right now.</p>
                <p className="font-nebula-ui text-[12.5px] text-zinc-500">Invite a collaborator to help manage deals and automations.</p>
              </div>
            )}
          </div>
        </Panel>

        <Panel title="What each role can do" titleId="team-roles-heading">
          <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2">
            {ROLE_CAPS.map(({ role, icon: Icon, items }) => (
              <div key={role} className="rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="mb-2.5 flex items-center gap-1.5 font-nebula-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-zinc-400">
                  <Icon size={12} strokeWidth={2} className="text-orange-400" />
                  {role}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {items.map((item, i) => (
                    <li key={item} className="flex items-start gap-1.5 font-nebula-ui text-[12.5px] text-zinc-300">
                      {i === items.length - 1 ? (
                        <X size={12} strokeWidth={2.5} className="mt-[3px] shrink-0 text-zinc-600" />
                      ) : (
                        <Check size={12} strokeWidth={2.5} className="mt-[3px] shrink-0 text-emerald-400" />
                      )}
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        {team?.isOwner && !hasCollaborator && (
          <Panel title="Invite by email" titleId="team-invite-heading">
            <div className="px-5 py-4">
              <p className="mb-4 font-nebula-ui text-[12.5px] text-zinc-500">They&apos;ll get an invitation to create their own account.</p>

              <div className="mb-3 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                  <FieldInput
                    id="invite-email"
                    type="email"
                    placeholder="colleague@gmail.com"
                    value={inviteEmail}
                    onChange={(e) => {
                      setInviteEmail(e.target.value)
                      setError(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing) sendInvite()
                    }}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="invite-role">Role</FieldLabel>
                  <select
                    id="invite-role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'Member' | 'Owner')}
                    className={`h-[38px] rounded-[10px] border border-white/10 bg-white/[0.04] px-3 font-nebula-ui text-[13.5px] text-zinc-100 outline-none ${FOCUS}`}
                  >
                    <option value="Member">Member</option>
                    <option value="Owner">Owner</option>
                  </select>
                </div>
              </div>

              {error && <p className="mb-3 font-nebula-ui text-[12.5px] font-medium text-orange-400">{error}</p>}

              <button
                type="button"
                onClick={sendInvite}
                disabled={!inviteEmail.trim() || isBusy}
                className={`nebula-cta-static inline-flex h-9 items-center rounded-[9999px] px-4 font-nebula-tech text-[12.5px] font-medium disabled:pointer-events-none disabled:opacity-50 ${FOCUS}`}
              >
                <span className="nebula-cta__label">{isBusy ? 'Sending…' : 'Send invite'}</span>
              </button>
            </div>
          </Panel>
        )}
      </div>
    </main>
  )
}

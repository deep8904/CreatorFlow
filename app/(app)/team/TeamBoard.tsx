'use client'

import { useState } from 'react'
import { Users, Link2, X, Pencil, Check as CheckIcon } from 'lucide-react'
import {
  sendTeamInvite,
  revokeInvite,
  removeMember,
  updateMemberRole,
  updateWorkspaceName,
} from '@/lib/supabase/actions'
import type { TeamData } from '@/lib/supabase/queries'
import type { Role } from '@/lib/supabase/types'
import { ALL_ROLES, ASSIGNABLE_ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, MODULE_LABELS, modulesForRole } from '@/lib/roles'
import { InitialsChip } from '@/components/dash/InitialsChip'
import { Panel } from '@/components/dash/Panel'
import { DashboardHeader } from '@/components/dash/DashboardHeader'
import { FieldLabel, FieldInput } from '@/components/dash/FormField'
import { FOCUS, FOCUS_INSET, HOVER } from '@/components/dash/tokens'
import { useToast } from '@/lib/toast'

function inviteLink(inviteId: string) {
  return `${window.location.origin}/accept-invite?invite=${inviteId}`
}

function WorkspaceNamePanel({ team }: { team: TeamData }) {
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(team.workspaceName)
  const [isBusy, setIsBusy] = useState(false)

  const save = async () => {
    const trimmed = name.trim()
    if (!trimmed || trimmed === team.workspaceName) {
      setIsEditing(false)
      return
    }
    setIsBusy(true)
    const result = await updateWorkspaceName(trimmed)
    setIsBusy(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setIsEditing(false)
  }

  return (
    <Panel title="Workspace" titleId="workspace-name-heading">
      <div className="flex items-center gap-3 px-5 py-4">
        {isEditing ? (
          <>
            <FieldInput
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) save()
                if (e.key === 'Escape') {
                  setName(team.workspaceName)
                  setIsEditing(false)
                }
              }}
              disabled={isBusy}
              className="max-w-xs"
            />
            <button
              type="button"
              onClick={save}
              disabled={isBusy || !name.trim()}
              aria-label="Save workspace name"
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9999px] text-emerald-400 hover:bg-white/[0.08] disabled:opacity-50 ${HOVER} ${FOCUS_INSET}`}
            >
              <CheckIcon size={14} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => {
                setName(team.workspaceName)
                setIsEditing(false)
              }}
              disabled={isBusy}
              aria-label="Cancel"
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9999px] text-zinc-500 hover:bg-white/[0.08] hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS_INSET}`}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </>
        ) : (
          <>
            <p className="min-w-0 flex-1 truncate font-nebula-ui text-[14px] font-medium text-zinc-100">
              {team.workspaceName}
            </p>
            {team.isOwner && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                aria-label="Rename workspace"
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9999px] text-zinc-500 hover:bg-white/[0.08] hover:text-white ${HOVER} ${FOCUS_INSET}`}
              >
                <Pencil size={13} strokeWidth={2} />
              </button>
            )}
          </>
        )}
      </div>
    </Panel>
  )
}

export default function TeamBoard({ team }: { team: TeamData | null }) {
  const toast = useToast()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('manager')
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const members = team?.members ?? []
  const pendingInvites = team?.pendingInvites ?? []

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return
    setIsBusy(true)
    setError(null)
    const result = await sendTeamInvite(inviteEmail, inviteRole)
    setIsBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setInviteEmail('')
    toast.success(`Invite sent to ${inviteEmail.trim()}.`)
  }

  const cancelInvite = async (id: string) => {
    setIsBusy(true)
    const result = await revokeInvite(id)
    setIsBusy(false)
    if (result.error) toast.error(result.error)
  }

  const copyLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(inviteLink(id))
      toast.success('Invite link copied.')
    } catch {
      toast.error('Could not copy — your browser may be blocking clipboard access.')
    }
  }

  const changeRole = async (memberId: string, name: string, role: Role) => {
    // An account has exactly one owner — promoting someone else to Owner
    // transfers it away from you, the opposite of "without giving up
    // control." Confirm before doing something that surprising.
    if (
      role === 'owner' &&
      !window.confirm(
        `Make ${name} the account owner? You'll become a Manager and lose access to team and workspace management — they'll have full control instead.`,
      )
    )
      return
    setIsBusy(true)
    const result = await updateMemberRole(memberId, role)
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
      <DashboardHeader eyebrow="Team" title="Team" description="Bring in collaborators without giving up control." />

      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {team && <WorkspaceNamePanel team={team} />}

        <Panel title="Members" eyebrow={`${members.length} ${members.length === 1 ? 'person' : 'people'}`} titleId="team-members-heading">
          <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
            {members.map((m) => {
              const name = m.profile?.full_name ?? 'You'
              const manageable = team?.isOwner && m.role !== 'owner'
              return (
                <div key={m.id} className="flex items-center gap-4 px-5 py-4">
                  <InitialsChip name={name} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-nebula-ui text-[13.5px] font-medium text-zinc-100">{name}</p>
                  </div>
                  {manageable ? (
                    <select
                      value={m.role}
                      onChange={(e) => changeRole(m.id, name, e.target.value as Role)}
                      disabled={isBusy}
                      className={`rounded-[9999px] border border-white/10 bg-white/[0.05] px-2.5 py-1.5 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-300 outline-none disabled:opacity-50 ${FOCUS}`}
                    >
                      {ALL_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="rounded-[9999px] bg-white/[0.06] px-2.5 py-1 font-nebula-mono text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400">
                      {ROLE_LABELS[m.role]}
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

            {pendingInvites.map((invite) => (
              <div key={invite.id} className="flex items-center gap-4 px-5 py-4">
                <InitialsChip name={invite.invited_email} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-nebula-ui text-[13.5px] font-medium text-zinc-100">{invite.invited_email}</p>
                  <p className="font-nebula-ui text-[11.5px] text-zinc-500">
                    Invited as {ROLE_LABELS[invite.role]} — waiting for them to accept
                  </p>
                </div>
                {team?.isOwner && (
                  <>
                    <button
                      type="button"
                      onClick={() => copyLink(invite.id)}
                      title="Copy invite link"
                      aria-label={`Copy invite link for ${invite.invited_email}`}
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9999px] text-zinc-500 hover:bg-white/[0.08] hover:text-white ${HOVER} ${FOCUS_INSET}`}
                    >
                      <Link2 size={14} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelInvite(invite.id)}
                      disabled={isBusy}
                      className={`shrink-0 font-nebula-ui text-[12px] font-medium text-zinc-500 hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS_INSET} rounded-[6px] px-1.5 py-1`}
                    >
                      Revoke
                    </button>
                  </>
                )}
              </div>
            ))}

            {members.length <= 1 && pendingInvites.length === 0 && (
              <div className="flex flex-col items-center gap-1.5 px-5 py-10 text-center">
                <span aria-hidden className="mb-1 grid h-9 w-9 place-items-center rounded-[9999px] bg-orange-500/10 text-orange-400">
                  <Users size={16} strokeWidth={2} />
                </span>
                <p className="font-nebula-heading text-[14.5px] font-semibold text-white">It&apos;s just you right now.</p>
                <p className="font-nebula-ui text-[12.5px] text-zinc-500">Invite collaborators to help manage the workspace.</p>
              </div>
            )}
          </div>
        </Panel>

        <Panel title="What each role can do" titleId="team-roles-heading">
          <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2">
            {ALL_ROLES.map((role) => {
              const modules = modulesForRole(role).filter((m) => m !== 'dashboard' && m !== 'team' && m !== 'settings')
              return (
                <div key={role} className="rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="mb-2 font-nebula-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-orange-400">
                    {ROLE_LABELS[role]}
                  </p>
                  <p className="mb-2.5 font-nebula-ui text-[12.5px] leading-relaxed text-zinc-400">{ROLE_DESCRIPTIONS[role]}</p>
                  {modules.length > 0 && (
                    <ul className="flex flex-col gap-1.5">
                      {modules.map((module) => (
                        <li key={module} className="flex items-start gap-1.5 font-nebula-ui text-[12.5px] text-zinc-300">
                          <CheckIcon size={12} strokeWidth={2.5} className="mt-[3px] shrink-0 text-emerald-400" />
                          {MODULE_LABELS[module]}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </Panel>

        {team?.isOwner && (
          <Panel title="Invite by email" titleId="team-invite-heading">
            <div className="px-5 py-4">
              <p className="mb-4 font-nebula-ui text-[12.5px] text-zinc-500">
                They&apos;ll get an invitation to create their own account, or you can copy the link once it&apos;s sent.
              </p>

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
                    onChange={(e) => setInviteRole(e.target.value as Role)}
                    className={`h-[38px] rounded-[10px] border border-white/10 bg-white/[0.04] px-3 font-nebula-ui text-[13.5px] text-zinc-100 outline-none ${FOCUS}`}
                  >
                    {ASSIGNABLE_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
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

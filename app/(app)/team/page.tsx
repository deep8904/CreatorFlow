'use client'

import { useState } from 'react'

interface Member {
  id: number
  name: string
  email: string
  role: 'Owner' | 'Member'
  status: 'active' | 'pending'
  initials: string
}

const sampleMembers: Member[] = [
  { id: 1, name: 'Jane Doe', email: 'jane@gmail.com', role: 'Owner', status: 'active', initials: 'JD' },
  { id: 2, name: 'Alex Smith', email: 'alex@gmail.com', role: 'Member', status: 'pending', initials: 'AS' },
]

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>(sampleMembers)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'Member' | 'Owner'>('Member')

  const sendInvite = () => {
    if (!inviteEmail.trim()) return
    setMembers(prev => [
      ...prev,
      { id: Date.now(), name: inviteEmail.split('@')[0], email: inviteEmail, role: inviteRole, status: 'pending', initials: inviteEmail[0].toUpperCase() },
    ])
    setInviteEmail('')
  }

  return (
    <div className="p-8 max-w-[680px]">
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-carbon" style={{ letterSpacing: '-0.5px' }}>Team</h1>
        <p className="text-[13px] text-ash mt-0.5">Bring in a collaborator without giving up control.</p>
      </div>

      {/* Members list */}
      <div className="bg-paper-white border border-fog rounded-2xl overflow-hidden mb-6" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
        <div className="px-5 py-4 border-b border-fog">
          <h2 className="text-[14px] font-semibold text-carbon">Members ({members.length})</h2>
        </div>

        {members.length === 1 && members[0].role === 'Owner' ? (
          <div className="px-5 py-8 text-center flex flex-col items-center gap-2">
            <p className="text-[14px] font-medium text-carbon">It&apos;s just you right now.</p>
            <p className="text-[13px] text-graphite">Invite a collaborator to help manage deals and automations.</p>
          </div>
        ) : (
          <div className="divide-y divide-fog">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-lavender/10 flex items-center justify-center shrink-0">
                  <span className="text-[12px] font-semibold text-lavender">{m.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-carbon">{m.name}</p>
                  <p className="text-[12px] text-ash">{m.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                    m.status === 'pending' ? 'bg-amber/10 text-amber' : 'bg-mint-wash text-mint'
                  }`}>
                    {m.status === 'pending' ? 'Invited — waiting for them to accept' : 'Active'}
                  </span>
                  <span className="text-[12px] font-medium text-graphite bg-linen px-2.5 py-1 rounded-full">{m.role}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite */}
      <div className="bg-paper-white border border-fog rounded-2xl p-6" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
        <h2 className="text-[14px] font-semibold text-carbon mb-1">Invite by email</h2>
        <p className="text-[13px] text-graphite mb-5">They&apos;ll get an invitation to create their own account.</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="email"
            placeholder="colleague@gmail.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
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
            disabled={!inviteEmail.trim()}
            className="text-[13px] font-medium text-paper-white bg-lavender px-5 py-2.5 rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Send invite
          </button>
        </div>

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
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile, disconnectIntegration, deleteAccount } from '@/lib/supabase/actions'

interface Props {
  fullName: string
  email: string
  gmailConnected: boolean
  gmailAccountLabel: string | null
  youtubeConnected: boolean
  youtubeAccountLabel: string | null
}

export default function SettingsBoard({
  fullName,
  email,
  gmailConnected,
  gmailAccountLabel,
  youtubeConnected,
  youtubeAccountLabel,
}: Props) {
  const router = useRouter()
  const [name, setName] = useState(fullName)
  const [isPending, startTransition] = useTransition()
  const [disconnecting, setDisconnecting] = useState<'gmail' | 'youtube' | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const save = () => {
    startTransition(() => {
      updateProfile(name)
    })
  }

  const handleDisconnect = async (provider: 'gmail' | 'youtube') => {
    setDisconnecting(provider)
    await disconnectIntegration(provider)
    setDisconnecting(null)
    router.refresh()
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    const result = await deleteAccount()
    setIsDeleting(false)
    if (result.error) {
      setDeleteError(result.error)
      return
    }
    router.push('/')
  }

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '—'

  const accounts = [
    {
      key: 'gmail' as const,
      name: 'Gmail',
      connected: gmailConnected,
      accountLabel: gmailAccountLabel,
      description: 'Brand deal email detection',
      iconBg: 'bg-sky/10',
      icon: (
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
          <rect width="18" height="14" rx="2" fill="#38BDF8" />
          <path d="M2 3l7 5 7-5" stroke="#000" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      key: 'youtube' as const,
      name: 'YouTube',
      connected: youtubeConnected,
      accountLabel: youtubeAccountLabel,
      description: 'Channel analytics and performance',
      iconBg: 'bg-[#ff0000]/10',
      icon: (
        <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
          <rect width="18" height="13" rx="3" fill="#FF0000" />
          <path d="M7 4l6 2.5-6 2.5V4z" fill="white" />
        </svg>
      ),
    },
  ]

  return (
    <main className="flex-1 overflow-y-auto bg-linen">
      <div className="app-container-narrow">
      <div className="mb-8">
        <h1 className="text-app-h1 text-carbon">Settings</h1>
      </div>

      <div className="flex flex-col gap-6">

        {/* Profile */}
        <section className="bg-paper-white border border-fog rounded-xl p-6" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
          <h2 className="text-[14px] font-semibold text-carbon mb-4">Profile</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-lavender/10 flex items-center justify-center shrink-0">
                <span className="text-[15px] font-bold text-lavender">{initials}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-label text-[11px] font-semibold text-ash uppercase tracking-wider block mb-1.5">Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-linen border border-fog rounded-xl px-3.5 py-2.5 text-[14px] text-carbon outline-none focus:border-lavender/60 transition-colors"
                />
              </div>
              <div>
                <label className="font-label text-[11px] font-semibold text-ash uppercase tracking-wider block mb-1.5">Email</label>
                <input
                  defaultValue={email}
                  disabled
                  className="w-full bg-linen border border-fog rounded-xl px-3.5 py-2.5 text-[14px] text-carbon outline-none disabled:opacity-70"
                />
              </div>
            </div>
            <button
              onClick={save}
              disabled={isPending}
              className="text-[13px] font-medium text-paper-white bg-lavender px-5 py-2.5 rounded-full w-fit hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Save changes
            </button>
          </div>
        </section>

        {/* Connected accounts */}
        <section className="bg-paper-white border border-fog rounded-xl p-6" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
          <h2 className="text-[14px] font-semibold text-carbon mb-4">Connected accounts</h2>
          <div className="flex flex-col divide-y divide-fog">
            {accounts.map((acct) => (
              <div key={acct.key} className="flex items-center gap-4 py-4">
                <div className={`w-10 h-10 rounded-xl ${acct.iconBg} flex items-center justify-center shrink-0`}>
                  {acct.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-carbon">{acct.name}</p>
                  <p className="text-[12px] text-ash">
                    {acct.connected ? `Connected as ${acct.accountLabel ?? email}` : acct.description}
                  </p>
                </div>
                {acct.connected ? (
                  <button
                    onClick={() => handleDisconnect(acct.key)}
                    disabled={disconnecting === acct.key}
                    className="text-[12px] font-medium px-4 py-2 rounded-full transition-colors text-graphite border border-fog hover:bg-linen disabled:opacity-50"
                  >
                    {disconnecting === acct.key ? 'Disconnecting…' : 'Disconnect'}
                  </button>
                ) : (
                  <span
                    title="Connecting a real account requires production Google OAuth credentials"
                    className="text-[12px] font-medium px-4 py-2 rounded-full text-ash border border-fog opacity-60 cursor-not-allowed"
                  >
                    Connect
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Data export */}
        <section className="bg-paper-white border border-fog rounded-xl p-6" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
          <h2 className="text-[14px] font-semibold text-carbon mb-1">Data export</h2>
          <p className="text-[13px] text-graphite mb-4">
            Download everything you&apos;ve put into CreatorFlow — deals, ideas, drafts, and settings — as files you can keep, any time.
          </p>
          <a
            href="/api/export"
            download
            className="inline-block text-[13px] font-medium text-carbon border border-fog px-5 py-2.5 rounded-full hover:bg-linen transition-colors"
          >
            Export my data
          </a>
        </section>

        {/* Danger zone */}
        <section className="bg-paper-white border border-fog rounded-xl p-6" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
          <h2 className="text-[14px] font-semibold text-carbon mb-1">Delete account</h2>
          <p className="text-[13px] text-graphite mb-4">
            This permanently deletes your account and data. You can export your data first above.
          </p>
          <button
            onClick={() => setDeleteOpen(true)}
            className="text-[13px] font-medium text-ember border border-ember/30 px-5 py-2.5 rounded-full hover:bg-ember/5 transition-colors"
          >
            Delete account
          </button>
        </section>
      </div>
      </div>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => !isDeleting && setDeleteOpen(false)}>
          <div className="w-full max-w-[400px] bg-paper-white border border-fog rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[15px] font-bold text-carbon mb-2">Delete your account?</h2>
            <p className="text-[13px] text-graphite mb-4">
              This permanently deletes your account and every deal, idea, draft, and automation in it. This can&apos;t be undone.
            </p>
            <label className="font-label text-[10.5px] font-semibold text-ash uppercase tracking-widest block mb-1.5">
              Type DELETE to confirm
            </label>
            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-linen border border-fog rounded-xl px-3.5 py-2.5 text-[14px] text-carbon outline-none focus:border-ember/60 transition-colors mb-4"
            />
            {deleteError && <p className="text-[12.5px] text-ember mb-4">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="flex-1 text-[13px] font-semibold text-white bg-ember px-4 py-2.5 rounded-full hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                {isDeleting ? 'Deleting…' : 'Permanently delete'}
              </button>
              <button
                onClick={() => setDeleteOpen(false)}
                disabled={isDeleting}
                className="text-[13px] font-medium text-graphite px-4 py-2.5 hover:text-carbon transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

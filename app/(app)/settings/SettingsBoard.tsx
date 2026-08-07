'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Trash2, Download, BellRing } from 'lucide-react'
import { updateProfile, disconnectIntegration, deleteAccount, updateNotifyDealReminders } from '@/lib/supabase/actions'
import { updateEmail, updatePassword, connectGoogle } from '@/lib/supabase/auth'
import { InitialsChip } from '@/components/dash/InitialsChip'
import { Panel } from '@/components/dash/Panel'
import { Pill } from '@/components/dash/Pill'
import { DashboardHeader } from '@/components/dash/DashboardHeader'
import { GlassModal } from '@/components/dash/GlassModal'
import { FieldLabel, FieldInput } from '@/components/dash/FormField'
import { GmailGlyph, YouTubeGlyph } from '@/components/ui/oauth-glyphs'
import { FOCUS, FOCUS_INSET, HOVER } from '@/components/dash/tokens'
import { useToast } from '@/lib/toast'

interface Props {
  fullName: string
  email: string
  gmailConnected: boolean
  gmailAccountLabel: string | null
  gmailIsDemo: boolean
  youtubeConnected: boolean
  youtubeAccountLabel: string | null
  youtubeIsDemo: boolean
  notifyDealReminders: boolean
  isOwner: boolean
}

export default function SettingsBoard({
  fullName,
  email,
  gmailConnected,
  gmailAccountLabel,
  gmailIsDemo,
  youtubeConnected,
  youtubeAccountLabel,
  youtubeIsDemo,
  notifyDealReminders,
  isOwner,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const [isConnecting, setIsConnecting] = useState(false)
  const handledOAuthReturn = useRef(false)

  // Landing back here after the Google OAuth round trip (app/auth/callback)
  // — surface the result once, then drop the query params so a refresh
  // doesn't re-show the toast. The ref guard (not just the param check)
  // matters: toast.success/error triggers a context update that re-renders
  // this component, and router.replace doesn't clear the params
  // synchronously, so without it this effect fires repeatedly on the same
  // stale params before the URL catches up.
  useEffect(() => {
    if (handledOAuthReturn.current) return
    const connected = searchParams.get('integration_connected')
    const error = searchParams.get('integration_error')
    if (!connected && !error) return
    handledOAuthReturn.current = true
    if (connected) toast.success('Google account connected.')
    if (error) toast.error(`Could not finish connecting: ${error}`)
    router.replace('/settings')
  }, [searchParams, toast, router])
  const [name, setName] = useState(fullName)
  const [emailInput, setEmailInput] = useState(email)
  const [isPending, startTransition] = useTransition()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [disconnecting, setDisconnecting] = useState<'gmail' | 'youtube' | null>(null)
  const [remindersOn, setRemindersOn] = useState(notifyDealReminders)
  const [isSavingReminders, setIsSavingReminders] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const save = () => {
    const trimmedEmail = emailInput.trim()
    const emailChanged = trimmedEmail && trimmedEmail !== email
    startTransition(async () => {
      const [profileResult, emailResult] = await Promise.all([
        updateProfile(name),
        emailChanged ? updateEmail(trimmedEmail) : Promise.resolve(null),
      ])
      if (profileResult.error) {
        toast.error(profileResult.error)
        return
      }
      if (emailResult?.error) {
        toast.error(emailResult.error.message)
        return
      }
      toast.success(emailChanged ? `Profile saved. Check ${trimmedEmail} to confirm your new email.` : 'Profile saved.')
    })
  }

  const savePassword = async () => {
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords don’t match.')
      return
    }
    setIsSavingPassword(true)
    try {
      const { error } = await updatePassword(newPassword)
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success('Password updated.')
      setNewPassword('')
      setConfirmPassword('')
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleDisconnect = async (provider: 'gmail' | 'youtube') => {
    setDisconnecting(provider)
    const result = await disconnectIntegration(provider)
    setDisconnecting(null)
    if (result.error) {
      toast.error(result.error)
      return
    }
    router.refresh()
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    const { error } = await connectGoogle('/settings')
    if (error) {
      setIsConnecting(false)
      toast.error(error.message)
    }
    // On success the browser is already navigating to Google — no state
    // update needed, this component is about to unmount.
  }

  const toggleReminders = async () => {
    const next = !remindersOn
    setRemindersOn(next)
    setIsSavingReminders(true)
    const result = await updateNotifyDealReminders(next)
    setIsSavingReminders(false)
    if (result.error) {
      setRemindersOn(!next)
      toast.error(result.error)
      return
    }
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

  const accounts = [
    {
      key: 'gmail' as const,
      name: 'Gmail',
      connected: gmailConnected,
      accountLabel: gmailAccountLabel,
      isDemo: gmailIsDemo,
      description: 'Brand deal email detection',
      icon: <GmailGlyph />,
    },
    {
      key: 'youtube' as const,
      name: 'YouTube',
      connected: youtubeConnected,
      accountLabel: youtubeAccountLabel,
      isDemo: youtubeIsDemo,
      description: 'Channel analytics and performance',
      icon: <YouTubeGlyph />,
    },
  ]

  return (
    <main id="dashboard-main" className="console-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <DashboardHeader eyebrow="Settings" title="Settings" description="Your account, connected accounts, and data." />

      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Profile */}
        <Panel title="Profile" titleId="settings-profile-heading">
          <div className="flex flex-col gap-4 px-5 py-4">
            <InitialsChip name={name || 'You'} size={44} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="settings-name">Full name</FieldLabel>
                <FieldInput id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <FieldLabel htmlFor="settings-email">Email</FieldLabel>
                <FieldInput id="settings-email" type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
              </div>
            </div>
            <button
              type="button"
              onClick={save}
              disabled={isPending || !name.trim() || !emailInput.trim()}
              className={`nebula-cta-static inline-flex h-9 w-fit items-center rounded-[9999px] px-4 font-nebula-tech text-[12.5px] font-medium disabled:pointer-events-none disabled:opacity-50 ${FOCUS}`}
            >
              <span className="nebula-cta__label">{isPending ? 'Saving…' : 'Save changes'}</span>
            </button>
          </div>
        </Panel>

        {/* Password */}
        <Panel title="Password" titleId="settings-password-heading">
          <div className="flex flex-col gap-4 px-5 py-4">
            <p className="-mt-1 font-nebula-ui text-[12.5px] text-zinc-500">Change your password without signing out.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="settings-new-password">New password</FieldLabel>
                <FieldInput
                  id="settings-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <FieldLabel htmlFor="settings-confirm-password">Confirm password</FieldLabel>
                <FieldInput
                  id="settings-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat the password"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={savePassword}
              disabled={isSavingPassword || !newPassword || !confirmPassword}
              className={`nebula-cta-static inline-flex h-9 w-fit items-center rounded-[9999px] px-4 font-nebula-tech text-[12.5px] font-medium disabled:pointer-events-none disabled:opacity-50 ${FOCUS}`}
            >
              <span className="nebula-cta__label">{isSavingPassword ? 'Updating…' : 'Update password'}</span>
            </button>
          </div>
        </Panel>

        {/* Notifications */}
        <Panel title="Notifications" titleId="settings-notifications-heading">
          <div className="flex items-center gap-4 px-5 py-4">
            <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-[9999px] bg-orange-500/10 text-orange-400">
              <BellRing size={16} strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-nebula-ui text-[13.5px] font-medium text-zinc-100">Deal reminders</p>
              <p className="font-nebula-ui text-[12px] text-zinc-500">
                The bell in the sidebar flags deals due or overdue in the next 3 days. In-app only, no email or push.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleReminders}
              disabled={isSavingReminders}
              role="switch"
              aria-checked={remindersOn}
              aria-label="Toggle deal reminders"
              className={`relative h-6 w-10 shrink-0 rounded-[9999px] transition-colors disabled:opacity-50 ${HOVER} ${FOCUS_INSET} ${
                remindersOn ? 'bg-orange-500' : 'bg-white/[0.12]'
              }`}
            >
              <span
                className={`absolute left-0 top-1 h-4 w-4 rounded-[9999px] bg-white transition-transform ${HOVER} ${
                  remindersOn ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </Panel>

        {/* Connected accounts */}
        <Panel title="Connected accounts" titleId="settings-accounts-heading">
          <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
            {accounts.map((acct) => (
              <div key={acct.key} className="flex items-center gap-4 px-5 py-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-white/[0.06] text-zinc-300">{acct.icon}</div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-nebula-ui text-[13.5px] font-medium text-zinc-100">
                    {acct.name}
                    {acct.connected && acct.isDemo && (
                      <span title="Seeded demo data, not a live OAuth session">
                        <Pill>Demo</Pill>
                      </span>
                    )}
                  </p>
                  <p className="font-nebula-ui text-[12px] text-zinc-500">
                    {acct.connected
                      ? acct.isDemo
                        ? `Connected as ${acct.accountLabel ?? email} (demo data, not live)`
                        : `Connected as ${acct.accountLabel ?? email}`
                      : acct.description}
                  </p>
                </div>
                {acct.connected ? (
                  isOwner ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnect(acct.key)}
                      disabled={disconnecting === acct.key}
                      className={`shrink-0 rounded-[9999px] border border-white/10 px-3.5 py-1.5 font-nebula-ui text-[12px] font-medium text-zinc-300 hover:bg-white/[0.05] hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS_INSET}`}
                    >
                      {disconnecting === acct.key ? 'Disconnecting…' : 'Disconnect'}
                    </button>
                  ) : (
                    <span
                      title="Only the workspace owner can disconnect a connection"
                      className="shrink-0 rounded-[9999px] bg-white/[0.06] px-3.5 py-1.5 font-nebula-ui text-[12px] font-medium text-zinc-500"
                    >
                      Connected
                    </span>
                  )
                ) : isOwner ? (
                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className={`shrink-0 rounded-[9999px] border border-white/10 px-3.5 py-1.5 font-nebula-ui text-[12px] font-medium text-zinc-300 hover:bg-white/[0.05] hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS_INSET}`}
                  >
                    {isConnecting ? 'Connecting…' : 'Connect'}
                  </button>
                ) : (
                  <span
                    title="Only the workspace owner can connect an integration"
                    className="shrink-0 cursor-not-allowed rounded-[9999px] border border-white/10 px-3.5 py-1.5 font-nebula-ui text-[12px] font-medium text-zinc-600"
                  >
                    Connect
                  </span>
                )}
              </div>
            ))}
          </div>
        </Panel>

        {/* Data export */}
        <Panel title="Data export" titleId="settings-export-heading">
          <div className="px-5 py-4">
            <p className="mb-4 font-nebula-ui text-[12.5px] text-zinc-500">
              Download everything you&apos;ve put into CreatorFlow (deals, ideas, drafts, and settings) as files you can keep, any time.
            </p>
            <a
              href="/api/export"
              download
              className={`inline-flex h-9 items-center gap-1.5 rounded-[9999px] border border-white/10 px-4 font-nebula-ui text-[12.5px] font-medium text-zinc-300 hover:bg-white/[0.05] hover:text-white ${HOVER} ${FOCUS}`}
            >
              <Download size={13} strokeWidth={2} />
              Export my data
            </a>
          </div>
        </Panel>

        {/* Danger zone */}
        <Panel title="Delete account" titleId="settings-danger-heading">
          <div className="px-5 py-4">
            <p className="mb-4 font-nebula-ui text-[12.5px] text-zinc-500">
              This permanently deletes your account and data. You can export your data first above.
            </p>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-[9999px] border border-orange-500/25 px-4 font-nebula-ui text-[12.5px] font-medium text-orange-300 hover:bg-orange-500/[0.08] ${HOVER} ${FOCUS}`}
            >
              <Trash2 size={13} strokeWidth={2} />
              Delete account
            </button>
          </div>
        </Panel>
      </div>

      {deleteOpen && (
        <GlassModal title="Delete your account?" onClose={() => !isDeleting && setDeleteOpen(false)}>
          <p className="mb-4 font-nebula-ui text-[13px] text-zinc-400">
            This permanently deletes your account and every deal, idea, draft, and automation in it. This can&apos;t be undone.
          </p>
          <FieldLabel htmlFor="delete-confirm">Type DELETE to confirm</FieldLabel>
          <FieldInput
            id="delete-confirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            className="mb-4"
          />
          {deleteError && <p className="mb-4 font-nebula-ui text-[12.5px] font-medium text-orange-400">{deleteError}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              className={`flex h-9 flex-1 items-center justify-center rounded-[9999px] bg-orange-500/[0.15] font-nebula-ui text-[12.5px] font-medium text-orange-300 hover:bg-orange-500/[0.22] disabled:pointer-events-none disabled:opacity-50 ${HOVER} ${FOCUS}`}
            >
              {isDeleting ? 'Deleting…' : 'Permanently delete'}
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
              className={`flex h-9 items-center rounded-[9999px] px-4 font-nebula-ui text-[12.5px] font-medium text-zinc-400 hover:bg-white/[0.05] hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS}`}
            >
              Cancel
            </button>
          </div>
        </GlassModal>
      )}
    </main>
  )
}

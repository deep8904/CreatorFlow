'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile, disconnectIntegration, deleteAccount } from '@/lib/supabase/actions'
import { updateEmail, updatePassword } from '@/lib/supabase/auth'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { GmailGlyph, YouTubeGlyph } from '@/components/ui/oauth-glyphs'
import { useToast } from '@/lib/toast'
import { useEscapeKey } from '@/lib/useEscapeKey'

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
  const toast = useToast()
  const [name, setName] = useState(fullName)
  const [emailInput, setEmailInput] = useState(email)
  const [isPending, startTransition] = useTransition()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [disconnecting, setDisconnecting] = useState<'gmail' | 'youtube' | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  useEscapeKey(() => { if (deleteOpen && !isDeleting) setDeleteOpen(false) })

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
      description: 'Brand deal email detection',
      icon: <GmailGlyph />,
    },
    {
      key: 'youtube' as const,
      name: 'YouTube',
      connected: youtubeConnected,
      accountLabel: youtubeAccountLabel,
      description: 'Channel analytics and performance',
      icon: <YouTubeGlyph />,
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
        <Card variant="subtle" padding="lg">
          <h2 className="text-[14px] font-semibold text-carbon mb-4">Profile</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={name} size="lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="settings-name">Full name</Label>
                <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="settings-email">Email</Label>
                <Input
                  id="settings-email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={save} disabled={isPending || !name.trim() || !emailInput.trim()} loading={isPending} size="md" className="w-fit">
              Save changes
            </Button>
          </div>
        </Card>

        {/* Password */}
        <Card variant="subtle" padding="lg">
          <h2 className="text-[14px] font-semibold text-carbon mb-1">Password</h2>
          <p className="text-[13px] text-graphite mb-4">Change your password without signing out.</p>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="settings-new-password">New password</Label>
                <Input
                  id="settings-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <Label htmlFor="settings-confirm-password">Confirm password</Label>
                <Input
                  id="settings-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <Button
              onClick={savePassword}
              disabled={isSavingPassword || !newPassword || !confirmPassword}
              loading={isSavingPassword}
              size="md"
              className="w-fit"
            >
              Update password
            </Button>
          </div>
        </Card>

        {/* Connected accounts */}
        <Card variant="subtle" padding="lg">
          <h2 className="text-[14px] font-semibold text-carbon mb-4">Connected accounts</h2>
          <div className="flex flex-col divide-y divide-fog">
            {accounts.map((acct) => (
              <div key={acct.key} className="flex items-center gap-4 py-4">
                <div className="w-10 h-10 rounded-xl bg-fog text-carbon flex items-center justify-center shrink-0">
                  {acct.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-carbon">{acct.name}</p>
                  <p className="text-[12px] text-ash">
                    {acct.connected ? `Connected as ${acct.accountLabel ?? email}` : acct.description}
                  </p>
                </div>
                {acct.connected ? (
                  <Button
                    variant="secondary"
                    onClick={() => handleDisconnect(acct.key)}
                    disabled={disconnecting === acct.key}
                    loading={disconnecting === acct.key}
                    size="sm"
                  >
                    Disconnect
                  </Button>
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
        </Card>

        {/* Data export */}
        <Card variant="subtle" padding="lg">
          <h2 className="text-[14px] font-semibold text-carbon mb-1">Data export</h2>
          <p className="text-[13px] text-graphite mb-4">
            Download everything you&apos;ve put into CreatorFlow — deals, ideas, drafts, and settings — as files you can keep, any time.
          </p>
          <Button href="/api/export" download variant="secondary" size="md">
            Export my data
          </Button>
        </Card>

        {/* Danger zone */}
        <Card variant="subtle" padding="lg">
          <h2 className="text-[14px] font-semibold text-carbon mb-1">Delete account</h2>
          <p className="text-[13px] text-graphite mb-4">
            This permanently deletes your account and data. You can export your data first above.
          </p>
          <Button variant="secondary" onClick={() => setDeleteOpen(true)} size="md">
            Delete account
          </Button>
        </Card>
      </div>
      </div>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => !isDeleting && setDeleteOpen(false)}>
          <div className="w-full max-w-[400px] bg-paper-white border border-fog rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[15px] font-bold text-carbon mb-2">Delete your account?</h2>
            <p className="text-[13px] text-graphite mb-4">
              This permanently deletes your account and every deal, idea, draft, and automation in it. This can&apos;t be undone.
            </p>
            <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
            <Input
              id="delete-confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="mb-4"
            />
            {deleteError && <p className="text-[12.5px] font-semibold text-carbon mb-4">{deleteError}</p>}
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                loading={isDeleting}
                size="md"
                className="flex-1"
              >
                Permanently delete
              </Button>
              <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={isDeleting} size="md">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

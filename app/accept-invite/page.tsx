import type { Metadata, Viewport } from 'next'
import { Ban, UserPlus, Unlink, ShieldAlert } from 'lucide-react'
import { getAuthenticatedUser } from '@/lib/supabase/server'
import { getInviteById } from '@/lib/supabase/queries'
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/roles'
import { AuthShell, AuthNotice, AuthButton, AuthLink } from '@/components/auth'
import { AcceptInviteButton } from './AcceptInviteButton'

export const metadata: Metadata = { title: 'Accept invite - CreatorFlow' }
export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#000000' }

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>
}) {
  const { invite: inviteId } = await searchParams
  const { user } = await getAuthenticatedUser()
  const nextParam = inviteId ? `/accept-invite?invite=${encodeURIComponent(inviteId)}` : '/accept-invite'

  if (!inviteId) {
    return (
      <AuthShell>
        <AuthNotice icon={Unlink} tone="neutral" title="Invite link incomplete." body="This link is missing its invite reference. Ask the account owner to resend it.">
          <AuthButton variant="calm" href="/">
            Back to CreatorFlow
          </AuthButton>
        </AuthNotice>
      </AuthShell>
    )
  }

  if (!user) {
    return (
      <AuthShell>
        <AuthNotice
          icon={UserPlus}
          tone="accent"
          title="You've been invited to CreatorFlow."
          body="Sign in or create an account with the email address this invite was sent to, then come back to this link to accept."
        >
          <div className="flex w-full flex-col items-center gap-3">
            <AuthButton href={`/onboarding?next=${encodeURIComponent(nextParam)}`}>Create account</AuthButton>
            <AuthLink href={`/login?next=${encodeURIComponent(nextParam)}`}>Already have an account? Sign in</AuthLink>
          </div>
        </AuthNotice>
      </AuthShell>
    )
  }

  const invite = await getInviteById(inviteId)

  if (!invite || invite.status !== 'pending') {
    return (
      <AuthShell>
        <AuthNotice
          icon={Ban}
          tone="neutral"
          title="This invite isn't valid."
          body="It may have already been accepted, revoked, or sent to a different email address than the one you're signed in with."
        >
          <AuthButton variant="calm" href="/dashboard">
            Go to Dashboard
          </AuthButton>
        </AuthNotice>
      </AuthShell>
    )
  }

  // The RPC re-checks this server-side before writing anything, but surfacing the mismatch
  // here — before a click that would otherwise just fail — saves a round trip and explains
  // exactly what to do about it, rather than a generic "could not accept" error.
  const emailMismatch = user.email?.toLowerCase() !== invite.invited_email.toLowerCase()

  if (emailMismatch) {
    return (
      <AuthShell>
        <AuthNotice
          icon={ShieldAlert}
          tone="neutral"
          title="Wrong account."
          body={
            <>
              This invite was sent to <span className="text-zinc-100">{invite.invited_email}</span>, but you&apos;re signed in
              as <span className="text-zinc-100">{user.email}</span>. Sign out and sign back in with the invited address to
              accept it.
            </>
          }
        >
          <AuthLink href={`/login?next=${encodeURIComponent(nextParam)}`}>Sign in with a different account</AuthLink>
        </AuthNotice>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <AuthNotice
        icon={UserPlus}
        tone="accent"
        title={`Join as ${invite.role === 'owner' ? 'an' : 'a'} ${ROLE_LABELS[invite.role]}?`}
        body={
          <>
            You&apos;re signed in as <span className="text-zinc-100">{invite.invited_email}</span>. As{' '}
            {invite.role === 'owner' ? 'an' : 'a'} {ROLE_LABELS[invite.role]}, you&apos;ll get{' '}
            {ROLE_DESCRIPTIONS[invite.role].charAt(0).toLowerCase() + ROLE_DESCRIPTIONS[invite.role].slice(1)}
          </>
        }
      >
        <AcceptInviteButton inviteId={invite.id} />
      </AuthNotice>
    </AuthShell>
  )
}

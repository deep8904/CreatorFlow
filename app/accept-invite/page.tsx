import Link from 'next/link'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { UserPlus } from 'lucide-react'
import { getAuthenticatedUser } from '@/lib/supabase/server'
import { getInviteById } from '@/lib/supabase/queries'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { AcceptInviteButton } from './AcceptInviteButton'

export const metadata: Metadata = { title: 'Accept invite — CreatorFlow' }

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>
}) {
  const { invite: inviteId } = await searchParams
  const { user } = await getAuthenticatedUser()
  const nextParam = inviteId ? `/accept-invite?invite=${encodeURIComponent(inviteId)}` : '/accept-invite'

  const shell = (children: ReactNode) => (
    <div className="flex min-h-screen flex-col bg-linen">
      <header className="flex w-full items-center gap-2.5 border-b border-fog px-6 py-4">
        <Logo size={24} />
        <span className="text-[15px] font-semibold text-carbon">CreatorFlow</span>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[420px] flex flex-col items-center gap-6 text-center">{children}</div>
      </main>
    </div>
  )

  if (!inviteId) {
    return shell(
      <>
        <h1 className="text-auth-h1 text-carbon">Invite link incomplete.</h1>
        <p className="font-body-editorial text-[15px] leading-relaxed text-graphite">
          This link is missing its invite reference. Ask the account owner to resend it.
        </p>
        <Button href="/" size="lg">
          Back to CreatorFlow
        </Button>
      </>,
    )
  }

  if (!user) {
    return shell(
      <>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lavender/10">
          <UserPlus size={22} className="text-lavender" strokeWidth={2} />
        </div>
        <h1 className="text-auth-h1 text-carbon">You&apos;ve been invited to CreatorFlow.</h1>
        <p className="font-body-editorial text-[15px] leading-relaxed text-graphite">
          Sign in or create an account with the email address this invite was sent to, then come back to this
          link to accept.
        </p>
        <div className="flex w-full flex-col gap-3">
          <Button href={`/onboarding?next=${encodeURIComponent(nextParam)}`} size="lg" className="w-full">
            Create account
          </Button>
          <Link
            href={`/login?next=${encodeURIComponent(nextParam)}`}
            className="text-[13px] font-medium text-graphite hover:text-carbon transition-colors"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </>,
    )
  }

  const invite = await getInviteById(inviteId)

  if (!invite || invite.status !== 'pending') {
    return shell(
      <>
        <h1 className="text-auth-h1 text-carbon">This invite isn&apos;t valid.</h1>
        <p className="font-body-editorial text-[15px] leading-relaxed text-graphite">
          It may have already been accepted, revoked, or sent to a different email address than the one you&apos;re
          signed in with.
        </p>
        <Button href="/dashboard" size="lg">
          Go to Dashboard
        </Button>
      </>,
    )
  }

  return shell(
    <>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lavender/10">
        <UserPlus size={22} className="text-lavender" strokeWidth={2} />
      </div>
      <h1 className="text-auth-h1 text-carbon">Join as {invite.role === 'owner' ? 'an owner' : 'a collaborator'}?</h1>
      <p className="font-body-editorial text-[15px] leading-relaxed text-graphite">
        You&apos;ll get {invite.role === 'owner' ? 'full access, including billing and team management' : 'access to deals, ideas, and automations'}.
      </p>
      <AcceptInviteButton inviteId={invite.id} />
    </>,
  )
}

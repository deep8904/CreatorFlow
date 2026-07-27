'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { acceptTeamInvite } from '@/lib/supabase/actions'
import { AuthAlert, AuthButton } from '@/components/auth'

export function AcceptInviteButton({ inviteId }: { inviteId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const accept = async () => {
    setIsPending(true)
    setError(null)
    const result = await acceptTeamInvite(inviteId)
    setIsPending(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.push('/team')
    router.refresh()
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <AuthAlert message={error} />
      <AuthButton type="button" onClick={accept} disabled={isPending} loading={isPending}>
        {isPending ? 'Joining…' : 'Accept invite'}
      </AuthButton>
    </div>
  )
}

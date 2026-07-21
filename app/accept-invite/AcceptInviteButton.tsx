'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { acceptTeamInvite } from '@/lib/supabase/actions'
import { Button } from '@/components/ui/button'

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
    <div className="flex flex-col gap-3 w-full">
      {error && <p className="text-[13px] font-semibold text-carbon text-center">{error}</p>}
      <Button onClick={accept} size="lg" className="w-full" loading={isPending} iconRight={!isPending ? <ArrowRight size={15} /> : undefined}>
        {isPending ? 'Joining…' : 'Accept invite'}
      </Button>
    </div>
  )
}

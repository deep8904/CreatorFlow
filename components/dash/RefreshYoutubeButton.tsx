'use client'

import { useTransition } from 'react'
import { RefreshCw } from 'lucide-react'
import { refreshYoutubeData } from '@/lib/supabase/actions'
import { FOCUS, HOVER } from './tokens'
import { useToast } from '@/lib/toast'

export function RefreshYoutubeButton() {
  const toast = useToast()
  const [isPending, startTransition] = useTransition()

  const refresh = () => {
    startTransition(async () => {
      const result = await refreshYoutubeData()
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('YouTube data refreshed.')
    })
  }

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={isPending}
      className={`inline-flex h-8 items-center gap-1.5 rounded-[9999px] border border-white/10 px-3 font-nebula-ui text-[12px] font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white disabled:opacity-50 ${HOVER} ${FOCUS}`}
    >
      <RefreshCw size={12} strokeWidth={2} className={isPending ? 'animate-spin' : ''} />
      {isPending ? 'Refreshing…' : 'Refresh from YouTube'}
    </button>
  )
}

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Sparkles } from 'lucide-react'
import { FOCUS, FOCUS_INSET, HOVER } from './tokens'
import { canAccessModule } from '@/lib/roles'
import type { Role } from '@/lib/supabase/types'
import { seedSampleData } from '@/lib/supabase/actions'
import { useToast } from '@/lib/toast'

export function EmptyDashboard({ role }: { role: Role }) {
  const router = useRouter()
  const toast = useToast()
  const [isSeeding, startTransition] = useTransition()
  const canDeals = canAccessModule(role, 'deals')
  const canIdeas = canAccessModule(role, 'ideas')

  const generateSampleData = () => {
    startTransition(async () => {
      const result = await seedSampleData()
      if (result.error) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] px-6 py-16 text-center">
      <span aria-hidden className="grid h-11 w-11 place-items-center rounded-[9999px] bg-orange-500/10 text-orange-400">
        <Sparkles size={18} strokeWidth={2} />
      </span>
      <div>
        <p className="font-nebula-heading text-[16px] font-semibold text-white">Nothing here yet.</p>
        <p className="mt-1 font-nebula-ui text-[13px] text-zinc-500">
          {canDeals || canIdeas
            ? 'Log a deal or capture an idea and this dashboard fills in.'
            : "Nothing in this workspace yet for your role to show — check back once there's activity."}
        </p>
      </div>
      {(canDeals || canIdeas) && (
        <div className="flex items-center gap-2.5">
          {canDeals && (
            <Link
              href="/deals?new=1"
              className={`nebula-cta nebula-cta--wide inline-flex h-9 items-center rounded-[9999px] px-4 font-nebula-tech text-[12.5px] font-medium ${FOCUS}`}
            >
              <span className="nebula-cta__label">Log a deal</span>
            </Link>
          )}
          {canIdeas && (
            <Link
              href="/ideas?new=1"
              className={`flex h-9 items-center rounded-[9999px] border border-white/10 px-4 font-nebula-ui text-[12.5px] font-medium text-zinc-300 hover:bg-white/[0.05] hover:text-white ${HOVER} ${FOCUS}`}
            >
              Capture an idea
            </Link>
          )}
        </div>
      )}
      {role === 'owner' && (
        <button
          type="button"
          onClick={generateSampleData}
          disabled={isSeeding}
          className={`font-nebula-ui text-[12px] font-medium text-zinc-500 hover:text-zinc-300 disabled:opacity-50 ${HOVER} ${FOCUS_INSET} rounded-[6px] px-1.5 py-1`}
        >
          {isSeeding ? 'Adding sample data…' : 'Not sure where to start? Try it with sample data →'}
        </button>
      )}
    </div>
  )
}

export default EmptyDashboard

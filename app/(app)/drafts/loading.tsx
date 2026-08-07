import { PanelSkeleton } from '@/components/dash/DashSkeleton'

// Drafts uses its own compact header bar (view switcher, not the shared
// DashboardHeader), so this matches that chrome directly instead of the
// generic PageLoading fallback the other module pages use.
export default function Loading() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-2.5 sm:px-6">
        <p className="flex items-center gap-1.5 font-nebula-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-orange-400">
          <span aria-hidden className="h-1.5 w-1.5 rounded-[9999px] bg-orange-400" />
          Drafts
        </p>
      </div>
      <div className="console-scroll min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <PanelSkeleton height={480} />
      </div>
    </div>
  )
}

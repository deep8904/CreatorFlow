import { DashboardHeader } from './DashboardHeader'
import { PanelSkeleton } from './DashSkeleton'

/**
 * Shared instant fallback for `loading.tsx` across the module pages — each
 * page is a Server Component awaiting one or more Supabase queries, so
 * without this Next just shows a blank pane until the whole page resolves.
 * Real chrome (header) renders immediately; body is skeleton panels sized
 * to roughly match the page's own max-width so nothing jumps once data lands.
 */
export function PageLoading({
  eyebrow,
  title,
  maxWidth = '1100px',
  panelCount = 2,
  panelHeight = 220,
}: {
  eyebrow: string
  title: string
  maxWidth?: string
  panelCount?: number
  panelHeight?: number
}) {
  return (
    <>
      <DashboardHeader eyebrow={eyebrow} title={title} description="Loading…" />
      <main id="dashboard-main" className="console-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8" style={{ maxWidth }}>
          {Array.from({ length: panelCount }).map((_, i) => (
            <PanelSkeleton key={i} height={panelHeight} />
          ))}
        </div>
      </main>
    </>
  )
}

export default PageLoading

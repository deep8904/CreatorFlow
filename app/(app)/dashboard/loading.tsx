import { DashboardHeader } from '@/components/dash/DashboardHeader'
import { DashSkeleton } from '@/components/dash/DashSkeleton'

/**
 * The dashboard is a server component awaiting several queries, so Next's
 * `loading.tsx` is the right hook. Real chrome renders immediately (no name,
 * no data) so the frame doesn't jump once the queries land.
 */
export default function DashboardLoading() {
  return (
    <>
      <DashboardHeader eyebrow="Dashboard" title="Dashboard" description="Loading your workspace…" />
      <main id="dashboard-main" className="console-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 2xl:max-w-[1360px]">
          <DashSkeleton />
        </div>
      </main>
    </>
  )
}

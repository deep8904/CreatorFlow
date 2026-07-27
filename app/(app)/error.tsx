'use client'

import DashError from '@/components/dash/DashError'

/**
 * Group-level boundary, so all nine `(app)` screens inherit one error surface.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <DashError error={error} reset={reset} />
}

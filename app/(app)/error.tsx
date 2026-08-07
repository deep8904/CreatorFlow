'use client'

import DashError from '@/components/dash/DashError'

/**
 * Group-level boundary, so every `(app)` screen inherits one error surface.
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

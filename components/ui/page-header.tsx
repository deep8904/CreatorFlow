import type { ReactNode } from 'react'

/**
 * Every in-app + auth page title. Collapses three previously-unrelated
 * heading scales (.text-app-h1, a one-off text-[26px]/[28px] scale used
 * only on Login/Onboarding, and Drafts having no page-level title at all)
 * into one.
 */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-end justify-between mb-8 gap-4">
      <div>
        <h1 className="text-app-h1 text-carbon">{title}</h1>
        {description && <p className="text-[12.5px] text-ash mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}

import type { ReactNode } from 'react'

/**
 * The icon + message + optional CTA empty-state pattern already used
 * consistently across Dashboard/Deals/Ideas/Drafts/Automations/Analytics —
 * formalized into one component so it stays that way.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="w-11 h-11 rounded-xl bg-fog flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-[14px] font-semibold text-carbon mb-1">{title}</p>
        {description && <p className="text-[13px] text-graphite max-w-[340px] mx-auto">{description}</p>}
      </div>
      {action}
    </div>
  )
}

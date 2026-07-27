function Bone({ className = '' }: { className?: string }) {
  return <div className={`console-skeleton rounded-[8px] ${className}`} />
}

export function MetricGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
          <Bone className="h-2.5 w-16" />
          <Bone className="mt-3 h-6 w-20" />
          <Bone className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

export function PanelSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="rounded-[1.25rem] border border-white/[0.06] bg-white/[0.02] p-5">
      <Bone className="h-3 w-28" />
      <div className="mt-4" style={{ height }}>
        <Bone className="h-full w-full" />
      </div>
    </div>
  )
}

export function DashSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <MetricGridSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <PanelSkeleton height={200} />
        <PanelSkeleton height={200} />
      </div>
    </div>
  )
}

export default DashSkeleton

export function AuthSteps({ current, total = 2 }: { current: 1 | 2; total?: number }) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={`Step ${current} of ${total}`}>
      <span className="sr-only">
        Step {current} of {total}
      </span>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={`h-[3px] w-8 rounded-[2px] transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${i < current ? 'bg-orange-500' : 'bg-white/10'}`}
        />
      ))}
    </div>
  )
}

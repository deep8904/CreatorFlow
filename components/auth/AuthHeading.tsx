import type { ReactNode } from 'react'

export function AuthHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow?: string
  title: string
  subtitle?: ReactNode
  align?: 'center' | 'start'
}) {
  const centered = align === 'center'
  return (
    <div className={`auth-enter mb-7 sm:mb-8 ${centered ? 'text-center' : 'text-left'}`}>
      {eyebrow && (
        <p className={`mb-2.5 flex items-center gap-2 font-nebula-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-500 ${centered ? 'justify-center' : ''}`}>
          <span aria-hidden className="h-1 w-1 rotate-45 bg-orange-500" />
          {eyebrow}
        </p>
      )}
      <h1
        className={`bg-gradient-to-b from-white to-white/70 bg-clip-text pb-[0.12em] font-nebula-heading text-[26px] font-semibold leading-[1.12] tracking-[-0.02em] text-transparent sm:text-[30px] lg:text-[34px] ${centered ? 'mx-auto max-w-[22ch] text-balance' : ''}`}
      >
        {title}
      </h1>
      {subtitle && (
        <p className={`mt-3 font-nebula-ui text-[14px] leading-relaxed text-zinc-400 sm:text-[15px] ${centered ? 'mx-auto max-w-[38ch]' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

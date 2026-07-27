import type { CSSProperties, ComponentPropsWithoutRef } from 'react'

type AuthCardProps = {
  as?: 'div' | 'form'
  className?: string
} & (ComponentPropsWithoutRef<'div'> | ComponentPropsWithoutRef<'form'>)

export function AuthCard({ as = 'div', className = '', ...rest }: AuthCardProps) {
  const Comp = as as 'div'
  return (
    <Comp
      className={`nebula-border auth-enter relative overflow-hidden rounded-[2rem] bg-white/[0.035] p-5 shadow-[0_28px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-7 ${className}`}
      style={
        {
          '--nebula-border-gradient': 'linear-gradient(150deg, rgba(255,255,255,0.22), rgba(255,255,255,0.03) 46%, rgba(234,88,12,0.18))',
          animationDelay: '80ms',
        } as CSSProperties
      }
      {...(rest as ComponentPropsWithoutRef<'div'>)}
    />
  )
}

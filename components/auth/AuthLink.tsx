import Link, { type LinkProps } from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

type AuthLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    className?: string
    children: ReactNode
  }

export function AuthLink({ href, className = '', children, ...rest }: AuthLinkProps) {
  return (
    <Link
      href={href}
      className={`relative rounded font-nebula-ui text-[13px] font-medium text-zinc-400 transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-white after:absolute after:inset-x-0 after:-inset-y-3 after:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400 ${className}`}
      {...rest}
    >
      {children}
    </Link>
  )
}

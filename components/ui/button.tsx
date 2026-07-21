import Link from 'next/link'
import { cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * The one button component for the whole product. variant="primary" reuses
 * the .btn-editorial* sweep-fill CSS classes (same mechanic at three sizes)
 * so marketing and in-app primary buttons are pixel-identical instead of
 * independently hand-copied. Non-primary variants compose directly from
 * design tokens since no shared CSS class existed for them before this.
 */

const nonPrimaryVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        secondary: 'border border-fog text-carbon hover:bg-mist',
        ghost: 'text-graphite hover:text-carbon hover:bg-mist',
        /* Max severity communicated by weight (solid carbon fill), not a
           red hue the palette doesn't have — matches the delete-account
           confirm button, the one place this severity level already existed. */
        destructive: 'bg-carbon text-linen hover:opacity-90',
      },
      size: {
        sm: 'text-[13px] px-[1.1rem] py-[0.5rem]',
        md: 'text-[13px] px-5 py-2.5',
        lg: 'text-[14px] px-7 py-[0.9rem]',
      },
    },
  },
)

const primaryClassBySize = {
  sm: 'btn-editorial-compact',
  md: 'btn-editorial-md',
  lg: 'btn-editorial',
} as const

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'

interface BaseProps {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  className?: string
  children?: ReactNode
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & { href?: undefined }

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & { href: string }

export type ButtonProps = ButtonAsButton | ButtonAsLink

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  className,
  children,
  ...props
}: ButtonProps) {
  const isPrimary = variant === 'primary'
  const classes = cn(
    isPrimary ? primaryClassBySize[size] : nonPrimaryVariants({ variant, size }),
    loading && 'pointer-events-none opacity-70',
    className,
  )

  const content = (
    <span className={cn('flex items-center justify-center gap-2', isPrimary && 'relative z-10')}>
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <>
          {iconLeft}
          {children}
          {iconRight && <span className="icon-arrow inline-flex">{iconRight}</span>}
        </>
      )}
    </span>
  )

  if ('href' in props && props.href) {
    const { href, ...rest } = props as ButtonAsLink
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  const { disabled, ...rest } = props as ButtonAsButton
  return (
    <button type="button" className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  )
}

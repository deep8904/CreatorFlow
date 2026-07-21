import { cn } from '@/lib/utils'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

/**
 * Standardizes form-input radius: in-app inputs were rounded-xl,
 * Login/Onboarding inputs had no radius class at all (sharp corners).
 */
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full bg-linen border border-fog rounded-xl px-3.5 py-2.5 text-[14px] text-carbon placeholder-ash outline-none transition-colors focus:border-lavender/60',
        className,
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full bg-linen border border-fog rounded-xl px-3.5 py-2.5 text-[14px] text-carbon placeholder-ash outline-none transition-colors focus:border-lavender/60 resize-none',
        className,
      )}
      {...props}
    />
  )
}

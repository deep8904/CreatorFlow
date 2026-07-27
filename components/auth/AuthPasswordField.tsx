'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { HOVER, FOCUS_INSET } from '@/components/dash/tokens'
import { AuthField, type AuthFieldProps } from './AuthField'

export function AuthPasswordField(props: Omit<AuthFieldProps, 'type' | 'trailing'>) {
  const [shown, setShown] = useState(false)
  return (
    <AuthField
      {...props}
      type={shown ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? 'Hide password' : 'Show password'}
          aria-pressed={shown}
          className={`absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[10px] text-zinc-500 hover:text-zinc-200 ${HOVER} ${FOCUS_INSET}`}
        >
          {shown ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
        </button>
      }
    />
  )
}

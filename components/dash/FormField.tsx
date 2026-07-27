import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { FOCUS } from './tokens'

const fieldClass =
  'w-full rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2 font-nebula-ui text-[13.5px] text-zinc-100 placeholder:text-zinc-600'

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block font-nebula-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500"
    >
      {children}
    </label>
  )
}

export function FieldInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${FOCUS} ${props.className ?? ''}`} />
}

export function FieldTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldClass} resize-none ${FOCUS} ${props.className ?? ''}`} />
}

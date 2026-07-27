import { Search } from 'lucide-react'
import { FOCUS } from './tokens'

export function SearchField({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <Search size={13} strokeWidth={2} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`h-9 w-full rounded-[9999px] border border-white/10 bg-white/[0.04] pl-8 pr-3.5 font-nebula-ui text-[12.5px] text-zinc-100 placeholder:text-zinc-600 ${FOCUS}`}
      />
    </div>
  )
}

export default SearchField

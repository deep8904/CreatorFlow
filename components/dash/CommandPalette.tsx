'use client'

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Handshake, Lightbulb, FileText } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { canAccessModule, type ModuleKey } from '@/lib/roles'
import type { Role } from '@/lib/supabase/types'
import { primaryNav, secondaryNav } from './nav'
import { createDraft, createDeal } from '@/lib/supabase/actions'
import { QuickIdeaForm } from './QuickIdeaForm'
import { FOCUS, FOCUS_INSET, HOVER } from './tokens'
import { useToast } from '@/lib/toast'
import { useEscapeKey } from '@/lib/useEscapeKey'

type CaptureType = 'idea' | 'draft' | 'deal'
type Mode = 'list' | CaptureType

type PaletteItem =
  | { kind: 'capture'; type: CaptureType; label: string; icon: LucideIcon; module: ModuleKey }
  | { kind: 'nav'; label: string; href: string; icon: LucideIcon; module: ModuleKey }

const CAPTURE_ITEMS: { type: CaptureType; label: string; icon: LucideIcon; module: ModuleKey }[] = [
  { type: 'deal', label: 'New deal', icon: Handshake, module: 'deals' },
  { type: 'idea', label: 'New idea', icon: Lightbulb, module: 'ideas' },
  { type: 'draft', label: 'New draft', icon: FileText, module: 'drafts' },
]

function QuickDraftForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const router = useRouter()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const create = async () => {
    setIsCreating(true)
    const { id, error } = await createDraft(title.trim() || undefined)
    setIsCreating(false)
    if (error || !id) {
      toast.error(error ?? 'Could not create the draft. Please try again.')
      return
    }
    onCreated()
    // Drafts are meant to be written in, unlike a self-contained idea/deal
    // record — landing in the editor is the natural next step here, not
    // friction, since the palette already removed the friction of getting
    // to this point at all.
    router.push('/drafts')
  }

  return (
    <div className="flex flex-col gap-3 p-5">
      <input
        autoFocus
        placeholder="Draft title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) create()
        }}
        className={`min-w-0 flex-1 bg-transparent font-nebula-ui text-[15px] text-white outline-none placeholder:text-zinc-600 ${FOCUS}`}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={create}
          disabled={isCreating}
          className={`nebula-cta-static inline-flex h-9 items-center rounded-[9999px] px-4 font-nebula-tech text-[12.5px] font-medium disabled:pointer-events-none disabled:opacity-50 ${FOCUS}`}
        >
          <span className="nebula-cta__label">{isCreating ? 'Creating…' : 'Create draft'}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`inline-flex h-9 items-center rounded-[9999px] px-4 font-nebula-ui text-[12.5px] font-medium text-zinc-400 hover:bg-white/[0.05] hover:text-white ${HOVER} ${FOCUS}`}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function QuickDealForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const toast = useToast()
  const [brandName, setBrandName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const create = async () => {
    if (!brandName.trim()) return
    setIsCreating(true)
    const result = await createDeal({ brand_name: brandName })
    setIsCreating(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    onCreated()
  }

  return (
    <div className="flex flex-col gap-3 p-5">
      <input
        autoFocus
        placeholder="Brand name"
        value={brandName}
        onChange={(e) => setBrandName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) create()
        }}
        className={`min-w-0 flex-1 bg-transparent font-nebula-ui text-[15px] text-white outline-none placeholder:text-zinc-600 ${FOCUS}`}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={create}
          disabled={!brandName.trim() || isCreating}
          className={`nebula-cta-static inline-flex h-9 items-center rounded-[9999px] px-4 font-nebula-tech text-[12.5px] font-medium disabled:pointer-events-none disabled:opacity-50 ${FOCUS}`}
        >
          <span className="nebula-cta__label">{isCreating ? 'Creating…' : 'Create deal'}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`inline-flex h-9 items-center rounded-[9999px] px-4 font-nebula-ui text-[12.5px] font-medium text-zinc-400 hover:bg-white/[0.05] hover:text-white ${HOVER} ${FOCUS}`}
        >
          Cancel
        </button>
      </div>
      <Link
        href="/deals?new=1"
        onClick={onCancel}
        className={`self-start font-nebula-ui text-[11.5px] text-zinc-500 hover:text-zinc-300 ${HOVER}`}
      >
        Need contact, rate, or deliverables? Open the full form →
      </Link>
    </div>
  )
}

/**
 * Global Cmd/Ctrl+K palette, mounted once at the app-shell level. Every
 * capture path calls the same server actions the full pages use — this is
 * a second entry point into the same data, not a parallel system — and
 * closing on success relies on router.refresh() rather than each action's
 * own revalidatePath() targets, since the palette can be triggered from any
 * page, not just the one a given action happens to revalidate.
 */
export function CommandPalette({ role }: { role: Role }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('list')
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!open) return
    // Deferred a tick — this project's stricter react-hooks/set-state-in-
    // effect rule flags a direct setState call in an effect body (same
    // reason useSpeechCapture defers its own setState this way).
    queueMicrotask(() => {
      setMode('list')
      setQuery('')
      setActiveIndex(0)
    })
    // Fixed overlay isn't mounted yet on the same tick this effect runs.
    const id = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [open])

  useEscapeKey(() => {
    if (!open) return
    if (mode !== 'list') {
      setMode('list')
      return
    }
    setOpen(false)
  })

  const items: PaletteItem[] = [
    ...CAPTURE_ITEMS.map((c) => ({ kind: 'capture' as const, ...c })),
    ...primaryNav.map((n) => ({ kind: 'nav' as const, label: `Go to ${n.label}`, href: n.href, icon: n.icon, module: n.module })),
    ...secondaryNav.map((n) => ({ kind: 'nav' as const, label: `Go to ${n.label}`, href: n.href, icon: n.icon, module: n.module })),
  ].filter((item) => canAccessModule(role, item.module))

  const trimmedQuery = query.trim().toLowerCase()
  const filtered = trimmedQuery ? items.filter((item) => item.label.toLowerCase().includes(trimmedQuery)) : items
  const clampedIndex = Math.min(activeIndex, Math.max(filtered.length - 1, 0))

  const selectItem = (item: PaletteItem) => {
    if (item.kind === 'nav') {
      setOpen(false)
      router.push(item.href)
      return
    }
    setMode(item.type)
  }

  const handleCaptured = () => {
    setOpen(false)
    router.refresh()
  }

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[clampedIndex]
      if (item) selectItem(item)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 px-4 pt-[12vh]"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick capture and navigation"
        onClick={(e) => e.stopPropagation()}
        className="nebula-border relative w-full max-w-[560px] overflow-hidden rounded-[1.25rem] bg-[#0e0e10] backdrop-blur-xl"
        style={
          {
            '--nebula-border-gradient':
              'linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.03) 50%, rgba(234,88,12,0.1))',
          } as CSSProperties
        }
      >
        {mode === 'list' ? (
          <>
            <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3.5">
              <Search size={15} strokeWidth={2} className="shrink-0 text-zinc-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search or jump to…"
                aria-label="Search actions and pages"
                className={`min-w-0 flex-1 bg-transparent font-nebula-ui text-[14px] text-white outline-none placeholder:text-zinc-600 ${FOCUS}`}
              />
              <kbd className="shrink-0 rounded-[6px] border border-white/10 px-1.5 py-0.5 font-nebula-mono text-[10px] text-zinc-500">
                Esc
              </kbd>
            </div>
            <div className="console-scroll max-h-[360px] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <p className="px-4 py-6 text-center font-nebula-ui text-[12.5px] text-zinc-500">No matches.</p>
              ) : (
                filtered.map((item, i) => {
                  const Icon = item.icon
                  const key = item.kind === 'nav' ? item.href : `capture-${item.type}`
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => selectItem(item)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-nebula-ui text-[13px] font-medium ${FOCUS_INSET} ${
                        i === clampedIndex ? 'bg-white/[0.07] text-white' : 'text-zinc-300'
                      }`}
                    >
                      <Icon size={14} strokeWidth={2} className="shrink-0 text-orange-400/80" />
                      {item.label}
                    </button>
                  )
                })
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
              <h2 className="font-nebula-heading text-[14px] font-semibold text-white">
                {mode === 'idea' ? 'New idea' : mode === 'draft' ? 'New draft' : 'New deal'}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className={`grid h-7 w-7 place-items-center rounded-[9999px] text-zinc-500 hover:bg-white/[0.08] hover:text-white ${HOVER} ${FOCUS_INSET}`}
              >
                <span className="text-[14px] leading-none">×</span>
              </button>
            </div>
            {mode === 'idea' && <div className="p-5"><QuickIdeaForm onSaved={handleCaptured} onCancel={() => setMode('list')} /></div>}
            {mode === 'draft' && <QuickDraftForm onCreated={handleCaptured} onCancel={() => setMode('list')} />}
            {mode === 'deal' && <QuickDealForm onCreated={handleCaptured} onCancel={() => setMode('list')} />}
          </>
        )}
      </div>
    </div>
  )
}

export default CommandPalette

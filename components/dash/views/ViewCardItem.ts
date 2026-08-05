/**
 * Shared shape TableView/GalleryView/BoardView consume — same principle as
 * CalendarView's `CalendarItem` (Stage 2.3): these renderers have zero
 * knowledge of Ideas/Drafts/any record type, only this generic shape. Each
 * page maps its own records into it; the renderers never change when a new
 * module adopts multi-view.
 */
export type ViewCardTone = 'default' | 'attention' | 'positive'

export type ViewCardItem = {
  id: string
  title: string
  /** Short status/date-ish line, e.g. a stage label or "Due Aug 12". */
  meta?: string
  /** One or two lines of body/notes preview. */
  preview?: string
  tags?: string[]
  tone?: ViewCardTone
  href: string
}

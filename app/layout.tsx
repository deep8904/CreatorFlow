import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono, Manrope, Inter, Geist, Geist_Mono } from 'next/font/google'
import { ToastProvider } from '@/lib/toast'
import { ToastViewport } from '@/components/ui/toast'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-archivo',
})

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-mono',
})

/* Nebula system (DESIGN.md, Home page). Manrope = headings, Inter = UI,
   Geist/Geist Mono = technical labels, buttons, monospace accents. */
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
})

const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-geist',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'CreatorFlow — Fewer dropped ideas. More consistent you.',
  description:
    'Every idea captured before it slips away. Every brand deal tracked so nothing falls through the cracks. A faster path from idea to published. And a clear read on what\'s actually working.',
  generator: 'v0.app',
}

/*
 * Dark by default sitewide (DESIGN.md). Every current page already paints
 * its own explicit background (`.nebula-*` wrappers, or `bg-linen` on the
 * still-Swiss Team/Settings/Automations `<main>`), so this only affects the
 * root paint before hydration and any edge/overscroll gutter — verified via
 * `app/(app)/layout.tsx` no longer needing its own colorScheme override.
 */
export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable} ${manrope.variable} ${inter.variable} ${geist.variable} ${geistMono.variable} bg-black`}
    >
      <body className="antialiased font-sans">
        <ToastProvider>
          {children}
          <ToastViewport />
        </ToastProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

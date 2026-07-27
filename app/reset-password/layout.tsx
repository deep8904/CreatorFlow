import type { ReactNode } from 'react'

// The route's page.tsx is 'use client', and Next.js forbids a `viewport` export from a client
// component — hence this tiny server wrapper. See GROUP5_DECISION §3.6.
export const viewport = { colorScheme: 'dark' as const, themeColor: '#000000' }

export default function Layout({ children }: { children: ReactNode }) {
  return children
}

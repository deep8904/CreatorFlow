import type { Metadata } from 'next'
import { BarChart2 } from 'lucide-react'
import { getIntegrations } from '@/lib/supabase/queries'

export const metadata: Metadata = { title: 'Analytics — CreatorFlow' }

export default async function AnalyticsPage() {
  const integrations = await getIntegrations()
  const youtubeConnected = integrations.some((i) => i.provider === 'youtube')

  return (
    <main className="flex-1 overflow-y-auto bg-linen">
      <div className="max-w-[960px] mx-auto px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bold text-carbon" style={{ fontSize: '20px', letterSpacing: '-0.04em' }}>Analytics</h1>
          <p className="text-[12.5px] text-ash mt-0.5">Your YouTube channel performance</p>
        </div>

        {!youtubeConnected ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="w-11 h-11 rounded-2xl bg-fog flex items-center justify-center">
              <BarChart2 size={18} className="text-ash" strokeWidth={1.8} />
            </div>
            <p className="text-[14px] font-semibold text-carbon">Connect YouTube to see your performance here.</p>
            <button className="text-[13px] font-semibold text-paper-white bg-lavender px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity">
              Connect YouTube
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-24 text-center">
            <p className="text-[14px] font-semibold text-carbon">No data yet.</p>
            <p className="text-[13px] text-graphite">Performance data will appear here once YouTube finishes syncing.</p>
          </div>
        )}
      </div>
    </main>
  )
}

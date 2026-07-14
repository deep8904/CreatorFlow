'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/lib/supabase/actions'

interface Props {
  fullName: string
  email: string
  gmailConnected: boolean
  youtubeConnected: boolean
}

export default function SettingsBoard({ fullName, email, gmailConnected, youtubeConnected }: Props) {
  const [name, setName] = useState(fullName)
  const [isPending, startTransition] = useTransition()

  const save = () => {
    startTransition(() => {
      updateProfile(name)
    })
  }

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '—'

  return (
    <main className="flex-1 overflow-y-auto bg-linen">
      <div className="max-w-[680px] mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="font-bold text-carbon" style={{ fontSize: '20px', letterSpacing: '-0.04em' }}>Settings</h1>
      </div>

      <div className="flex flex-col gap-6">

        {/* Profile */}
        <section className="bg-paper-white border border-fog rounded-2xl p-6" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
          <h2 className="text-[14px] font-semibold text-carbon mb-4">Profile</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-lavender/10 flex items-center justify-center shrink-0">
                <span className="text-[15px] font-bold text-lavender">{initials}</span>
              </div>
              <button className="text-[13px] font-medium text-graphite border border-fog px-4 py-2 rounded-full hover:bg-linen transition-colors">
                Change photo
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-label text-[11px] font-semibold text-ash uppercase tracking-wider block mb-1.5">Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-linen border border-fog rounded-xl px-3.5 py-2.5 text-[14px] text-carbon outline-none focus:border-lavender/60 transition-colors"
                />
              </div>
              <div>
                <label className="font-label text-[11px] font-semibold text-ash uppercase tracking-wider block mb-1.5">Email</label>
                <input
                  defaultValue={email}
                  disabled
                  className="w-full bg-linen border border-fog rounded-xl px-3.5 py-2.5 text-[14px] text-carbon outline-none disabled:opacity-70"
                />
              </div>
            </div>
            <button
              onClick={save}
              disabled={isPending}
              className="text-[13px] font-medium text-paper-white bg-lavender px-5 py-2.5 rounded-full w-fit hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Save changes
            </button>
          </div>
        </section>

        {/* Connected accounts */}
        <section className="bg-paper-white border border-fog rounded-2xl p-6" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
          <h2 className="text-[14px] font-semibold text-carbon mb-4">Connected accounts</h2>
          <div className="flex flex-col divide-y divide-fog">
            {[
              {
                name: 'Gmail',
                connected: gmailConnected,
                description: 'Brand deal email detection',
                iconBg: 'bg-sky/10',
                icon: (
                  <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                    <rect width="18" height="14" rx="2" fill="#38BDF8"/>
                    <path d="M2 3l7 5 7-5" stroke="#000" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                ),
              },
              {
                name: 'YouTube',
                connected: youtubeConnected,
                description: 'Channel analytics and performance',
                iconBg: 'bg-[#ff0000]/10',
                icon: (
                  <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
                    <rect width="18" height="13" rx="3" fill="#FF0000"/>
                    <path d="M7 4l6 2.5-6 2.5V4z" fill="white"/>
                  </svg>
                ),
              },
            ].map((acct) => (
              <div key={acct.name} className="flex items-center gap-4 py-4">
                <div className={`w-10 h-10 rounded-xl ${acct.iconBg} flex items-center justify-center shrink-0`}>
                  {acct.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-carbon">{acct.name}</p>
                  <p className="text-[12px] text-ash">
                    {acct.connected ? `Connected as ${email}` : acct.description}
                  </p>
                </div>
                <button
                  className={`text-[12px] font-medium px-4 py-2 rounded-full transition-colors ${
                    acct.connected
                      ? 'text-graphite border border-fog hover:bg-linen'
                      : 'text-paper-white bg-lavender hover:opacity-90'
                  }`}
                >
                  {acct.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Data export */}
        <section className="bg-paper-white border border-fog rounded-2xl p-6" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
          <h2 className="text-[14px] font-semibold text-carbon mb-1">Data export</h2>
          <p className="text-[13px] text-graphite mb-4">
            Download everything you&apos;ve put into CreatorFlow — deals, ideas, drafts, and settings — as files you can keep, any time.
          </p>
          <button className="text-[13px] font-medium text-carbon border border-fog px-5 py-2.5 rounded-full hover:bg-linen transition-colors">
            Export my data
          </button>
        </section>

        {/* Danger zone */}
        <section className="bg-paper-white border border-fog rounded-2xl p-6" style={{ boxShadow: 'rgba(0,0,0,0.04) 0px 1px 2px 0px' }}>
          <h2 className="text-[14px] font-semibold text-carbon mb-1">Delete account</h2>
          <p className="text-[13px] text-graphite mb-4">
            This permanently deletes your account and data. You can export your data first below.
          </p>
          <button className="text-[13px] font-medium text-ember border border-ember/30 px-5 py-2.5 rounded-full hover:bg-ember/5 transition-colors">
            Delete account
          </button>
        </section>
      </div>
      </div>
    </main>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

type Step = 'welcome' | 'youtube' | 'gmail' | 'done'

const STEPS: Step[] = ['welcome', 'youtube', 'gmail', 'done']

function StepIndicator({ current }: { current: Step }) {
  const index = STEPS.indexOf(current)
  return (
    <div className="flex items-center gap-2">
      {STEPS.filter((s) => s !== 'welcome').map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full transition-colors ${
              i < index - 1 ? 'bg-mint' : i === index - 1 ? 'bg-lavender' : 'bg-fog'
            }`}
          />
          {i < 2 && <div className="h-px w-8 bg-fog" />}
        </div>
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('welcome')
  const [youtubeConnected, setYoutubeConnected] = useState(false)
  const [gmailConnected, setGmailConnected] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-linen">
      {/* Minimal nav */}
      <header className="flex w-full items-center justify-between border-b border-fog px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" stroke="#F97316" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="4" fill="#F97316" />
          </svg>
          <span className="text-[15px] font-semibold text-white">CreatorFlow</span>
        </Link>
        {step !== 'welcome' && step !== 'done' && <StepIndicator current={step} />}
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[480px]">
          {/* Step: Welcome */}
          {step === 'welcome' && (
            <div className="flex flex-col items-center gap-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lavender/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.3L12 17l-6.2 4.8 2.4-7.3L2 10.2h7.6L12 2z"
                    stroke="#F97316"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h1 className="mb-3 text-[28px] font-semibold leading-tight tracking-tight text-white">
                  Let&apos;s get your creator business set up.
                </h1>
                <p className="font-body-editorial text-[16px] leading-relaxed text-graphite">
                  This takes about five minutes — and you can skip any step and come back later.
                </p>
              </div>
              <button onClick={() => setStep('youtube')} className="btn-editorial w-full">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Get started
                  <ArrowRight size={15} className="icon-arrow" />
                </span>
              </button>
            </div>
          )}

          {/* Step: YouTube */}
          {step === 'youtube' && (
            <div className="flex flex-col gap-8">
              <div>
                <p className="font-label mb-2 text-[11px] uppercase tracking-widest text-ash">Step 1 of 3</p>
                <h1 className="mb-3 text-[26px] font-semibold leading-tight tracking-tight text-white">
                  Connect YouTube
                </h1>
                <p className="font-body-editorial text-[15px] leading-relaxed text-graphite">
                  Connect YouTube to see your performance alongside everything else. We only read
                  analytics — we never post or modify anything.
                </p>
              </div>

              <div className="glass-panel flex flex-col gap-5 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ff0000]/10">
                    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                      <rect width="22" height="16" rx="4" fill="#FF0000" />
                      <path d="M9 4.8l6 3.2-6 3.2V4.8z" fill="white" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white">YouTube Analytics</p>
                    <p className="text-[13px] text-graphite">Views, watch time, subscribers, top videos</p>
                  </div>
                  {youtubeConnected && (
                    <div className="ml-auto flex items-center gap-1.5 rounded-full bg-mint-wash px-2.5 py-1 text-mint">
                      <Check size={10} strokeWidth={2.5} />
                      <span className="text-[12px] font-medium">Connected</span>
                    </div>
                  )}
                </div>

                {!youtubeConnected ? (
                  <button
                    onClick={() => setYoutubeConnected(true)}
                    className="w-full border border-fog bg-linen py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-mist"
                  >
                    Connect YouTube
                  </button>
                ) : (
                  <p className="text-center text-[13px] text-graphite">
                    Connected as <span className="font-medium text-white">your-channel@gmail.com</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={() => setStep('gmail')} className="btn-editorial w-full">
                  <span className="relative z-10">Continue</span>
                </button>
                <button
                  onClick={() => setStep('gmail')}
                  className="py-2 text-[14px] font-medium text-graphite transition-colors hover:text-white"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* Step: Gmail */}
          {step === 'gmail' && (
            <div className="flex flex-col gap-8">
              <div>
                <p className="font-label mb-2 text-[11px] uppercase tracking-widest text-ash">Step 2 of 3</p>
                <h1 className="mb-3 text-[26px] font-semibold leading-tight tracking-tight text-white">
                  Connect Gmail
                </h1>
                <p className="font-body-editorial text-[15px] leading-relaxed text-graphite">
                  Connect Gmail so brand deal emails get sorted automatically. We only look at
                  sponsorship-related emails — we never read, delete, or send anything without your
                  approval.
                </p>
              </div>

              <div className="glass-panel flex flex-col gap-5 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky/10">
                    <svg width="22" height="17" viewBox="0 0 22 17" fill="none">
                      <rect width="22" height="17" rx="3" fill="#38BDF8" />
                      <path d="M2 3l9 6.5L20 3" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white">Gmail</p>
                    <p className="text-[13px] text-graphite">Brand deal detection from your inbox</p>
                  </div>
                  {gmailConnected && (
                    <div className="ml-auto flex items-center gap-1.5 rounded-full bg-mint-wash px-2.5 py-1 text-mint">
                      <Check size={10} strokeWidth={2.5} />
                      <span className="text-[12px] font-medium">Connected</span>
                    </div>
                  )}
                </div>

                {!gmailConnected ? (
                  <button
                    onClick={() => setGmailConnected(true)}
                    className="w-full border border-fog bg-linen py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-mist"
                  >
                    Connect Gmail
                  </button>
                ) : (
                  <p className="text-center text-[13px] text-graphite">
                    Connected as <span className="font-medium text-white">you@gmail.com</span>
                  </p>
                )}

                <p className="border-t border-fog pt-4 text-center text-[12px] text-ash">
                  We never read, delete, or send anything without your explicit approval.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={() => setStep('done')} className="btn-editorial w-full">
                  <span className="relative z-10">Continue</span>
                </button>
                <button
                  onClick={() => setStep('done')}
                  className="py-2 text-[14px] font-medium text-graphite transition-colors hover:text-white"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mint-wash">
                <Check size={28} className="text-mint" strokeWidth={2} />
              </div>
              <div>
                <h1 className="mb-3 text-[26px] font-semibold leading-tight tracking-tight text-white">
                  You&apos;re set up.
                </h1>
                <p className="font-body-editorial text-[15px] leading-relaxed text-graphite">
                  Here&apos;s your Dashboard. You can connect accounts or adjust settings any time.
                </p>
              </div>

              <div className="w-full rounded-lg bg-mist p-5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-graphite">YouTube</span>
                    <span className={`text-[13px] font-medium ${youtubeConnected ? 'text-mint' : 'text-ash'}`}>
                      {youtubeConnected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-graphite">Gmail</span>
                    <span className={`text-[13px] font-medium ${gmailConnected ? 'text-mint' : 'text-ash'}`}>
                      {gmailConnected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                </div>
              </div>

              <Link href="/dashboard" className="btn-editorial w-full">
                <span className="relative z-10">Go to Dashboard</span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

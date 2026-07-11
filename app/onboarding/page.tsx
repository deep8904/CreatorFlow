'use client'

import { useState } from 'react'
import Link from 'next/link'

type Step = 'welcome' | 'youtube' | 'gmail' | 'done'

const STEPS: Step[] = ['welcome', 'youtube', 'gmail', 'done']

function StepIndicator({ current }: { current: Step }) {
  const index = STEPS.indexOf(current)
  return (
    <div className="flex items-center gap-2">
      {STEPS.filter(s => s !== 'welcome').map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              i < index - 1 ? 'bg-mint' : i === index - 1 ? 'bg-lavender' : 'bg-fog'
            }`}
          />
          {i < 2 && <div className="w-8 h-px bg-fog" />}
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
    <div className="min-h-screen bg-paper-white flex flex-col">
      {/* Minimal nav */}
      <header className="w-full border-b border-fog px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-lavender flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-carbon">CreatorFlow</span>
        </Link>
        {step !== 'welcome' && step !== 'done' && (
          <StepIndicator current={step} />
        )}
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[480px]">

          {/* Step: Welcome */}
          {step === 'welcome' && (
            <div className="flex flex-col items-center text-center gap-8">
              <div className="w-14 h-14 rounded-full bg-lavender/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.3L12 17l-6.2 4.8 2.4-7.3L2 10.2h7.6L12 2z" stroke="#918df6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h1
                  className="font-bold text-carbon mb-3"
                  style={{ fontSize: '28px', lineHeight: 1.25, letterSpacing: '-0.5px' }}
                >
                  Let&apos;s get your creator business set up.
                </h1>
                <p className="text-graphite" style={{ fontSize: '16px', lineHeight: 1.55, letterSpacing: '-0.32px' }}>
                  This takes about five minutes — and you can skip any step and come back later.
                </p>
              </div>
              <button
                onClick={() => setStep('youtube')}
                className="w-full text-[14px] font-medium text-paper-white bg-lavender py-3 rounded-full hover:opacity-90 transition-opacity"
                style={{ boxShadow: 'rgba(0,0,0,0.08) 0px 1px 1px 1px, rgba(0,0,0,0.06) 0px 0px 0px 0.5px' }}
              >
                Get started
              </button>
            </div>
          )}

          {/* Step: YouTube */}
          {step === 'youtube' && (
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-[12px] font-semibold text-ash uppercase tracking-wider mb-2">Step 1 of 3</p>
                <h1
                  className="font-bold text-carbon mb-3"
                  style={{ fontSize: '26px', lineHeight: 1.25, letterSpacing: '-0.5px' }}
                >
                  Connect YouTube
                </h1>
                <p className="text-graphite" style={{ fontSize: '15px', lineHeight: 1.55, letterSpacing: '-0.25px' }}>
                  Connect YouTube to see your performance alongside everything else. We only read analytics — we never post or modify anything.
                </p>
              </div>

              {/* Connect card */}
              <div className="border border-fog rounded-2xl p-6 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#ff0000]/10 flex items-center justify-center shrink-0">
                    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                      <rect width="22" height="16" rx="4" fill="#FF0000"/>
                      <path d="M9 4.8l6 3.2-6 3.2V4.8z" fill="white"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-carbon">YouTube Analytics</p>
                    <p className="text-[13px] text-graphite">Views, watch time, subscribers, top videos</p>
                  </div>
                  {youtubeConnected && (
                    <div className="ml-auto flex items-center gap-1.5 bg-mint-wash text-mint px-2.5 py-1 rounded-full">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="#33c758" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[12px] font-medium">Connected</span>
                    </div>
                  )}
                </div>

                {!youtubeConnected ? (
                  <button
                    onClick={() => setYoutubeConnected(true)}
                    className="w-full text-[14px] font-medium text-carbon border border-fog bg-paper-white py-2.5 rounded-full hover:bg-linen transition-colors"
                    style={{ boxShadow: 'rgba(0,0,0,0.08) 0px 1px 1px 0px, rgba(0,0,0,0.05) 0px 0px 0px 1px' }}
                  >
                    Connect YouTube
                  </button>
                ) : (
                  <p className="text-[13px] text-graphite text-center">
                    Connected as <span className="font-medium text-carbon">your-channel@gmail.com</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setStep('gmail')}
                  className="w-full text-[14px] font-medium text-paper-white bg-lavender py-3 rounded-full hover:opacity-90 transition-opacity"
                  style={{ boxShadow: 'rgba(0,0,0,0.08) 0px 1px 1px 1px, rgba(0,0,0,0.06) 0px 0px 0px 0.5px' }}
                >
                  Continue
                </button>
                <button
                  onClick={() => setStep('gmail')}
                  className="w-full text-[14px] font-medium text-graphite py-2 hover:text-carbon transition-colors"
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
                <p className="text-[12px] font-semibold text-ash uppercase tracking-wider mb-2">Step 2 of 3</p>
                <h1
                  className="font-bold text-carbon mb-3"
                  style={{ fontSize: '26px', lineHeight: 1.25, letterSpacing: '-0.5px' }}
                >
                  Connect Gmail
                </h1>
                <p className="text-graphite" style={{ fontSize: '15px', lineHeight: 1.55, letterSpacing: '-0.25px' }}>
                  Connect Gmail so brand deal emails get sorted automatically. We only look at sponsorship-related emails — we never read, delete, or send anything without your approval.
                </p>
              </div>

              {/* Connect card */}
              <div className="border border-fog rounded-2xl p-6 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky/10 flex items-center justify-center shrink-0">
                    <svg width="22" height="17" viewBox="0 0 22 17" fill="none">
                      <rect width="22" height="17" rx="3" fill="#2c78fc"/>
                      <path d="M2 3l9 6.5L20 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-carbon">Gmail</p>
                    <p className="text-[13px] text-graphite">Brand deal detection from your inbox</p>
                  </div>
                  {gmailConnected && (
                    <div className="ml-auto flex items-center gap-1.5 bg-mint-wash text-mint px-2.5 py-1 rounded-full">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="#33c758" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[12px] font-medium">Connected</span>
                    </div>
                  )}
                </div>

                {!gmailConnected ? (
                  <button
                    onClick={() => setGmailConnected(true)}
                    className="w-full text-[14px] font-medium text-carbon border border-fog bg-paper-white py-2.5 rounded-full hover:bg-linen transition-colors"
                    style={{ boxShadow: 'rgba(0,0,0,0.08) 0px 1px 1px 0px, rgba(0,0,0,0.05) 0px 0px 0px 1px' }}
                  >
                    Connect Gmail
                  </button>
                ) : (
                  <p className="text-[13px] text-graphite text-center">
                    Connected as <span className="font-medium text-carbon">you@gmail.com</span>
                  </p>
                )}

                <p className="text-[12px] text-ash text-center border-t border-fog pt-4">
                  We never read, delete, or send anything without your explicit approval.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setStep('done')}
                  className="w-full text-[14px] font-medium text-paper-white bg-lavender py-3 rounded-full hover:opacity-90 transition-opacity"
                  style={{ boxShadow: 'rgba(0,0,0,0.08) 0px 1px 1px 1px, rgba(0,0,0,0.06) 0px 0px 0px 0.5px' }}
                >
                  Continue
                </button>
                <button
                  onClick={() => setStep('done')}
                  className="w-full text-[14px] font-medium text-graphite py-2 hover:text-carbon transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="flex flex-col items-center text-center gap-8">
              <div className="w-16 h-16 rounded-full bg-mint-wash flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6 14l5 5 11-11" stroke="#33c758" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h1
                  className="font-bold text-carbon mb-3"
                  style={{ fontSize: '26px', lineHeight: 1.25, letterSpacing: '-0.5px' }}
                >
                  You&apos;re set up.
                </h1>
                <p className="text-graphite" style={{ fontSize: '15px', lineHeight: 1.55, letterSpacing: '-0.25px' }}>
                  Here&apos;s your Dashboard. You can connect accounts or adjust settings any time.
                </p>
              </div>

              {/* Summary */}
              <div className="w-full bg-linen rounded-2xl p-5 flex flex-col gap-3">
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

              <Link
                href="/dashboard"
                className="w-full text-center text-[14px] font-medium text-paper-white bg-lavender py-3 rounded-full hover:opacity-90 transition-opacity"
                style={{ boxShadow: 'rgba(0,0,0,0.08) 0px 1px 1px 1px, rgba(0,0,0,0.06) 0px 0px 0px 0.5px' }}
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

'use client'

import { Suspense, useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Check, Mail } from 'lucide-react'
import { signUpWithEmail } from '@/lib/supabase/auth'
import { Logo } from '@/components/ui/logo'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { GmailGlyph, YouTubeGlyph } from '@/components/ui/oauth-glyphs'

type Step = 'welcome' | 'check-email' | 'youtube' | 'gmail' | 'done'

const STEPS: Step[] = ['welcome', 'youtube', 'gmail', 'done']

function StepIndicator({ current }: { current: Step }) {
  const index = STEPS.indexOf(current)
  return (
    <div className="flex items-center gap-2">
      {STEPS.filter((s) => s !== 'welcome').map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full transition-colors ${
              i < index - 1 ? 'bg-lavender' : i === index - 1 ? 'bg-lavender' : 'bg-fog'
            }`}
          />
          {i < 2 && <div className="h-px w-8 bg-fog" />}
        </div>
      ))}
    </div>
  )
}

/** Honest "connect" affordance — matches Settings' disabled-with-tooltip pattern
    rather than faking a working OAuth connection. */
function ConnectRow({ icon, name, description }: { icon: ReactNode; name: string; description: string }) {
  return (
    <div className="glass-panel flex flex-col gap-5 rounded-xl p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-fog text-carbon">{icon}</div>
        <div>
          <p className="text-[14px] font-semibold text-carbon">{name}</p>
          <p className="text-[13px] text-graphite">{description}</p>
        </div>
      </div>
      <span
        title="Connecting a real account requires production Google OAuth credentials"
        className="w-full rounded-full border border-fog py-2.5 text-center text-[14px] font-medium text-ash opacity-60 cursor-not-allowed"
      >
        Connect {name}
      </span>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingFlow />
    </Suspense>
  )
}

function OnboardingFlow() {
  const searchParams = useSearchParams()
  const nextHref = searchParams.get('next') || '/dashboard'
  const [step, setStep] = useState<Step>('welcome')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !password) return
    setIsSubmitting(true)
    setError(null)
    try {
      const { data, error: signUpError } = await signUpWithEmail(email.trim(), password, {
        full_name: fullName.trim(),
      })
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      // If email confirmation is required on this Supabase project, signUp()
      // returns a user but no session — there's nothing authenticated to do
      // yet, so stop here rather than walking through steps that need a
      // signed-in user.
      setStep(data.session ? 'youtube' : 'check-email')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-linen">
      {/* Minimal nav */}
      <header className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-fog px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Logo size={24} />
          <span className="text-[15px] font-semibold text-carbon">CreatorFlow</span>
        </Link>
        {(step === 'youtube' || step === 'gmail') && <StepIndicator current={step} />}
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[480px]">
          {/* Step: Welcome — real signup form */}
          {step === 'welcome' && (
            <div className="flex flex-col gap-8">
              <div className="text-center">
                <h1 className="text-auth-h1 mb-3 text-carbon">Let&apos;s get your creator business set up.</h1>
                <p className="font-body-editorial text-[16px] leading-relaxed text-graphite">
                  Takes about a minute. Free, no credit card.
                </p>
              </div>

              <form onSubmit={handleSignUp} className="glass-panel flex flex-col gap-4 rounded-xl p-6">
                <div>
                  <Label htmlFor="onboard-name">Full name</Label>
                  <Input
                    id="onboard-name"
                    autoFocus
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Priya Nair"
                  />
                </div>
                <div>
                  <Label htmlFor="onboard-email">Email</Label>
                  <Input
                    id="onboard-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="onboard-password">Password</Label>
                  <Input
                    id="onboard-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                {error && <p className="text-[13px] font-semibold text-carbon">{error}</p>}

                <Button
                  type="submit"
                  size="lg"
                  className="mt-2 w-full"
                  disabled={isSubmitting || !fullName.trim() || !email.trim() || !password}
                  loading={isSubmitting}
                  iconRight={!isSubmitting ? <ArrowRight size={15} /> : undefined}
                >
                  {isSubmitting ? 'Creating account…' : 'Get started'}
                </Button>
              </form>

              <p className="text-center text-[12.5px] text-ash">
                Already have an account?{' '}
                <Link
                  href={searchParams.get('next') ? `/login?next=${encodeURIComponent(searchParams.get('next')!)}` : '/login'}
                  className="font-medium text-carbon hover:text-lavender transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* Step: Check email (only reached if the project requires email confirmation) */}
          {step === 'check-email' && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lavender/10">
                <Mail size={22} className="text-lavender" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-auth-h1 mb-3 text-carbon">Check your inbox.</h1>
                <p className="font-body-editorial text-[15px] leading-relaxed text-graphite">
                  We sent a confirmation link to <span className="font-semibold text-carbon">{email}</span>. Click it
                  to finish setting up your account.
                </p>
              </div>
              <Link href="/login" className="text-[13px] font-medium text-graphite hover:text-carbon transition-colors">
                Back to sign in
              </Link>
            </div>
          )}

          {/* Step: YouTube */}
          {step === 'youtube' && (
            <div className="flex flex-col gap-8">
              <div>
                <p className="font-label mb-2 text-[11px] uppercase tracking-widest text-ash">Step 1 of 2</p>
                <h1 className="text-auth-h1 mb-3 text-carbon">Connect YouTube</h1>
                <p className="font-body-editorial text-[15px] leading-relaxed text-graphite">
                  Connect YouTube to see your performance alongside everything else. We only read
                  analytics — we never post or modify anything.
                </p>
              </div>

              <ConnectRow
                icon={<YouTubeGlyph size={22} />}
                name="YouTube Analytics"
                description="Views, watch time, subscribers, top videos"
              />

              <Button onClick={() => setStep('gmail')} size="lg" className="w-full">
                Continue
              </Button>
            </div>
          )}

          {/* Step: Gmail */}
          {step === 'gmail' && (
            <div className="flex flex-col gap-8">
              <div>
                <p className="font-label mb-2 text-[11px] uppercase tracking-widest text-ash">Step 2 of 2</p>
                <h1 className="text-auth-h1 mb-3 text-carbon">Connect Gmail</h1>
                <p className="font-body-editorial text-[15px] leading-relaxed text-graphite">
                  Connect Gmail so brand deal emails get sorted automatically. We only look at
                  sponsorship-related emails — we never read, delete, or send anything without your
                  approval.
                </p>
              </div>

              <ConnectRow icon={<GmailGlyph size={22} />} name="Gmail" description="Brand deal detection from your inbox" />

              <Button onClick={() => setStep('done')} size="lg" className="w-full">
                Continue
              </Button>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-lavender/10">
                <Check size={28} className="text-lavender" strokeWidth={2.25} />
              </div>
              <div>
                <h1 className="text-auth-h1 mb-3 text-carbon">You&apos;re set up.</h1>
                <p className="font-body-editorial text-[15px] leading-relaxed text-graphite">
                  Here&apos;s your Dashboard. You can connect accounts or adjust settings any time.
                </p>
              </div>

              <Button href={nextHref} size="lg" className="w-full">
                {nextHref === '/dashboard' ? 'Go to Dashboard' : 'Continue'}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

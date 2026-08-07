'use client'

import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, Mail } from 'lucide-react'
import { signUpWithEmail, resendConfirmationEmail, connectGoogle } from '@/lib/supabase/auth'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { completeOnboarding } from '@/lib/supabase/actions'
import { YouTubeGlyph, GmailGlyph } from '@/components/ui/oauth-glyphs'
import {
  AuthShell,
  AuthHeading,
  AuthCard,
  AuthField,
  AuthPasswordField,
  AuthAlert,
  AuthButton,
  AuthResendButton,
  AuthLink,
  AuthSteps,
  AuthConnectCard,
  AuthNotice,
} from '@/components/auth'
import { useToast } from '@/lib/toast'

// Step order: welcome → (check-email, only when email confirmation is required) → youtube →
// gmail → done.
type Step = 'welcome' | 'check-email' | 'youtube' | 'gmail' | 'done'

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingFlow />
    </Suspense>
  )
}

function OnboardingFlow() {
  const searchParams = useSearchParams()
  const toast = useToast()
  const nextHref = searchParams.get('next') || '/dashboard'
  const [step, setStep] = useState<Step>('welcome')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const noticeRef = useRef<HTMLDivElement>(null)
  const handledOAuthReturn = useRef(false)

  useEffect(() => {
    if (step === 'check-email' || step === 'done') noticeRef.current?.focus()
  }, [step])

  // Landing back here after the Google OAuth round trip — one grant covers
  // both YouTube and Gmail, so a single query param flips both steps'
  // connect cards to "Connected" rather than tracking them independently.
  // The ref guard matters for the error path: toast.error triggers a
  // context update that re-renders this component, which would otherwise
  // re-fire this effect on the same still-present error param indefinitely.
  useEffect(() => {
    if (handledOAuthReturn.current) return
    const connected = searchParams.get('integration_connected') === 'google'
    const err = searchParams.get('integration_error')
    if (!connected && !err) return
    handledOAuthReturn.current = true
    if (connected) queueMicrotask(() => setGoogleConnected(true))
    if (err) toast.error(`Could not finish connecting: ${err}`)
  }, [searchParams, toast])

  const handleConnect = async () => {
    setIsConnecting(true)
    const rawNext = searchParams.get('next')
    const onboardingReturn = rawNext ? `/onboarding?next=${encodeURIComponent(rawNext)}` : '/onboarding'
    const { error: connectError } = await connectGoogle(onboardingReturn)
    if (connectError) {
      setIsConnecting(false)
      toast.error(connectError.message)
    }
    // On success the browser is already navigating to Google.
  }

  // Resuming an already-authenticated visit — this is exactly what happens
  // after clicking an email confirmation link: the welcome step's in-memory
  // "just signed up" state from the original tab is long gone, but there's
  // a real session now, so skip straight to the connect steps instead of
  // showing the signup form again. (app/(app)/layout.tsx is what actually
  // sends a not-yet-onboarded user here in the first place.)
  useEffect(() => {
    let cancelled = false
    const supabase = createSupabaseBrowserClient()
    if (!supabase) {
      queueMicrotask(() => setCheckingAuth(false))
      return
    }
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return
      if (data.user) setStep('youtube')
      setCheckingAuth(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Reaching "done" is the wizard's actual finish line, however the user
  // got here (same-tab signup, or a resumed confirmation-link visit) —
  // this is what the app/(app) layout's onboarding gate checks to decide
  // whether to let a signed-in user any further than /onboarding.
  useEffect(() => {
    if (step === 'done') void completeOnboarding()
  }, [step])

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim() || !password) return
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const rawNext = searchParams.get('next')
      const onboardingReturn = rawNext ? `/onboarding?next=${encodeURIComponent(rawNext)}` : '/onboarding'
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(onboardingReturn)}`
      const { data, error: signUpError } = await signUpWithEmail(
        email.trim(),
        password,
        { full_name: fullName.trim() },
        emailRedirectTo,
      )
      if (signUpError) {
        setError(
          signUpError.message.toLowerCase().includes('already registered')
            ? 'An account already exists for that email. Try signing in instead.'
            : signUpError.message,
        )
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

  const next = searchParams.get('next')
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login'

  if (checkingAuth) return null

  return (
    <AuthShell
      width="wide"
      topRight={step === 'youtube' || step === 'gmail' ? <AuthSteps current={step === 'youtube' ? 1 : 2} /> : undefined}
    >
      {step === 'welcome' && (
        <div key="welcome">
          <AuthHeading title="Let's get your creator business set up." subtitle="Takes about a minute. Free and open source." />

          <AuthCard as="form" onSubmit={handleSignUp} className="flex flex-col gap-4">
            <AuthField
              id="onboard-name"
              label="Full name"
              autoFocus
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Priya Nair"
            />
            <AuthField
              id="onboard-email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
            />
            <AuthPasswordField
              id="onboard-password"
              label="Password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              hint="At least 8 characters."
            />

            <AuthAlert message={error} />

            <AuthButton
              type="submit"
              isComplete={Boolean(fullName.trim() && email.trim() && password)}
              disabled={isSubmitting || !fullName.trim() || !email.trim() || !password}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Creating account…' : 'Get started'}
            </AuthButton>
          </AuthCard>

          <p className="mt-6 text-center font-nebula-ui text-[12.5px] text-zinc-500">
            Already have an account? <AuthLink href={loginHref}>Sign in</AuthLink>
          </p>
        </div>
      )}

      {step === 'check-email' && (
        <div key="check-email">
          <AuthNotice
            ref={noticeRef}
            icon={Mail}
            tone="neutral"
            title="Check your inbox."
            body={
              <>
                We sent a confirmation link to <span className="text-zinc-100">{email}</span>. Click it to finish setting up
                your account.
              </>
            }
          >
            <div className="flex w-full flex-col items-center gap-4">
              <AuthResendButton sentLabel="Sent" onResend={() => resendConfirmationEmail(email)} />
              <AuthLink href="/login">Back to sign in</AuthLink>
            </div>
          </AuthNotice>
        </div>
      )}

      {step === 'youtube' && (
        <div key="youtube" className="flex flex-col gap-8">
          <AuthHeading
            eyebrow="Step 1 of 2"
            align="start"
            title="Connect YouTube"
            subtitle="Connect YouTube to see your performance alongside everything else. We only read analytics, and we never post or modify anything."
          />

          <AuthConnectCard
            icon={<YouTubeGlyph size={22} />}
            name="YouTube Analytics"
            description="Views, watch time, subscribers, top videos"
            connectedLabel="Views, watch time, subscribers, top videos"
            connected={googleConnected}
            onConnect={handleConnect}
            connecting={isConnecting}
          />

          <AuthButton variant="calm" onClick={() => setStep('gmail')}>
            Continue
          </AuthButton>
        </div>
      )}

      {step === 'gmail' && (
        <div key="gmail" className="flex flex-col gap-8">
          <AuthHeading
            eyebrow="Step 2 of 2"
            align="start"
            title="Connect Gmail"
            subtitle="Connect Gmail so brand deal emails get sorted automatically. We only look at sponsorship-related emails, and we never read, delete, or send anything without your approval."
          />

          <AuthConnectCard
            icon={<GmailGlyph size={22} />}
            name="Gmail"
            description="Brand deal detection from your inbox"
            connectedLabel="Brand deal detection from your inbox"
            connected={googleConnected}
            onConnect={handleConnect}
            connecting={isConnecting}
          />

          <AuthButton variant="calm" onClick={() => setStep('done')}>
            Continue
          </AuthButton>
        </div>
      )}

      {step === 'done' && (
        <div key="done">
          <AuthNotice
            ref={noticeRef}
            icon={Check}
            tone="accent"
            title="You're set up."
            body="Here's your Dashboard. You can connect accounts or adjust settings any time."
          >
            <AuthButton variant="calm" href={nextHref}>
              {nextHref === '/dashboard' ? 'Go to Dashboard' : 'Continue'}
            </AuthButton>
          </AuthNotice>
        </div>
      )}
    </AuthShell>
  )
}

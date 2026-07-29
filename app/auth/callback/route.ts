import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const isGoogleLinkFlow = searchParams.get('flow') === 'google_link'
  const redirectUrl = new URL(`${origin}${next}`)

  if (code) {
    const supabase = await createSupabaseServerClient()
    if (supabase) {
      const { data } = await supabase.auth.exchangeCodeForSession(code)

      // Supabase doesn't persist provider_token/provider_refresh_token
      // anywhere past this exchange, so this is the one and only place they
      // can be captured; connect-integration is what actually stores them
      // (via Vault), server-side only — the browser never sees these values.
      //
      // Trigger on the flow=google_link marker, not on provider_token being
      // present: Google/Supabase can occasionally finish linking the
      // identity without handing back a provider_token (seen live — a
      // transient PKCE/timing gap), and linkIdentity refuses to ever retry
      // an already-linked identity. Always calling connect-integration lets
      // it self-heal that case (unlink the tokenless identity immediately)
      // instead of silently stranding it.
      if (isGoogleLinkFlow) {
        const { error } = await supabase.functions.invoke('connect-integration', {
          body: {
            accessToken: data.session?.provider_token ?? null,
            refreshToken: data.session?.provider_refresh_token ?? null,
          },
        })
        redirectUrl.searchParams.set(error ? 'integration_error' : 'integration_connected', error ? error.message : 'google')
      }
    }
  }

  return NextResponse.redirect(redirectUrl)
}

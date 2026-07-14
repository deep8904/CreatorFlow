import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const result = await createSupabaseMiddlewareClient(request)
  if (!result) {
    return NextResponse.next()
  }

  const { supabase, response } = result
  await supabase.auth.getUser()
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

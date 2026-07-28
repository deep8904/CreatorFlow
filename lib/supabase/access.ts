import { redirect } from 'next/navigation'
import { getCurrentAccount } from './queries'
import { canAccessModule, type ModuleKey } from '@/lib/roles'

/**
 * Server-side page guard mirroring the has_role_access() RLS policies —
 * RLS already stops a role's queries from returning restricted data, but
 * without this a role with no access still sees the page shell (empty
 * board, no error). Redirects home instead, matching what the nav already
 * hides.
 */
export async function requireModuleAccess(module: ModuleKey) {
  const account = await getCurrentAccount()
  if (!account || !canAccessModule(account.role, module)) {
    redirect('/dashboard')
  }
  return account
}

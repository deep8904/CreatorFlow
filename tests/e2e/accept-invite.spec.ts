import { test, expect } from '@playwright/test'

test('missing invite reference shows a clear error, not a crash', async ({ page }) => {
  await page.goto('/accept-invite')
  await expect(page.getByRole('heading', { name: /Invite link incomplete/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Back to CreatorFlow/i })).toBeVisible()
})

test('unauthenticated visitor with an invite id is prompted to sign in or sign up first', async ({ page }) => {
  await page.goto('/accept-invite?invite=00000000-0000-0000-0000-000000000000')
  await expect(page.getByRole('heading', { name: /You've been invited to CreatorFlow/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Create account/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Already have an account/i })).toBeVisible()
})

test('the sign-in link preserves the invite so the user lands back here after auth', async ({ page }) => {
  const inviteId = '00000000-0000-0000-0000-000000000000'
  await page.goto(`/accept-invite?invite=${inviteId}`)
  await page.getByRole('link', { name: /Already have an account/i }).click()
  await expect(page).toHaveURL(new RegExp(`/login\\?next=.*accept-invite.*${inviteId}`))
})

import { test, expect } from '@playwright/test'

test('login form renders and rejects invalid credentials with an inline error', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  // Wait for React to hydrate before interacting — filling immediately after
  // navigation can race hydration and land on the DOM before the controlled
  // input's onChange handler is attached.
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Email').fill('nonexistent-user-e2e-test@example.com')
  await page.getByLabel('Password').fill('definitely-wrong-password')
  await page.getByRole('button', { name: /Sign in/i }).click()

  // Supabase returns a real auth error for bad credentials — surfaced inline,
  // not a silent failure or an unhandled redirect.
  await expect(page.locator('text=/invalid|not.*found|error/i')).toBeVisible({ timeout: 10000 })
  await expect(page).toHaveURL(/\/login/)
})

test('login and onboarding cross-link to each other', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('link', { name: /Start free/i }).click()
  await expect(page).toHaveURL(/\/onboarding/)

  await page.getByRole('link', { name: /Sign in/i }).click()
  await expect(page).toHaveURL(/\/login/)
})

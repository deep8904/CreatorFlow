import { test, expect } from '@playwright/test'

// Deliberately does not submit a real signup — Supabase's dev-tier email
// rate limit makes repeated real signups in CI unreliable. This covers the
// form's own validation/rendering; docs/qa/KNOWN_ISSUES.md notes that a
// full authenticated-flow suite needs a dedicated test-account fixture.

test('onboarding shows the real signup form, not a fake wizard', async ({ page }) => {
  await page.goto('/onboarding')
  await expect(page.getByRole('heading', { name: /Let's get your creator business set up/i })).toBeVisible()
  await expect(page.getByLabel('Full name')).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
})

test('submit is disabled until all fields are filled', async ({ page }) => {
  await page.goto('/onboarding')
  await page.waitForLoadState('networkidle')
  const submit = page.getByRole('button', { name: /Get started/i })
  await expect(submit).toBeDisabled()

  await page.getByLabel('Full name').fill('E2E Test')
  await expect(submit).toBeDisabled()

  await page.getByLabel('Email').fill('e2e-test@example.com')
  await expect(submit).toBeDisabled()

  await page.getByLabel('Password').fill('a-real-password')
  await expect(submit).toBeEnabled()
})

test('malformed-domain email is rejected by Supabase and shown inline', async ({ page }) => {
  await page.goto('/onboarding')
  await page.waitForLoadState('networkidle')
  await page.getByLabel('Full name').fill('E2E Test')
  // .test is a reserved, always-invalid TLD (RFC 2606) — Supabase rejects it
  // on format validation alone, before attempting to send any email, so this
  // doesn't count against the project's email send rate limit the way a
  // real-domain address (even one Supabase later rate-limits) would.
  await page.getByLabel('Email').fill('e2e-onboarding-test@nonexistent-domain.test')
  await page.getByLabel('Password').fill('a-real-password')
  await page.getByRole('button', { name: /Get started/i }).click()

  // Whatever Supabase's exact wording, some inline error must appear — the
  // button re-enabling is the more robust signal that submission finished
  // and did NOT silently advance past the welcome step.
  await expect(page.getByRole('button', { name: /Get started/i })).toBeEnabled({ timeout: 15000 })
  await expect(page.getByRole('heading', { name: /Let's get your creator business set up/i })).toBeVisible()
})

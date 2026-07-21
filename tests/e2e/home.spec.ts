import { test, expect } from '@playwright/test'

test('landing page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/CreatorFlow/i)
  await expect(page.getByRole('heading', { name: /Fewer dropped ideas/i })).toBeVisible()
})

test('nav and hero primary CTAs share the same design-system button styling', async ({ page }) => {
  await page.goto('/')
  const navCta = page.getByRole('link', { name: /Start free/i }).first()
  const heroCta = page.getByRole('link', { name: /Start free/i }).nth(1)

  await expect(navCta).toBeVisible()
  await expect(heroCta).toBeVisible()

  const [navRadius, heroRadius] = await Promise.all([
    navCta.evaluate((el) => getComputedStyle(el).borderRadius),
    heroCta.evaluate((el) => getComputedStyle(el).borderRadius),
  ])
  // Both resolve to the same pill family (Button component) — this is the
  // regression guard for the nav/hero button-shape drift found in the
  // pre-rollout design-system audit.
  expect(navRadius).toBe(heroRadius)

  const [navBg, heroBg] = await Promise.all([
    navCta.evaluate((el) => getComputedStyle(el).backgroundColor),
    heroCta.evaluate((el) => getComputedStyle(el).backgroundColor),
  ])
  expect(navBg).toBe(heroBg)
})

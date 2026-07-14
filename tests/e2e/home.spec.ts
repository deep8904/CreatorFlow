import { test, expect } from '@playwright/test'

test('landing page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/CreatorFlow/i)
  await expect(page.getByRole('heading', { name: /Run your creator business/i })).toBeVisible()
})

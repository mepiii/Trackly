import { test, expect } from '@playwright/test';

test('happy path scaffold exists', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#root')).toBeVisible();
});

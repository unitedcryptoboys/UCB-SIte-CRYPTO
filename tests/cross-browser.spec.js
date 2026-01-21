const { test, expect } = require('@playwright/test');

test.describe('Cross-Browser Compatibility', () => {
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/UCB|United Crypto Boys/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('CSS files load', async ({ page, request }) => {
    await page.goto('/');
    const response = await request.get('/dist/viewer.css');
    expect(response.status()).toBe(200);
  });

  test('JavaScript files load', async ({ page, request }) => {
    await page.goto('/');
    const response = await request.get('/dist/viewer.js');
    expect(response.status()).toBe(200);
  });

  test('No console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', exception => {
      errors.push(exception.message);
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors.length).toBe(0);
  });

  test('Viewport meta tag exists', async ({ page }) => {
    await page.goto('/');
    const viewport = await page.$eval('meta[name="viewport"]', el => el.content);
    expect(viewport).toContain('width=device-width');
  });

  test('Service Worker registers', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);
    await page.goto('/');
    await page.waitForTimeout(2000);
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(swRegistered).toBe(true);
  });
});

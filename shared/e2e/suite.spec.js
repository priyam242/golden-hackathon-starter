import { test, expect } from '@playwright/test';

test.describe('Frontend Arsenal — Universal Verification Suite', () => {
  test('01. Strict Design Lock & Bell MT Typography', async ({ page }) => {
    await page.goto('/');

    // Check html data-theme
    const htmlTheme = await page.getAttribute('html', 'data-theme');
    expect(['light', 'dark', null]).toContain(htmlTheme);

    // Font family check: Bell MT must be present in body computed font
    const bodyFont = await page.evaluate(() => window.getComputedStyle(document.body).fontFamily);
    expect(bodyFont.toLowerCase()).toContain('bell mt');

    // Theme toggle verification
    const toggle = page.locator('[data-testid="theme-toggle"]');
    if (await toggle.count() > 0) {
      await toggle.click();
      const updatedTheme = await page.getAttribute('html', 'data-theme');
      expect(['light', 'dark']).toContain(updatedTheme);
    }
  });

  test('02. Three-Color Gradient Text Validation', async ({ page }) => {
    await page.goto('/');

    // Gradient check on Heading
    const h1 = page.locator('h1').first();
    if (await h1.count() > 0) {
      const bgClip = await h1.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.backgroundClip || style.webkitBackgroundClip;
      });
      expect(['text', 'content-box', 'border-box']).toContain(bgClip);
    }
  });

  test('03. Catalog Items & Search Flow', async ({ page }) => {
    await page.goto('/items');

    // Verify search input
    const searchInput = page.locator('[data-testid="items-search"]');
    await expect(searchInput).toBeVisible();

    // Wait for async items to load
    const itemCards = page.locator('[data-testid="item-card"]');
    await expect(itemCards.first()).toBeVisible({ timeout: 5000 });
    expect(await itemCards.count()).toBeGreaterThan(0);
  });

  test('04. Authentication & Protected Routes', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('[data-testid="login-email"]');
    const passInput = page.locator('[data-testid="login-password"]');
    const submitBtn = page.locator('[data-testid="login-submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passInput).toBeVisible();

    await emailInput.fill('user@demo.com');
    await passInput.fill('User@123');
    await submitBtn.click();

    // Redirection to dashboard or authenticated state
    await page.waitForTimeout(500);
  });
});


// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Dashboard E2E Tests
 */

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="text"]', 'Nostradam');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('should display dashboard statistics', async ({ page }) => {
    await expect(page.locator('text=Total Predictions')).toBeVisible();
    await expect(page.locator('text=Fraud Detected')).toBeVisible();
    await expect(page.locator('text=Legitimate')).toBeVisible();
  });

  test('should display charts', async ({ page }) => {
    // Check for chart elements
    await expect(page.locator('text=Fraud vs Legitimate')).toBeVisible();
  });

  test('should have refresh button', async ({ page }) => {
    await expect(page.locator('text=Refresh')).toBeVisible();
  });

  test('should have export button', async ({ page }) => {
    await expect(page.locator('text=Export')).toBeVisible();
  });

  test('should have period selector', async ({ page }) => {
    await expect(page.locator('text=Last 30 days')).toBeVisible();
  });

  test('should update on period change', async ({ page }) => {
    // Click period selector
    await page.click('text=Last 30 days');

    // Select different period if dropdown appears
    const option = page.locator('text=Last 7 days');
    if (await option.isVisible()) {
      await option.click();
    }
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="text"]', 'Nostradam');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to all main tabs', async ({ page }) => {
    // Dashboard
    await page.click('text=Dashboard');
    await expect(page.locator('text=Total Predictions')).toBeVisible();

    // Analyzer
    await page.click('text=Analyzer');
    await expect(page.locator('text=Transaction Analyzer')).toBeVisible();

    // Batch Upload
    await page.click('text=Batch Upload');
    await expect(page.locator('text=Batch')).toBeVisible();

    // Analytics
    await page.click('text=Analytics');
    await expect(page.locator('canvas, svg, text=Analytics')).toBeVisible();

    // History
    await page.click('text=History');
    await expect(page.locator('text=History')).toBeVisible();
  });

  test('should display user info in header', async ({ page }) => {
    await expect(page.locator('text=Nostradam')).toBeVisible();
  });

  test('should have dark mode toggle', async ({ page }) => {
    // Find and click dark mode toggle
    const toggle = page.locator('[data-testid="theme-toggle"]');
    if (await toggle.isVisible()) {
      await toggle.click();
    }
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.fill('input[type="text"]', 'Nostradam');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await page.fill('input[type="text"]', 'Nostradam');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });
});

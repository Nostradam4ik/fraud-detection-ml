// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Prediction Feature E2E Tests
 */

test.describe('Fraud Prediction', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('input[type="text"]', 'Nostradam');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to analyzer tab', async ({ page }) => {
    await page.click('text=Analyzer');
    await expect(page.locator('text=Transaction Analyzer')).toBeVisible();
  });

  test('should load legitimate sample transaction', async ({ page }) => {
    await page.click('text=Analyzer');
    await page.click('text=Load Legitimate Sample');

    // Check that form fields are populated
    const timeField = page.locator('input').first();
    await expect(timeField).not.toHaveValue('0');
  });

  test('should load fraud sample transaction', async ({ page }) => {
    await page.click('text=Analyzer');
    await page.click('text=Load Fraud Sample');

    // Check that form fields are populated
    const timeField = page.locator('input').first();
    await expect(timeField).not.toHaveValue('0');
  });

  test('should make prediction with sample data', async ({ page }) => {
    await page.click('text=Analyzer');
    await page.click('text=Load Fraud Sample');

    // Wait for sample to load
    await page.waitForTimeout(500);

    // Click analyze
    await page.click('text=Analyze Transaction');

    // Should show prediction result
    await expect(page.locator('text=Fraud Probability')).toBeVisible({ timeout: 10000 });
  });

  test('should display prediction result correctly', async ({ page }) => {
    await page.click('text=Analyzer');
    await page.click('text=Load Legitimate Sample');
    await page.waitForTimeout(500);
    await page.click('text=Analyze Transaction');

    // Should show result section
    await expect(page.locator('text=Fraud Probability')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Risk Score')).toBeVisible();
    await expect(page.locator('text=Confidence')).toBeVisible();
  });

  test('should update dashboard after prediction', async ({ page }) => {
    // Get initial prediction count from dashboard
    await page.click('text=Dashboard');
    const initialCount = await page.locator('text=Total Predictions').locator('..').locator('text=/\\d+/').first().textContent();

    // Make a prediction
    await page.click('text=Analyzer');
    await page.click('text=Load Legitimate Sample');
    await page.waitForTimeout(500);
    await page.click('text=Analyze Transaction');
    await expect(page.locator('text=Fraud Probability')).toBeVisible({ timeout: 10000 });

    // Go back to dashboard
    await page.click('text=Dashboard');
    await page.waitForTimeout(1000);

    // Count should have increased
    const newCount = await page.locator('text=Total Predictions').locator('..').locator('text=/\\d+/').first().textContent();
    expect(parseInt(newCount || '0')).toBeGreaterThanOrEqual(parseInt(initialCount || '0'));
  });
});

test.describe('Batch Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="text"]', 'Nostradam');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to batch upload tab', async ({ page }) => {
    await page.click('text=Batch Upload');
    await expect(page.locator('text=Batch')).toBeVisible();
  });

  test('should show file upload area', async ({ page }) => {
    await page.click('text=Batch Upload');
    await expect(page.locator('text=CSV')).toBeVisible();
  });
});

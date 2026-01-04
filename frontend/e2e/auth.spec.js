// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Authentication E2E Tests
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page when not authenticated', async ({ page }) => {
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="text"]', 'wronguser');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid')).toBeVisible({ timeout: 5000 });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('input[type="text"]', 'Nostradam');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Fraud Detection')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.fill('input[type="text"]', 'Nostradam');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });

    // Click logout
    await page.click('[data-testid="logout-btn"]');

    // Should be back to login
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should persist login state on page refresh', async ({ page }) => {
    await page.fill('input[type="text"]', 'Nostradam');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });

    // Refresh page
    await page.reload();

    // Should still be logged in
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Registration', () => {
  test('should navigate to registration form', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Create account');

    await expect(page.locator('text=Create Account')).toBeVisible();
  });

  test('should validate registration form', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Create account');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible();
  });
});

// src/__tests__/e2e/specs/auth.spec.ts
import { test, expect } from '@playwright/test';
import { goto, login } from '../fixtures/utils';

test.describe('Authentication', () => {

  test('unauthenticated user is redirected from /dashboard to /', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto('http://localhost:3000/dashboard');
    await page.waitForURL('http://localhost:3000/', { timeout: 15_000 });
    await expect(page.getByRole('tab', { name: 'Sign In' })).toBeVisible();
    await context.close();
  });

  test('unauthenticated user is redirected from /new-post to /', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto('http://localhost:3000/new-post');
    await page.waitForURL('http://localhost:3000/', { timeout: 15_000 });
    await expect(page.getByRole('tab', { name: 'Sign In' })).toBeVisible();
    await context.close();
  });

  test('unauthenticated user is redirected from /discovery to /', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    await page.goto('http://localhost:3000/discovery');
    await page.waitForURL('http://localhost:3000/', { timeout: 15_000 });
    await expect(page.getByRole('tab', { name: 'Sign In' })).toBeVisible();
    await context.close();
  });

  test('authenticated user can access /dashboard', async ({ page }) => {
    await goto(page, '/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // ✅ FIXED: matches the actual h1 in DashboardPage → "Creator Analytics"
    await expect(
      page.getByRole('heading', { name: /Creator Analytics/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  test('authenticated user can access /new-post', async ({ page }) => {
    await goto(page, '/new-post');
    await expect(page).toHaveURL('/new-post');
    await expect(
      page.getByRole('region', { name: /Create a new post/i })
    ).toBeVisible();
  });

});
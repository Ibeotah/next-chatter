// src/__tests__/e2e/fixtures/utils.ts
import { Page } from '@playwright/test';

export const goto = async (page: Page, path: string) => {
  await page.goto(path);
  // ✅ FIXED: 'networkidle' fails on pages with continuous activity
  // Use 'domcontentloaded' which is faster and more reliable
  await page.waitForLoadState('domcontentloaded');
};

// Login via UI — fallback if storageState is missing
export const login = async (page: Page, email: string, password: string) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.getByRole('tab', { name: 'Sign In' }).click();
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForLoadState('domcontentloaded');
};
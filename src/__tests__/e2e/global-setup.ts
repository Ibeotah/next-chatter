// src/__tests__/e2e/global-setup.ts
import { chromium } from '@playwright/test';
import path from 'path';

const TEST_USER = {
  email: 'diamondtessy84@gmail.com',
  password: 'estheris30',
};

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('🔐 Global setup: logging in test user...');

  // 1. Go to the auth page
  await page.goto('http://localhost:3000/');

  // 2. Wait for auth page to fully load
  await page.waitForSelector('text=Sign In', { timeout: 30_000 });

  // 3. Click the Sign In tab
  await page.getByRole('tab', { name: 'Sign In' }).click();

  // 4. Fill email — placeholder is 'name@domain.com'
  await page.getByPlaceholder('name@domain.com').fill(TEST_USER.email);

  // 5. Fill password — placeholder is '••••••••' (confirmed from SignInForm)
  await page.getByPlaceholder('••••••••').fill(TEST_USER.password);

  // 6. Click submit — button text is 'Sign In to Dashboard'
  await page.getByRole('button', { name: 'Sign In to Dashboard' }).click();

  // 7. Wait for redirect — confirms login worked
  await page.waitForURL('**/dashboard', { timeout: 30_000 });
  console.log('✅ Login successful');

  // 8. Save session so every test reuses it without logging in again
  await page.context().storageState({
    path: path.resolve(__dirname, 'storageState.json'),
  });

  await browser.close();
  console.log('✅ storageState.json saved — global setup complete');
}

export default globalSetup;
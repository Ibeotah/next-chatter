// playwright.config.ts  (PROJECT ROOT — next to package.json)
import { defineConfig, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

export default defineConfig({
  // ── Where tests live ──────────────────────────────────────────
  testDir: './src/__tests__/e2e/specs',

  // ── Global setup: logs in once and saves cookie/session state ─
  globalSetup: './src/__tests__/e2e/global-setup.ts',

  // ── Output ────────────────────────────────────────────────────
  outputDir: './test-results',
  reporter: [['html', { outputFolder: './playwright-report' }]],

  // ── Retry flaky tests in CI only ──────────────────────────────
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  fullyParallel: true,

  // ── Global timeouts ───────────────────────────────────────────
  timeout: 120_000,

  use: {
    baseURL: BASE_URL,
    // ✅ Reuse auth session saved by global-setup.ts
    storageState: './src/__tests__/e2e/storageState.json',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 800 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // ── Start Next.js dev server automatically before tests ───────
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    // Reuse already-running dev server (saves time locally)
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
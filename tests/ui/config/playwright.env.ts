import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../../',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: [['list']],

  use: {
    baseURL: process.env['BASE_URL'] ?? 'https://test.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

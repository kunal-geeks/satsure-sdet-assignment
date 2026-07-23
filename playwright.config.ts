import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env['BASE_URL'] ?? 'https://test.com';
const LOCALE = process.env['LOCALE'] ?? 'en-IN';
const TIMEZONE = process.env['TIMEZONE'] ?? 'Asia/Kolkata';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', {
      outputFolder: 'allure-results',
      suiteTitle: true,
      detail: true,
      environmentInfo: {
        framework: 'Playwright',
        language: 'TypeScript',
        browser: 'Chromium',
        baseURL: BASE_URL,
        locale: LOCALE,
        timezone: TIMEZONE,
      },
    }],
    ['list'],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        locale: LOCALE,
        timezoneId: TIMEZONE,
      },
    },
  ],
});

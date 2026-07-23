import * as fs from 'fs';
import * as path from 'path';
import type { Page } from '@playwright/test';

const FIXTURE_HTML = path.resolve(__dirname, '../fixtures/autocomplete-form.html');

export interface SubmissionMockOptions {
  status?: number;
  body?: object;
}

/** Registers route handlers for the form page and the submission API. */
export async function setupFormRoutes(
  page: Page,
  submissionOpts: SubmissionMockOptions = {}
): Promise<void> {
  const { status = 200, body = { completed: true } } = submissionOpts;

  await page.route('**/autocomplete-form', async (route) => {
    const html = fs.readFileSync(FIXTURE_HTML, 'utf-8');
    await route.fulfill({ contentType: 'text/html', body: html });
  });

  await page.route('**/api/submission', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Registers a submission route that captures the POST payload via a callback,
 * then always responds with HTTP 200. Use this to assert payload contents.
 */
export async function interceptSubmission(
  page: Page,
  onCapture: (payload: Record<string, unknown>) => void
): Promise<void> {
  await page.route('**/api/submission', async (route) => {
    if (route.request().method() === 'POST') {
      const payload = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>;
      onCapture(payload);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ completed: true }),
      });
    } else {
      await route.continue();
    }
  });
}

/** Serves the HTML fixture for the form page only (no API mock). */
export async function setupFormPage(page: Page): Promise<void> {
  await page.route('**/autocomplete-form', async (route) => {
    const html = fs.readFileSync(FIXTURE_HTML, 'utf-8');
    await route.fulfill({ contentType: 'text/html', body: html });
  });
}

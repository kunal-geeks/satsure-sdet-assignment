import * as fs from 'fs';
import * as path from 'path';
import type { Page } from '@playwright/test';
import type { ZodIssue } from 'zod';

const FIXTURE_HTML = path.resolve(__dirname, '../../ui/fixtures/autocomplete-form.html');

/** Returns suggestions from the given pool whose text starts with the input string. */
export function prefixMatch(input: string, suggestions: readonly string[]): string[] {
  return suggestions.filter((s) => s.startsWith(input));
}

/** Extracts Zod error paths from a failed safeParse result as flat dot-notation strings. */
export function getErrorPaths(issues: ZodIssue[]): string[] {
  return issues.map((i) => i.path.join('.'));
}

/** Navigates to the mocked form page so browser fetch() resolves against the base URL. */
export async function loadFormPage(page: Page): Promise<void> {
  await page.route('**/autocomplete-form', async (route) => {
    const html = fs.readFileSync(FIXTURE_HTML, 'utf-8');
    await route.fulfill({ contentType: 'text/html', body: html });
  });
  await page.goto('/autocomplete-form');
}

/** Validates that end_date is temporally >= start_date (both in offset format). */
export function assertTemporalOrder(startDate: string, endDate: string): void {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (end < start) {
    throw new Error(`end_date (${endDate}) is before start_date (${startDate})`);
  }
}

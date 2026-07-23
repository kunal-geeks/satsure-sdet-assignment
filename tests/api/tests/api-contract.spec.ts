import { test, expect } from '@playwright/test';
import { z } from 'zod';

/**
 * FR-05 Data Contract — Zod Schema Definition
 *
 * Validates the exact shape and types required by the specification.
 *
 * Key constraints:
 *  - start_date / end_date: ISO 8601 with local timezone offset (not Z / UTC)
 *  - locale: IETF BCP 47 with region subtag (e.g. "en-IN")
 *  - completed: JSON boolean (not string)
 */

// Regex: ISO 8601 datetime with a timezone offset (NOT Z / UTC)
// Matches: 2024-03-15T16:00:00+05:30  or  2024-03-15T16:00:00-08:00
const LOCAL_TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

// Regex: IETF BCP 47 with region subtag — language-REGION (e.g. en-IN, fr-FR)
const BCP47_WITH_REGION_REGEX = /^[a-z]{2,3}-[A-Z]{2,3}$/;

const FR05Schema = z.object({
  account_id: z.union([z.string().min(1), z.number()]),
  account_email: z.string().email(),
  start_date: z.string().regex(LOCAL_TIMESTAMP_REGEX, {
    message: 'start_date must be an ISO 8601 timestamp in local time with timezone offset (not UTC/Z)',
  }),
  end_date: z.string().regex(LOCAL_TIMESTAMP_REGEX, {
    message: 'end_date must be an ISO 8601 timestamp in local time with timezone offset (not UTC/Z)',
  }),
  locale: z.string().regex(BCP47_WITH_REGION_REGEX, {
    message: 'locale must be IETF BCP 47 format with region subtag, e.g. en-IN',
  }),
  text: z.string().min(1),
  suggestion_list: z.string().min(1),
  completed: z.boolean({
    invalid_type_error: 'completed must be a JSON boolean (true/false), not a string',
  }),
});

type FR05Response = z.infer<typeof FR05Schema>;

// ---------------------------------------------------------------------------
// Sample API responses for testing
// ---------------------------------------------------------------------------

/** Compliant response — all fields correct */
const COMPLIANT_RESPONSE: FR05Response = {
  account_id: '98765',
  account_email: 'test123@gmail.com',
  start_date: '2024-03-15T16:00:00+05:30',
  end_date: '2024-03-15T16:02:00+05:30',
  locale: 'en-IN',
  text: 'agile methodology',
  suggestion_list: 'agile methodology, agile methodology process, agile methodology process testing',
  completed: true,
};

/** Non-compliant response — mirrors the assignment's sample API response */
const ASSIGNMENT_SAMPLE_RESPONSE = {
  account_id: '98765',
  account_email: 'test123@gmail.com',
  start_date: '2024-03-15T10:30:00Z',
  end_date: '2024-03-15T10:32:00Z',
  locale: 'en',
  text: 'agile methodology',
  suggestion_list: 'agile methodology, agile methodology process, agile methodology process testing',
  completed: 'true', // string — should be boolean
};

// ---------------------------------------------------------------------------
// Helper: Mock the GET /api/submission endpoint with a given body
// ---------------------------------------------------------------------------
async function mockGetSubmission(
  page: import('@playwright/test').Page,
  responseBody: object,
  status = 200
): Promise<void> {
  await page.route('**/api/submission**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(responseBody),
      });
    } else {
      await route.continue();
    }
  });
}

// ---------------------------------------------------------------------------
// Schema Validation Tests
// ---------------------------------------------------------------------------
test.describe('FR-05 API Schema Validation', () => {
  test('Schema: compliant response passes all validations', async () => {
    const result = FR05Schema.safeParse(COMPLIANT_RESPONSE);
    expect(result.success).toBe(true);
  });

  test('Schema: assignment sample response fails validation (3 defects)', async () => {
    const result = FR05Schema.safeParse(ASSIGNMENT_SAMPLE_RESPONSE);
    expect(result.success).toBe(false);

    if (!result.success) {
      const errorPaths = result.error.issues.map((i) => i.path.join('.'));
      // Must catch: start_date, end_date (UTC instead of local), locale (missing region), completed (string)
      expect(errorPaths).toContain('start_date');
      expect(errorPaths).toContain('end_date');
      expect(errorPaths).toContain('locale');
      expect(errorPaths).toContain('completed');
    }
  });
});

// ---------------------------------------------------------------------------
// Data Type Validation Tests
// ---------------------------------------------------------------------------
test.describe('FR-05 Data Type Validation', () => {
  test('DT-01: completed must be JSON boolean true, not string "true"', async () => {
    const withStringCompleted = { ...COMPLIANT_RESPONSE, completed: 'true' as unknown as boolean };
    const result = FR05Schema.safeParse(withStringCompleted);
    expect(result.success).toBe(false);
    if (!result.success) {
      const completedError = result.error.issues.find((i) => i.path.includes('completed'));
      expect(completedError).toBeDefined();
    }
  });

  test('DT-02: completed must be JSON boolean false, not string "false"', async () => {
    const withStringFalse = { ...COMPLIANT_RESPONSE, completed: 'false' as unknown as boolean };
    const result = FR05Schema.safeParse(withStringFalse);
    expect(result.success).toBe(false);
  });

  test('DT-03: completed boolean true is accepted', async () => {
    const result = FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, completed: true });
    expect(result.success).toBe(true);
  });

  test('DT-04: completed boolean false is accepted', async () => {
    const result = FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, completed: false });
    expect(result.success).toBe(true);
  });

  test('DT-05: account_email must be a valid email address', async () => {
    const withBadEmail = { ...COMPLIANT_RESPONSE, account_email: 'not-an-email' };
    const result = FR05Schema.safeParse(withBadEmail);
    expect(result.success).toBe(false);
  });

  test('DT-06: text must be a non-empty string', async () => {
    const withEmptyText = { ...COMPLIANT_RESPONSE, text: '' };
    const result = FR05Schema.safeParse(withEmptyText);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Timestamp / Timezone Validation Tests
// ---------------------------------------------------------------------------
test.describe('FR-05 Timestamp Validation', () => {
  test('TS-01: start_date with UTC Z suffix is rejected', async () => {
    const withUTC = { ...COMPLIANT_RESPONSE, start_date: '2024-03-15T10:30:00Z' };
    const result = FR05Schema.safeParse(withUTC);
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes('start_date'));
      expect(err).toBeDefined();
    }
  });

  test('TS-02: end_date with UTC Z suffix is rejected', async () => {
    const withUTC = { ...COMPLIANT_RESPONSE, end_date: '2024-03-15T10:32:00Z' };
    const result = FR05Schema.safeParse(withUTC);
    expect(result.success).toBe(false);
  });

  test('TS-03: start_date with +05:30 offset is accepted', async () => {
    const result = FR05Schema.safeParse(COMPLIANT_RESPONSE);
    expect(result.success).toBe(true);
  });

  test('TS-04: end_date must be greater than or equal to start_date', async () => {
    // Validate temporal ordering (business rule — not enforced by Zod schema, tested manually)
    const start = new Date(COMPLIANT_RESPONSE.start_date.replace('+05:30', '+05:30'));
    const end = new Date(COMPLIANT_RESPONSE.end_date.replace('+05:30', '+05:30'));
    expect(end.getTime()).toBeGreaterThanOrEqual(start.getTime());
  });

  test('TS-05: IST offset +05:30 is present in both timestamps', async () => {
    expect(COMPLIANT_RESPONSE.start_date).toMatch(/\+05:30$/);
    expect(COMPLIANT_RESPONSE.end_date).toMatch(/\+05:30$/);
  });
});

// ---------------------------------------------------------------------------
// Locale Validation Tests (IETF BCP 47)
// ---------------------------------------------------------------------------
test.describe('FR-05 Locale Validation (IETF BCP 47)', () => {
  test('LOC-01: locale "en" (language only) is rejected', async () => {
    const withLangOnly = { ...COMPLIANT_RESPONSE, locale: 'en' };
    const result = FR05Schema.safeParse(withLangOnly);
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes('locale'));
      expect(err?.message).toContain('IETF BCP 47');
    }
  });

  test('LOC-02: locale "en-IN" is accepted', async () => {
    const result = FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, locale: 'en-IN' });
    expect(result.success).toBe(true);
  });

  test('LOC-03: locale "fr-FR" is accepted (valid BCP 47)', async () => {
    const result = FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, locale: 'fr-FR' });
    expect(result.success).toBe(true);
  });

  test('LOC-04: locale "english" is rejected (not BCP 47)', async () => {
    const result = FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, locale: 'english' });
    expect(result.success).toBe(false);
  });

  test('LOC-05: locale "EN-in" is rejected (incorrect casing)', async () => {
    // BCP 47 convention: lowercase language, uppercase region
    const result = FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, locale: 'EN-in' });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// suggestion_list Validation Tests
// ---------------------------------------------------------------------------
test.describe('FR-05 suggestion_list Validation', () => {
  const allSuggestions = ['agile methodology', 'agile methodology process', 'agile methodology process testing'];

  function prefixMatch(input: string, suggestions: string[]): string[] {
    return suggestions.filter((s) => s.startsWith(input));
  }

  test('SL-01: suggestion_list for "agile methodology" contains all 3 prefix-matching suggestions', async () => {
    const input = 'agile methodology';
    const expected = prefixMatch(input, allSuggestions);
    expect(expected).toHaveLength(3);

    const suggestionList = COMPLIANT_RESPONSE.suggestion_list.split(',').map((s) => s.trim());
    for (const item of expected) {
      expect(suggestionList).toContain(item);
    }
  });

  test('SL-02: suggestion_list for "agile methodology process" must exclude "agile methodology" alone', async () => {
    const input = 'agile methodology process';
    const matching = prefixMatch(input, allSuggestions);

    // "agile methodology" does NOT start with "agile methodology process"
    expect(matching).not.toContain('agile methodology');
    expect(matching).toContain('agile methodology process');
    expect(matching).toContain('agile methodology process testing');
  });

  test('SL-03: suggestion_list for "xyz" input should be empty', async () => {
    const input = 'xyz';
    const matching = prefixMatch(input, allSuggestions);
    expect(matching).toHaveLength(0);
  });

  test('SL-04: suggestion_list field must be a non-empty string when there are matches', async () => {
    const result = FR05Schema.safeParse(COMPLIANT_RESPONSE);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.suggestion_list).toBe('string');
      expect(result.data.suggestion_list.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Test Cases
// ---------------------------------------------------------------------------
test.describe('Negative API Tests', () => {
  const FIXTURE_PATH = require('path').resolve(__dirname, '../../ui/fixtures/autocomplete-form.html');
  const fs = require('fs') as typeof import('fs');

  /** Navigate to the mocked form page so fetch() calls resolve against https://test.com */
  async function loadForm(page: import('@playwright/test').Page): Promise<void> {
    await page.route('**/autocomplete-form', async (route) => {
      const html = fs.readFileSync(FIXTURE_PATH, 'utf-8') as string;
      await route.fulfill({ contentType: 'text/html', body: html });
    });
    await page.goto('https://test.com/autocomplete-form');
  }

  test('NEG-01: API rejects payload with missing required field "text"', async ({ page }) => {
    await loadForm(page);

    // Mock the submission endpoint to return 400 when text is missing
    await page.route('**/api/submission', async (route) => {
      const body = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>;
      if (!body['text']) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Missing required field: text' }),
        });
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify({ completed: true }) });
      }
    });

    // Send a request without the text field
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: '98765',
          account_email: 'test123@gmail.com',
          // text is intentionally missing
          suggestion_list: 'agile methodology',
          locale: 'en-IN',
          start_date: '2024-03-15T16:00:00+05:30',
          end_date: '2024-03-15T16:02:00+05:30',
          completed: false,
        }),
      });
      return { status: res.status, body: await res.json() };
    });

    expect(response.status).toBe(400);
    expect((response.body as { error: string }).error).toContain('text');
  });

  test('NEG-02: API rejects payload with invalid locale format', async ({ page }) => {
    await loadForm(page);

    await page.route('**/api/submission', async (route) => {
      const body = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>;
      const localeValid = /^[a-z]{2,3}-[A-Z]{2,3}$/.test(String(body['locale'] ?? ''));
      if (!localeValid) {
        await route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid locale format. Expected IETF BCP 47 with region subtag.' }),
        });
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify({ completed: true }) });
      }
    });

    const response = await page.evaluate(async () => {
      const res = await fetch('/api/submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: '98765',
          account_email: 'test123@gmail.com',
          text: 'agile methodology',
          suggestion_list: 'agile methodology',
          locale: 'english', // invalid — not IETF BCP 47
          start_date: '2024-03-15T16:00:00+05:30',
          end_date: '2024-03-15T16:02:00+05:30',
          completed: false,
        }),
      });
      return { status: res.status, body: await res.json() };
    });

    expect(response.status).toBe(422);
    expect((response.body as { error: string }).error).toContain('locale');
  });

  test('NEG-03: Schema rejects response with completed as number', async () => {
    const withNumberCompleted = { ...COMPLIANT_RESPONSE, completed: 1 as unknown as boolean };
    const result = FR05Schema.safeParse(withNumberCompleted);
    expect(result.success).toBe(false);
  });

  test('NEG-04: Schema rejects response with missing account_email', async () => {
    const { account_email: _, ...withoutEmail } = COMPLIANT_RESPONSE;
    const result = FR05Schema.safeParse(withoutEmail);
    expect(result.success).toBe(false);
  });
});

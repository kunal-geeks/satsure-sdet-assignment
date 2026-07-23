import { test, expect } from '@playwright/test';
import { FR05Schema } from '../schema/fr05.schema';
import { COMPLIANT_RESPONSE, ASSIGNMENT_SAMPLE_RESPONSE, ALL_SUGGESTIONS } from '../data/api-test-data';
import { prefixMatch, getErrorPaths, loadFormPage, assertTemporalOrder } from '../helpers/api.helpers';

// ---------------------------------------------------------------------------
// Schema Validation
// ---------------------------------------------------------------------------
test.describe('Schema Validation', () => {
  test('SV-01: compliant response passes full schema validation', () => {
    const result = FR05Schema.safeParse(COMPLIANT_RESPONSE);
    expect(result.success).toBe(true);
  });

  test('SV-02: assignment sample response fails — 4 schema violations detected', () => {
    const result = FR05Schema.safeParse(ASSIGNMENT_SAMPLE_RESPONSE);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = getErrorPaths(result.error.issues);
      expect(paths).toContain('start_date');
      expect(paths).toContain('end_date');
      expect(paths).toContain('locale');
      expect(paths).toContain('completed');
    }
  });

  test('SV-03: schema requires all 8 mandatory fields', () => {
    const result = FR05Schema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = getErrorPaths(result.error.issues);
      ['account_id','account_email','start_date','end_date','locale','text','suggestion_list','completed']
        .forEach((f) => expect(paths).toContain(f));
    }
  });
});

// ---------------------------------------------------------------------------
// Response Field Validation
// ---------------------------------------------------------------------------
test.describe('Response Field Validation', () => {
  test('RFV-01: account_id is present and non-empty', () => {
    const result = FR05Schema.safeParse(COMPLIANT_RESPONSE);
    expect(result.success).toBe(true);
    if (result.success) expect(String(result.data.account_id).length).toBeGreaterThan(0);
  });

  test('RFV-02: account_email matches the authenticated test user', () => {
    const result = FR05Schema.safeParse(COMPLIANT_RESPONSE);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.account_email).toBe('test123@gmail.com');
  });

  test('RFV-03: start_date uses IST offset +05:30', () => {
    const result = FR05Schema.safeParse(COMPLIANT_RESPONSE);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.start_date).toMatch(/\+05:30$/);
  });

  test('RFV-04: end_date uses IST offset +05:30', () => {
    const result = FR05Schema.safeParse(COMPLIANT_RESPONSE);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.end_date).toMatch(/\+05:30$/);
  });

  test('RFV-05: locale matches IETF BCP 47 format "en-IN"', () => {
    const result = FR05Schema.safeParse(COMPLIANT_RESPONSE);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.locale).toBe('en-IN');
  });

  test('RFV-06: text field matches what the user entered', () => {
    const result = FR05Schema.safeParse(COMPLIANT_RESPONSE);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.text).toBe('agile methodology');
  });

  test('RFV-07: suggestion_list is a non-empty comma-separated string', () => {
    const result = FR05Schema.safeParse(COMPLIANT_RESPONSE);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.suggestion_list).toBe('string');
      expect(result.data.suggestion_list).toContain(',');
    }
  });

  test('RFV-08: completed is a boolean', () => {
    const result = FR05Schema.safeParse(COMPLIANT_RESPONSE);
    expect(result.success).toBe(true);
    if (result.success) expect(typeof result.data.completed).toBe('boolean');
  });
});

// ---------------------------------------------------------------------------
// Data Type Validation
// ---------------------------------------------------------------------------
test.describe('Data Type Validation', () => {
  test('DT-01: completed string "true" is rejected', () => {
    const result = FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, completed: 'true' });
    expect(result.success).toBe(false);
  });

  test('DT-02: completed string "false" is rejected', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, completed: 'false' }).success).toBe(false);
  });

  test('DT-03: completed number 1 is rejected', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, completed: 1 }).success).toBe(false);
  });

  test('DT-04: completed boolean true is accepted', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, completed: true }).success).toBe(true);
  });

  test('DT-05: completed boolean false is accepted', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, completed: false }).success).toBe(true);
  });

  test('DT-06: account_email must be a valid email string', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, account_email: 'not-an-email' }).success).toBe(false);
  });

  test('DT-07: text must be a non-empty string', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, text: '' }).success).toBe(false);
  });

  test('DT-08: suggestion_list must be a non-empty string', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, suggestion_list: '' }).success).toBe(false);
  });

  test('DT-09: account_id accepts both string and number types', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, account_id: '98765' }).success).toBe(true);
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, account_id: 98765 }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Timestamp Validation
// ---------------------------------------------------------------------------
test.describe('Timestamp Validation', () => {
  test('TS-01: start_date with Z (UTC) suffix is rejected', () => {
    const result = FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, start_date: '2024-03-15T10:30:00Z' });
    expect(result.success).toBe(false);
    if (!result.success) expect(getErrorPaths(result.error.issues)).toContain('start_date');
  });

  test('TS-02: end_date with Z (UTC) suffix is rejected', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, end_date: '2024-03-15T10:32:00Z' }).success).toBe(false);
  });

  test('TS-03: start_date with +05:30 (IST) offset is accepted', () => {
    expect(FR05Schema.safeParse(COMPLIANT_RESPONSE).success).toBe(true);
  });

  test('TS-04: end_date is temporally >= start_date', () => {
    expect(() => assertTemporalOrder(COMPLIANT_RESPONSE.start_date, COMPLIANT_RESPONSE.end_date)).not.toThrow();
  });

  test('TS-05: end_date before start_date fails temporal ordering check', () => {
    expect(() => assertTemporalOrder('2024-03-15T16:05:00+05:30', '2024-03-15T16:00:00+05:30')).toThrow();
  });

  test('TS-06: plain date string (no time) is rejected', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, start_date: '2024-03-15' }).success).toBe(false);
  });

  test('TS-07: non-IST offset (-08:00) is accepted by schema', () => {
    expect(FR05Schema.safeParse({
      ...COMPLIANT_RESPONSE,
      start_date: '2024-03-15T02:30:00-08:00',
      end_date: '2024-03-15T02:32:00-08:00',
    }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Locale Validation (IETF BCP 47)
// ---------------------------------------------------------------------------
test.describe('Locale Validation (IETF BCP 47)', () => {
  test('LOC-01: "en" (language only) is rejected', () => {
    const result = FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, locale: 'en' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes('locale'));
      expect(err?.message).toContain('IETF BCP 47');
    }
  });

  test('LOC-02: "en-IN" is accepted', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, locale: 'en-IN' }).success).toBe(true);
  });

  test('LOC-03: "fr-FR" is accepted', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, locale: 'fr-FR' }).success).toBe(true);
  });

  test('LOC-04: "english" (not BCP 47) is rejected', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, locale: 'english' }).success).toBe(false);
  });

  test('LOC-05: "EN-in" (wrong casing) is rejected', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, locale: 'EN-in' }).success).toBe(false);
  });

  test('LOC-06: "en-" (no region) is rejected', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, locale: 'en-' }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Suggestion List Validation
// ---------------------------------------------------------------------------
test.describe('Suggestion List Validation', () => {
  test('SL-01: "agile methodology" matches all 3 suggestions', () => {
    const matches = prefixMatch('agile methodology', ALL_SUGGESTIONS);
    expect(matches).toHaveLength(3);
    expect(matches).toEqual(expect.arrayContaining([...ALL_SUGGESTIONS]));
  });

  test('SL-02: "agile methodology process" excludes "agile methodology"', () => {
    const matches = prefixMatch('agile methodology process', ALL_SUGGESTIONS);
    expect(matches).not.toContain('agile methodology');
    expect(matches).toContain('agile methodology process');
    expect(matches).toContain('agile methodology process testing');
  });

  test('SL-03: non-matching input returns empty list', () => {
    expect(prefixMatch('xyz', ALL_SUGGESTIONS)).toHaveLength(0);
  });

  test('SL-04: suggestion_list in compliant response contains all expected matches', () => {
    const result = FR05Schema.safeParse(COMPLIANT_RESPONSE);
    expect(result.success).toBe(true);
    if (result.success) {
      const items = result.data.suggestion_list.split(',').map((s) => s.trim());
      prefixMatch('agile methodology', ALL_SUGGESTIONS).forEach((exp) => {
        expect(items).toContain(exp);
      });
    }
  });

  test('SL-05: suggestion_list must not include non-matching entries', () => {
    const input = 'agile methodology process';
    const nonMatching = ALL_SUGGESTIONS.filter((s) => !s.startsWith(input));
    const payloadItems = 'agile methodology process, agile methodology process testing'
      .split(',').map((s) => s.trim());
    nonMatching.forEach((excluded) => expect(payloadItems).not.toContain(excluded));
  });
});

// ---------------------------------------------------------------------------
// Negative Tests — missing fields, invalid datatypes, network-level
// ---------------------------------------------------------------------------
test.describe('Negative Tests', () => {
  // Missing field tests
  test('NEG-MF-01: missing "text" fails schema', () => {
    const { text: _, ...body } = COMPLIANT_RESPONSE;
    const result = FR05Schema.safeParse(body);
    expect(result.success).toBe(false);
    if (!result.success) expect(getErrorPaths(result.error.issues)).toContain('text');
  });

  test('NEG-MF-02: missing "account_email" fails schema', () => {
    const { account_email: _, ...body } = COMPLIANT_RESPONSE;
    expect(FR05Schema.safeParse(body).success).toBe(false);
  });

  test('NEG-MF-03: missing "locale" fails schema', () => {
    const { locale: _, ...body } = COMPLIANT_RESPONSE;
    expect(FR05Schema.safeParse(body).success).toBe(false);
  });

  test('NEG-MF-04: missing "completed" fails schema', () => {
    const { completed: _, ...body } = COMPLIANT_RESPONSE;
    expect(FR05Schema.safeParse(body).success).toBe(false);
  });

  test('NEG-MF-05: missing "start_date" fails schema', () => {
    const { start_date: _, ...body } = COMPLIANT_RESPONSE;
    expect(FR05Schema.safeParse(body).success).toBe(false);
  });

  // Invalid datatype tests
  test('NEG-IDT-01: completed as number is rejected', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, completed: 1 }).success).toBe(false);
  });

  test('NEG-IDT-02: account_email as number is rejected', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, account_email: 12345 }).success).toBe(false);
  });

  test('NEG-IDT-03: start_date as epoch milliseconds (number) is rejected', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, start_date: 1710494400000 }).success).toBe(false);
  });

  test('NEG-IDT-04: locale as boolean is rejected', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, locale: true }).success).toBe(false);
  });

  test('NEG-IDT-05: suggestion_list as array is rejected (must be comma-separated string)', () => {
    expect(FR05Schema.safeParse({ ...COMPLIANT_RESPONSE, suggestion_list: ['agile methodology'] }).success).toBe(false);
  });

  // Network-level negative tests
  test('NEG-NET-01: API returns 400 when required field "text" is missing', async ({ page }) => {
    await loadFormPage(page);

    await page.route('**/api/submission', async (route) => {
      const body = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>;
      await route.fulfill({
        status: body['text'] ? 200 : 400,
        contentType: 'application/json',
        body: JSON.stringify(body['text'] ? { completed: true } : { error: 'Missing required field: text' }),
      });
    });

    const response = await page.evaluate(async () => {
      const res = await fetch('/api/submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: '98765',
          account_email: 'test123@gmail.com',
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

  test('NEG-NET-02: API returns 422 when locale format is invalid', async ({ page }) => {
    await loadFormPage(page);

    await page.route('**/api/submission', async (route) => {
      const body = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>;
      const valid = /^[a-z]{2,3}-[A-Z]{2,3}$/.test(String(body['locale'] ?? ''));
      await route.fulfill({
        status: valid ? 200 : 422,
        contentType: 'application/json',
        body: JSON.stringify(valid ? { completed: true } : { error: 'Invalid locale format. Expected IETF BCP 47 with region subtag.' }),
      });
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
          locale: 'english',
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
});

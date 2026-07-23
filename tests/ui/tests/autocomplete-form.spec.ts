import { test, expect } from '@playwright/test';
import * as path from 'path';
import { AutocompleteFormPage } from '../pages/AutocompleteFormPage';

const FIXTURE_PATH = path.resolve(__dirname, '../fixtures/autocomplete-form.html');

/**
 * Helper: set up route mocking so the suite runs without a live server.
 * - Serves the local HTML fixture for the form page.
 * - Mocks the POST /api/submission endpoint.
 */
async function setupMocks(
  page: import('@playwright/test').Page,
  submissionResponse: { status: number; body: object } = { status: 200, body: { completed: true } }
) {
  // Serve the HTML fixture when the form page is requested
  await page.route('**/autocomplete-form', async (route) => {
    const html = require('fs').readFileSync(FIXTURE_PATH, 'utf-8');
    await route.fulfill({ contentType: 'text/html', body: html });
  });

  // Mock the submission API
  await page.route('**/api/submission', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: submissionResponse.status,
        contentType: 'application/json',
        body: JSON.stringify(submissionResponse.body),
      });
    } else {
      await route.continue();
    }
  });
}

// ---------------------------------------------------------------------------
// Suggestion Filtering Tests
// ---------------------------------------------------------------------------
test.describe('Suggestion Filtering', () => {
  test('TC-04a: All suggestions visible with empty input', async ({ page }) => {
    await setupMocks(page);
    const form = new AutocompleteFormPage(page);
    await form.goto();

    const count = await form.getVisibleSuggestionCount();
    expect(count).toBe(3);
  });

  test('TC-04b: Prefix match — all three suggestions visible when typing "agile"', async ({ page }) => {
    await setupMocks(page);
    const form = new AutocompleteFormPage(page);
    await form.goto();

    await form.typeInInput('agile');
    const visible = await form.getVisibleSuggestions();
    expect(visible).toContain('agile methodology');
    expect(visible).toContain('agile methodology process');
    expect(visible).toContain('agile methodology process testing');
    expect(visible.length).toBe(3);
  });

  test('TC-04c: Prefix match — only deeper-prefix suggestions visible when typing "agile methodology process"', async ({ page }) => {
    await setupMocks(page);
    const form = new AutocompleteFormPage(page);
    await form.goto();

    await form.typeInInput('agile methodology process');
    const visible = await form.getVisibleSuggestions();

    expect(visible).not.toContain('agile methodology'); // does NOT start with the full phrase
    expect(visible).toContain('agile methodology process');
    expect(visible).toContain('agile methodology process testing');
  });

  test('TC-03: No suggestions visible when input does not match any prefix', async ({ page }) => {
    await setupMocks(page);
    const form = new AutocompleteFormPage(page);
    await form.goto();

    await form.typeInInput('xyz');
    const count = await form.getVisibleSuggestionCount();
    expect(count).toBe(0);
  });

  test('TC-04d: Suggestions reset after clearing input', async ({ page }) => {
    await setupMocks(page);
    const form = new AutocompleteFormPage(page);
    await form.goto();

    await form.typeInInput('xyz');
    expect(await form.getVisibleSuggestionCount()).toBe(0);

    await form.clearInput();
    expect(await form.getVisibleSuggestionCount()).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Suggestion Selection Tests
// ---------------------------------------------------------------------------
test.describe('Suggestion Selection', () => {
  test('TC-11: Clicking a suggestion populates the input field', async ({ page }) => {
    await setupMocks(page);
    const form = new AutocompleteFormPage(page);
    await form.goto();

    await form.selectSuggestion('agile methodology');
    await form.assertInputValue('agile methodology');
  });

  test('TC-11b: Clicking "agile methodology process" sets exact text in input', async ({ page }) => {
    await setupMocks(page);
    const form = new AutocompleteFormPage(page);
    await form.goto();

    await form.selectSuggestion('agile methodology process');
    await form.assertInputValue('agile methodology process');
  });

  test('TC-11c: After suggestion selection, filtering updates based on selected text', async ({ page }) => {
    await setupMocks(page);
    const form = new AutocompleteFormPage(page);
    await form.goto();

    await form.selectSuggestion('agile methodology process');
    // After selecting "agile methodology process", the input has that text.
    // Visible suggestions should be those starting with "agile methodology process".
    const visible = await form.getVisibleSuggestions();
    expect(visible).toContain('agile methodology process');
    expect(visible).toContain('agile methodology process testing');
    expect(visible).not.toContain('agile methodology');
  });
});

// ---------------------------------------------------------------------------
// Form Submission Tests
// ---------------------------------------------------------------------------
test.describe('Form Submission', () => {
  test('TC-01: Successful submission displays success message', async ({ page }) => {
    await setupMocks(page, { status: 200, body: { completed: true } });
    const form = new AutocompleteFormPage(page);
    await form.goto();

    await form.selectSuggestion('agile methodology');
    await form.clickNext();

    await form.assertSuccess();
  });

  test('TC-02: Empty submission displays error message', async ({ page }) => {
    await setupMocks(page, { status: 400, body: { error: 'Invalid input' } });
    const form = new AutocompleteFormPage(page);
    await form.goto();

    // Do not type anything — submit with empty input
    await form.clickNext();
    await form.assertError();
    await form.assertErrorText('Error: Invalid input. Please select a valid suggestion.');
  });

  test('TC-01b: API submission payload contains correct text field', async ({ page }) => {
    let capturedPayload: Record<string, unknown> = {};

    await page.route('**/autocomplete-form', async (route) => {
      const html = require('fs').readFileSync(FIXTURE_PATH, 'utf-8');
      await route.fulfill({ contentType: 'text/html', body: html });
    });

    await page.route('**/api/submission', async (route) => {
      if (route.request().method() === 'POST') {
        capturedPayload = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ completed: true }),
        });
      } else {
        await route.continue();
      }
    });

    const form = new AutocompleteFormPage(page);
    await form.goto();
    await form.selectSuggestion('agile methodology');
    await form.clickNext();

    // Wait for submission
    await expect(form.successContainer).toBeVisible();

    expect(capturedPayload['text']).toBe('agile methodology');
    expect(capturedPayload['account_email']).toBe('test123@gmail.com');
    expect(capturedPayload['suggestion_list']).toBeTruthy();
  });

  test('TC-01c: submission only sends matching suggestions in suggestion_list', async ({ page }) => {
    let capturedPayload: Record<string, unknown> = {};

    await page.route('**/autocomplete-form', async (route) => {
      const html = require('fs').readFileSync(FIXTURE_PATH, 'utf-8');
      await route.fulfill({ contentType: 'text/html', body: html });
    });

    await page.route('**/api/submission', async (route) => {
      if (route.request().method() === 'POST') {
        capturedPayload = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ completed: true }),
        });
      } else {
        await route.continue();
      }
    });

    const form = new AutocompleteFormPage(page);
    await form.goto();
    // Type "agile methodology process" — only 2 suggestions should match
    await form.typeInInput('agile methodology process');
    await form.clickNext();

    await expect(form.successContainer).toBeVisible();

    const suggestionList = capturedPayload['suggestion_list'] as string;
    expect(suggestionList).toContain('agile methodology process');
    expect(suggestionList).toContain('agile methodology process testing');
    // "agile methodology" alone should NOT appear as it doesn't start with "agile methodology process"
    const items = suggestionList.split(',').map((s: string) => s.trim());
    expect(items).not.toContain('agile methodology');
  });
});

// ---------------------------------------------------------------------------
// Keyboard Navigation Tests
// ---------------------------------------------------------------------------
test.describe('Keyboard Navigation', () => {
  test('TC-05: Tab key moves focus from input to Next button', async ({ page }) => {
    await setupMocks(page);
    const form = new AutocompleteFormPage(page);
    await form.goto();

    // Focus the input
    await form.inputField.focus();
    let focusedId = await form.getFocusedElementId();
    expect(focusedId).toBe('input-field');

    // Tab through suggestions to the Next button
    // There are 3 suggestion <li> items with tabindex=0
    await page.keyboard.press('Tab'); // -> suggestion 1
    await page.keyboard.press('Tab'); // -> suggestion 2
    await page.keyboard.press('Tab'); // -> suggestion 3
    await page.keyboard.press('Tab'); // -> Next button

    focusedId = await form.getFocusedElementId();
    expect(focusedId).toBe('next-button');
  });

  test('TC-06: Enter key on Next button submits the form', async ({ page }) => {
    await setupMocks(page, { status: 200, body: { completed: true } });
    const form = new AutocompleteFormPage(page);
    await form.goto();

    await form.typeInInput('agile methodology');
    // Focus the Next button
    await form.nextButton.focus();
    await page.keyboard.press('Enter');

    await form.assertSuccess();
  });

  test('TC-07: Escape key clears the input field', async ({ page }) => {
    await setupMocks(page);
    const form = new AutocompleteFormPage(page);
    await form.goto();

    await form.typeInInput('agile');
    await form.pressKeyInInput('Escape');

    await form.assertInputValue('');
    // All suggestions should be visible again
    expect(await form.getVisibleSuggestionCount()).toBe(3);
  });

  test('TC-05b: Shift+Tab from Next button returns focus to last suggestion', async ({ page }) => {
    await setupMocks(page);
    const form = new AutocompleteFormPage(page);
    await form.goto();

    // Focus the Next button
    await form.nextButton.focus();
    const focusedId = await form.getFocusedElementId();
    expect(focusedId).toBe('next-button');

    // Shift+Tab should go back to a suggestion li
    await page.keyboard.press('Shift+Tab');
    const el = await form.getFocusedElementSelector();
    expect(el).toContain('li');
  });
});

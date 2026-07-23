import { expect } from '@playwright/test';
import { test } from '../fixtures/page.fixtures';
import { AutocompleteFormPage } from '../pages/AutocompleteFormPage';
import { setupFormRoutes, interceptSubmission, setupFormPage } from '../helpers/route.helpers';
import {
  SUGGESTIONS,
  TEST_USER,
  ERROR_MESSAGE_TEXT,
} from '../data/test-data';

// ---------------------------------------------------------------------------
// Suggestion Filtering — FR-02
// ---------------------------------------------------------------------------
test.describe('Suggestion Filtering', () => {
  test('TC-04a: all suggestions visible when input is empty', async ({ formPage }) => {
    await formPage.assertSuggestionCount(3);
  });

  test('TC-04b: all suggestions visible when typing shared prefix "agile"', async ({ formPage }) => {
    await formPage.typeInInput('agile');
    await formPage.assertSuggestionCount(3);
    await formPage.assertSuggestionsContain([...SUGGESTIONS]);
  });

  test('TC-04c: only suffix-matching suggestions visible for "agile methodology process"', async ({ formPage }) => {
    await formPage.typeInInput('agile methodology process');
    await formPage.assertSuggestionsContain([
      'agile methodology process',
      'agile methodology process testing',
    ]);
    await formPage.assertSuggestionsExclude(['agile methodology']);
  });

  test('TC-03: no suggestions visible when input matches no prefix', async ({ formPage }) => {
    await formPage.typeInInput('xyz');
    await formPage.assertSuggestionCount(0);
  });

  test('TC-04d: all suggestions restored after clearing input', async ({ formPage }) => {
    await formPage.typeInInput('xyz');
    await formPage.assertSuggestionCount(0);
    await formPage.clearInput();
    await formPage.assertSuggestionCount(3);
  });

  test('TC-04e: exact full match shows only that suggestion', async ({ formPage }) => {
    await formPage.typeInInput('agile methodology process testing');
    await formPage.assertSuggestionCount(1);
    await formPage.assertSuggestionsContain(['agile methodology process testing']);
  });
});

// ---------------------------------------------------------------------------
// Suggestion Selection — FR-01
// ---------------------------------------------------------------------------
test.describe('Suggestion Selection', () => {
  test('TC-11a: clicking "agile methodology" populates input exactly', async ({ formPage }) => {
    await formPage.selectSuggestion('agile methodology');
    await formPage.assertInputValue('agile methodology');
  });

  test('TC-11b: clicking "agile methodology process" populates input exactly', async ({ formPage }) => {
    await formPage.selectSuggestion('agile methodology process');
    await formPage.assertInputValue('agile methodology process');
  });

  test('TC-11c: after selection, suggestion list re-filters to match selected text', async ({ formPage }) => {
    await formPage.selectSuggestion('agile methodology process');
    await formPage.assertSuggestionsContain([
      'agile methodology process',
      'agile methodology process testing',
    ]);
    await formPage.assertSuggestionsExclude(['agile methodology']);
  });

  test('TC-11d: clicking last suggestion populates full text and leaves only itself visible', async ({ formPage }) => {
    await formPage.selectSuggestion('agile methodology process testing');
    await formPage.assertInputValue('agile methodology process testing');
    await formPage.assertSuggestionCount(1);
  });
});

// ---------------------------------------------------------------------------
// Form Submission — FR-04
// ---------------------------------------------------------------------------
test.describe('Form Submission', () => {
  test('TC-01: successful submission shows success message and hides error', async ({ formPage }) => {
    await formPage.selectSuggestion('agile methodology');
    await formPage.clickNext();
    await formPage.assertSuccess();
  });

  test('TC-02: submitting empty input shows error and hides success', async ({ formPage }) => {
    await formPage.clickNext();
    await formPage.assertError();
    await formPage.assertErrorText(ERROR_MESSAGE_TEXT);
  });

  test('TC-01b: submitted payload contains correct text and account_email', async ({ page }) => {
    let captured: Record<string, unknown> = {};

    await setupFormPage(page);
    await interceptSubmission(page, (p) => { captured = p; });

    const form = new AutocompleteFormPage(page);
    await form.goto();
    await form.selectSuggestion('agile methodology');
    await form.clickNext();

    await expect(form.successContainer).toBeVisible();

    expect(captured['text']).toBe('agile methodology');
    expect(captured['account_email']).toBe(TEST_USER.email);
    expect(captured['account_id']).toBe(TEST_USER.accountId);
    expect(captured['suggestion_list']).toBeTruthy();
    expect(captured['completed']).toBe(false);
  });

  test('TC-01c: suggestion_list in payload contains only prefix-matching entries', async ({ page }) => {
    let captured: Record<string, unknown> = {};

    await setupFormPage(page);
    await interceptSubmission(page, (p) => { captured = p; });

    const form = new AutocompleteFormPage(page);
    await form.goto();
    await form.typeInInput('agile methodology process');
    await form.clickNext();

    await expect(form.successContainer).toBeVisible();

    const items = (captured['suggestion_list'] as string).split(',').map((s) => s.trim());
    expect(items).toContain('agile methodology process');
    expect(items).toContain('agile methodology process testing');
    expect(items).not.toContain('agile methodology');
  });

  test('TC-01d: subsequent server error after valid input shows error message', async ({ page }) => {
    await setupFormRoutes(page, { status: 500, body: { error: 'Internal Server Error' } });
    const form = new AutocompleteFormPage(page);
    await form.goto();
    await form.selectSuggestion('agile methodology');
    await form.clickNext();
    await form.assertError();
  });
});

// ---------------------------------------------------------------------------
// Tab Navigation — FR-01 / Accessibility
// ---------------------------------------------------------------------------
test.describe('Tab Navigation', () => {
  test('TC-05a: Tab from input moves through suggestions to Next button', async ({ formPage }) => {
    await formPage.inputField.focus();
    await formPage.assertFocusedElementId('input-field');

    // 3 suggestion <li> items each have tabindex="0"
    await formPage.page.keyboard.press('Tab'); // -> li[0]
    await formPage.page.keyboard.press('Tab'); // -> li[1]
    await formPage.page.keyboard.press('Tab'); // -> li[2]
    await formPage.page.keyboard.press('Tab'); // -> Next button

    await formPage.assertFocusedElementId('next-button');
  });

  test('TC-05b: Shift+Tab from Next button returns focus to a suggestion item', async ({ formPage }) => {
    await formPage.nextButton.focus();
    await formPage.assertFocusedElementId('next-button');

    await formPage.page.keyboard.press('Shift+Tab');

    const tag = await formPage.getFocusedElementTagName();
    expect(tag).toBe('li');
  });

  test('TC-05c: Tab order starts at input field', async ({ formPage }) => {
    await formPage.page.keyboard.press('Tab');
    await formPage.assertFocusedElementId('input-field');
  });
});

// ---------------------------------------------------------------------------
// Keyboard Interaction — FR-01 / FR-04
// ---------------------------------------------------------------------------
test.describe('Keyboard Interaction', () => {
  test('TC-06: Enter on focused Next button submits the form', async ({ formPage }) => {
    await formPage.typeInInput('agile methodology');
    await formPage.nextButton.focus();
    await formPage.page.keyboard.press('Enter');
    await formPage.assertSuccess();
  });

  test('TC-07a: Escape clears the input field', async ({ formPage }) => {
    await formPage.typeInInput('agile');
    await formPage.pressKeyInInput('Escape');
    await formPage.assertInputValue('');
  });

  test('TC-07b: Escape restores all suggestions after clearing input', async ({ formPage }) => {
    await formPage.typeInInput('agile');
    await formPage.pressKeyInInput('Escape');
    await formPage.assertSuggestionCount(3);
  });

  test('TC-07c: Escape hides error message if one was shown', async ({ formPage }) => {
    await formPage.clickNext(); // trigger error
    await formPage.assertError();
    await formPage.pressKeyInInput('Escape');
    await expect(formPage.errorMessage).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Error Validation
// ---------------------------------------------------------------------------
test.describe('Error Validation', () => {
  test('TC-EV-01: error message text matches spec exactly', async ({ formPage }) => {
    await formPage.clickNext();
    await formPage.assertErrorText(ERROR_MESSAGE_TEXT);
  });

  test('TC-EV-02: success and error are mutually exclusive on error', async ({ formPage }) => {
    await formPage.clickNext();
    await expect(formPage.errorMessage).toBeVisible();
    await expect(formPage.successContainer).not.toBeVisible();
  });

  test('TC-EV-03: success and error are mutually exclusive on success', async ({ formPage }) => {
    await formPage.selectSuggestion('agile methodology');
    await formPage.clickNext();
    await expect(formPage.successContainer).toBeVisible();
    await expect(formPage.errorMessage).not.toBeVisible();
  });
});

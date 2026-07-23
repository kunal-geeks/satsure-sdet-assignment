import { test as base, expect } from '@playwright/test';
import { AutocompleteFormPage } from '../pages/AutocompleteFormPage';
import { setupFormRoutes } from '../helpers/route.helpers';

/** Shape of the custom fixtures available to all UI tests. */
interface FormFixtures {
  /** AutocompleteFormPage with default success mock; navigated to form. */
  formPage: AutocompleteFormPage;
}

/**
 * Extended Playwright test with pre-wired form fixtures.
 *
 * Usage:
 *   import { test, expect } from '../fixtures/page.fixtures';
 *
 *   test('my test', async ({ formPage }) => {
 *     await formPage.typeInInput('agile');
 *   });
 */
export const test = base.extend<FormFixtures>({
  formPage: async ({ page }, use) => {
    await setupFormRoutes(page);
    const form = new AutocompleteFormPage(page);
    await form.goto();
    await use(form);
  },
});

export { expect };

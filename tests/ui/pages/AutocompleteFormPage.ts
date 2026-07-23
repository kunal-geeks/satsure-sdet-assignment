import { type Page, type Locator, expect } from '@playwright/test';

/**
 * AutocompleteFormPage encapsulates all interactions with the autocomplete form
 * at https://test.com/autocomplete-form
 *
 * HTML Structure (per spec):
 *   <input id="input-field" />
 *   <ul class="suggestions"><li>...</li></ul>
 *   <button id="next-button">Next</button>
 *   <span class="error-message">...</span>
 *   <div class="success-container">...</div>
 */
export class AutocompleteFormPage {
  readonly page: Page;

  // Locators
  readonly inputField: Locator;
  readonly suggestionList: Locator;
  readonly suggestionItems: Locator;
  readonly nextButton: Locator;
  readonly errorMessage: Locator;
  readonly successContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inputField = page.locator('#input-field');
    this.suggestionList = page.locator('ul.suggestions');
    this.suggestionItems = page.locator('ul.suggestions li');
    this.nextButton = page.locator('#next-button');
    this.errorMessage = page.locator('span.error-message');
    this.successContainer = page.locator('div.success-container');
  }

  /** Navigate to the autocomplete form page */
  async goto(): Promise<void> {
    await this.page.goto('/autocomplete-form');
  }

  /** Type text into the input field */
  async typeInInput(text: string): Promise<void> {
    await this.inputField.click();
    await this.inputField.fill(text);
  }

  /** Clear the input field */
  async clearInput(): Promise<void> {
    await this.inputField.fill('');
  }

  /** Get the current value of the input field */
  async getInputValue(): Promise<string> {
    return this.inputField.inputValue();
  }

  /** Click a suggestion item by its visible text (exact match) */
  async selectSuggestion(text: string): Promise<void> {
    await this.page.locator('ul.suggestions li').getByText(text, { exact: true }).click();
  }

  /** Click the Next (submit) button */
  async clickNext(): Promise<void> {
    await this.nextButton.click();
  }

  /** Get text of all currently visible suggestion items */
  async getVisibleSuggestions(): Promise<string[]> {
    const items = await this.suggestionItems.all();
    const texts: string[] = [];
    for (const item of items) {
      if (await item.isVisible()) {
        const t = await item.textContent();
        if (t) texts.push(t.trim());
      }
    }
    return texts;
  }

  /** Get the count of visible suggestion items */
  async getVisibleSuggestionCount(): Promise<number> {
    const all = await this.suggestionItems.all();
    let count = 0;
    for (const item of all) {
      if (await item.isVisible()) count++;
    }
    return count;
  }

  /** Assert the success container is visible */
  async assertSuccess(): Promise<void> {
    await expect(this.successContainer).toBeVisible();
    await expect(this.errorMessage).not.toBeVisible();
  }

  /** Assert the error message is visible */
  async assertError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.successContainer).not.toBeVisible();
  }

  /** Assert that the error message contains a specific text */
  async assertErrorText(text: string): Promise<void> {
    await expect(this.errorMessage).toContainText(text);
  }

  /** Assert input field has an expected value */
  async assertInputValue(expected: string): Promise<void> {
    await expect(this.inputField).toHaveValue(expected);
  }

  /** Press a keyboard key while the page has focus */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /** Focus the input field and press a key */
  async pressKeyInInput(key: string): Promise<void> {
    await this.inputField.focus();
    await this.page.keyboard.press(key);
  }

  /** Get the element that currently has focus on the page */
  async getFocusedElementId(): Promise<string | null> {
    return this.page.evaluate(() => document.activeElement?.id ?? null);
  }

  /** Get the tag name + class of the currently focused element */
  async getFocusedElementSelector(): Promise<string> {
    return this.page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return '';
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const cls = el.className ? `.${el.className.split(' ').join('.')}` : '';
      return `${tag}${id}${cls}`;
    });
  }
}

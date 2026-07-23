import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object for the Autocomplete Form.
 *
 * HTML Structure (per spec):
 *   <input id="input-field" />
 *   <ul class="suggestions"><li>...</li></ul>
 *   <button id="next-button">Next</button>
 *   <span class="error-message">...</span>
 *   <div class="success-container">...</div>
 *
 * Encapsulates all locators and interactions; contains no test assertions
 * except for the assert* convenience methods used by test specs.
 */
export class AutocompleteFormPage {
  readonly page: Page;

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

  async goto(): Promise<void> {
    await this.page.goto('/autocomplete-form');
  }

  async typeInInput(text: string): Promise<void> {
    await this.inputField.click();
    await this.inputField.fill(text);
  }

  async clearInput(): Promise<void> {
    await this.inputField.fill('');
  }

  async getInputValue(): Promise<string> {
    return this.inputField.inputValue();
  }

  async selectSuggestion(text: string): Promise<void> {
    await this.suggestionItems.getByText(text, { exact: true }).click();
  }

  async clickNext(): Promise<void> {
    await this.nextButton.click();
  }

  async getVisibleSuggestions(): Promise<string[]> {
    const items = await this.suggestionItems.all();
    const visible: string[] = [];
    for (const item of items) {
      if (await item.isVisible()) {
        const text = await item.textContent();
        if (text) visible.push(text.trim());
      }
    }
    return visible;
  }

  async getVisibleSuggestionCount(): Promise<number> {
    return (await this.getVisibleSuggestions()).length;
  }

  async pressKeyInInput(key: string): Promise<void> {
    await this.inputField.focus();
    await this.page.keyboard.press(key);
  }

  async getFocusedElementId(): Promise<string | null> {
    return this.page.evaluate(() => document.activeElement?.id ?? null);
  }

  async getFocusedElementTagName(): Promise<string> {
    return this.page.evaluate(() => document.activeElement?.tagName.toLowerCase() ?? '');
  }

  // ── Assertion helpers ────────────────────────────────────────────────────

  async assertSuccess(): Promise<void> {
    await expect(this.successContainer).toBeVisible();
    await expect(this.errorMessage).not.toBeVisible();
  }

  async assertError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.successContainer).not.toBeVisible();
  }

  async assertErrorText(text: string): Promise<void> {
    await expect(this.errorMessage).toContainText(text);
  }

  async assertInputValue(expected: string): Promise<void> {
    await expect(this.inputField).toHaveValue(expected);
  }

  async assertSuggestionCount(expected: number): Promise<void> {
    const count = await this.getVisibleSuggestionCount();
    expect(count).toBe(expected);
  }

  async assertSuggestionsContain(items: string[]): Promise<void> {
    const visible = await this.getVisibleSuggestions();
    for (const item of items) {
      expect(visible).toContain(item);
    }
  }

  async assertSuggestionsExclude(items: string[]): Promise<void> {
    const visible = await this.getVisibleSuggestions();
    for (const item of items) {
      expect(visible).not.toContain(item);
    }
  }

  async assertFocusedElementId(id: string): Promise<void> {
    const focusedId = await this.getFocusedElementId();
    expect(focusedId).toBe(id);
  }
}

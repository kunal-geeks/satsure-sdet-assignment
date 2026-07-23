# Architecture Discussion

## Test Architecture Overview

This test suite follows the **Page Object Model (POM)** design pattern for UI tests, combined with a **schema-first validation approach** for API tests. The architecture is designed for maintainability, readability, and extensibility.

---

## 1. Design Patterns Used

### Page Object Model (POM)

All UI interactions are encapsulated in Page Object classes located under `tests/ui/pages/`. This separates the "what to test" (test specs) from the "how to interact" (page objects).

**Benefits:**
- Single point of change when the UI changes (update the page object, not all specs).
- Improved readability — test specs read like user stories.
- Reusability — page objects can be shared across multiple test files.

**Structure:**
```
tests/ui/pages/
  AutocompleteFormPage.ts   — All locators and actions for the autocomplete form
  LoginPage.ts              — Login actions (out of scope but scaffolded)
```

### Schema Validation with Zod

API tests use [Zod](https://zod.dev/) to define the expected response schema and validate actual API responses against it. This provides:
- Type-safe schema definitions in TypeScript.
- Detailed validation error messages when a field fails.
- Single source of truth for the data contract.

---

## 2. Folder Structure Rationale

```
tests/
  ui/
    pages/     — Page Object classes (locators + actions, no assertions)
    tests/     — Test specs (assertions + test logic)
    config/    — Playwright configuration, environment variables, base URLs
  api/
    tests/     — API test specs (schema, data type, negative case validation)
```

- **Separation of concerns:** Test logic lives in `tests/`, UI abstraction in `pages/`.
- **Config centralisation:** `config/playwright.config.ts` is the single configuration file for browsers, base URLs, reporters, and timeouts.
- **API independence:** API tests live in their own directory, as they do not depend on browser automation.

---

## 3. Technology Choices

| Technology | Version | Rationale |
|---|---|---|
| Playwright | ^1.44 | First-party Chromium control, auto-waiting, network interception, trace viewer |
| TypeScript | ^5.4 | Static typing catches errors at compile time; full IDE intellisense support |
| Zod | ^3.23 | Lightweight, composable schema validation with TypeScript inference |
| `@playwright/test` | bundled | Built-in test runner, fixtures, parallel execution, HTML reporter |

---

## 4. Network Interception Strategy

For API contract validation (FR-05), Playwright's `page.route()` and `page.waitForResponse()` APIs are used to:

1. **Intercept outbound API calls** from the form submission to capture request payloads.
2. **Mock API responses** for negative test cases (e.g., force a 400 or return invalid data) without requiring a live backend.
3. **Validate response payloads** directly within UI test scenarios (end-to-end data contract testing).

This eliminates the need for a separate HTTP client in UI tests, reducing test complexity while providing full contract coverage.

---

## 5. Mocking Strategy for Offline Testing

Since the test URL (`https://test.com/autocomplete-form`) is a fictitious endpoint, all tests use Playwright's `page.route()` to mock:

- **GET /autocomplete-form** — serves the HTML fixture inline.
- **POST /api/submission** (or equivalent) — returns a mocked 200 success or 4xx error response.
- **GET /api/submission** — returns the sample API response from the assignment for schema validation.

This approach makes the test suite fully self-contained and runnable without a live server.

---

## 6. Accessibility Testing Integration

Keyboard navigation tests (Tab, Enter, Escape) are written using Playwright's keyboard API (`page.keyboard.press()`). These tests serve a dual purpose:
- Functional keyboard interaction validation.
- Basic accessibility (WCAG 2.1 AA) smoke testing.

For deeper accessibility testing, tools like `@axe-core/playwright` could be integrated in future iterations.

---

## 7. Reporting

Playwright's built-in HTML reporter is configured in `playwright.config.ts`. After a test run:

```bash
npm run test:report
```

This opens the interactive HTML report showing:
- Pass/fail status per test.
- Screenshots on failure.
- Network logs.
- Video recordings (configurable).

---

## 8. Future Extensibility

| Feature | Extension Point |
|---|---|
| Cross-browser testing | Add `firefox` and `webkit` to `playwright.config.ts` projects array |
| CI/CD integration | Add `playwright test --reporter=junit` and upload XML artefact |
| Environment-specific config | Use `.env` files with `dotenv` and parameterise base URLs |
| Visual regression | Add `expect(page).toHaveScreenshot()` calls in key test steps |
| Performance | Use `page.metrics()` or integrate Lighthouse via CDP |
| Mobile emulation | Add device emulation to Playwright config for mobile form testing |

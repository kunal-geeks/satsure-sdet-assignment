# SatSure SDET Practical Assignment

**Language:** TypeScript | **Framework:** Playwright | **Test Runner:** @playwright/test

---

## Project Structure

```
├── .env.example                           # Configurable environment variables
├── playwright.config.ts                   # Root Playwright config (BASE_URL, locale, timezone)
├── tsconfig.json                          # TypeScript strict config
├── package.json                           # Dependencies and npm scripts
│
├── docs/
│   ├── 1-requirement-analysis.md
│   ├── 2-test-scenarios.md
│   ├── 3-defect-identification.md
│   ├── 4-test-cases.md
│   ├── 7-ai-reflection.md
│   └── 8-architecture-discussion.md
│
├── tests/
│   ├── ui/
│   │   ├── config/
│   │   │   └── playwright.env.ts          # ENV constants (BASE_URL, USER_EMAIL, etc.)
│   │   ├── data/
│   │   │   └── test-data.ts               # Shared UI test data and constants
│   │   ├── fixtures/
│   │   │   ├── autocomplete-form.html     # Self-contained HTML form fixture
│   │   │   └── page.fixtures.ts           # Playwright test.extend() reusable fixtures
│   │   ├── helpers/
│   │   │   └── route.helpers.ts           # DRY route mocking utilities
│   │   ├── pages/
│   │   │   ├── AutocompleteFormPage.ts    # Page Object Model
│   │   │   └── LoginPage.ts              # Login page scaffold
│   │   └── tests/
│   │       └── autocomplete-form.spec.ts  # 25 UI test cases
│   │
│   └── api/
│       ├── data/
│       │   └── api-test-data.ts           # Sample API responses (compliant + defective)
│       ├── helpers/
│       │   └── api.helpers.ts             # prefixMatch, getErrorPaths, temporal ordering
│       ├── schema/
│       │   └── fr05.schema.ts             # Zod FR-05 data contract schema + types
│       └── tests/
│           └── api-contract.spec.ts       # 50 API contract test cases
│
└── ai-conversation/
    ├── conversation.json                  # Full AI conversation transcript
    └── prompts.md                         # Exact prompts used
```

---

## Installation

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

### 1. Clone the repository

```bash
git clone https://github.com/kunal-geeks/satsure-sdet-assignment.git
cd satsure-sdet-assignment
```

### 2. npm install

```bash
npm install
```

### 3. Playwright install (Chromium browser)

```bash
npm run install:browsers
# or directly:
npx playwright install chromium
```

---

## Configuration

Copy `.env.example` to `.env` and set values for your environment:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `BASE_URL` | `https://test.com` | Application base URL |
| `USER_EMAIL` | `test123@gmail.com` | Test user email |
| `USER_ACCOUNT_ID` | `98765` | Test user account ID |
| `LOCALE` | `en-IN` | Browser locale (IETF BCP 47) |
| `TIMEZONE` | `Asia/Kolkata` | Browser timezone |

You can also pass env vars inline:

```bash
BASE_URL=https://staging.myapp.com npm test
```

---

## Running Tests

### Running all tests

```bash
npm test
```

### Running UI tests only

```bash
npm run test:ui
```

### Running API tests only

```bash
npm run test:api
```

### Run with browser visible (headed mode)

```bash
npm run test:headed
```

### Run in debug mode

```bash
npm run test:debug
```

---

## Report Generation

### HTML Report

Generated automatically after every test run at `playwright-report/`.

```bash
npm run report:html
```

Opens `playwright-report/index.html` in your browser — shows pass/fail, screenshots, traces.

### Allure Report

```bash
# Generate + open in browser
npm run report:allure

# Generate only (no browser open)
npm run report:allure:generate

# Open already-generated report
npm run report:allure:open

# Generate both HTML and Allure
npm run report:all
```

Allure provides: suite breakdown, timeline view, per-test steps, environment info, failure attachments.

---

## Test Coverage

### UI Tests — 25 tests (`tests/ui/tests/autocomplete-form.spec.ts`)

| Group | Count | Coverage |
|---|---|---|
| Suggestion Filtering | 6 | Empty, shared prefix, sub-prefix, no match, clear, exact match |
| Suggestion Selection | 4 | Click each suggestion, verify input and re-filtering |
| Form Submission | 5 | Success, empty error, payload text, suggestion_list scoping, server error |
| Tab Navigation | 3 | Tab order, Shift+Tab, first Tab lands on input |
| Keyboard Interaction | 4 | Enter submits, Escape clears, Escape resets suggestions, Escape hides error |
| Error Validation | 3 | Exact error text, mutual exclusivity on error/success |

### API Tests — 50 tests (`tests/api/tests/api-contract.spec.ts`)

| Group | Count | Coverage |
|---|---|---|
| Schema Validation | 3 | Compliant passes, defective sample fails, all 8 fields required |
| Response Field Validation | 8 | Each field: presence, type, value |
| Data Type Validation | 9 | boolean/string/number for completed, email, text, suggestion_list, account_id |
| Timestamp Validation | 7 | UTC rejected, IST accepted, temporal ordering, plain date rejected |
| Locale Validation | 6 | en rejected, en-IN accepted, various invalid formats |
| Suggestion List Validation | 5 | Prefix logic, exclusion, empty for no match |
| Negative Tests | 12 | 5 missing fields + 5 invalid datatypes + 2 network-level |

**Total: 75 tests | All passing**

---

## Design Patterns & Coding Standards

- **Page Object Model** — all locators and interactions in `AutocompleteFormPage.ts`; specs only call POM methods
- **Playwright `test.extend()` fixtures** — `page.fixtures.ts` provides pre-wired `formPage` fixture eliminating per-test boilerplate
- **DRY route helpers** — `route.helpers.ts` centralises all network mocking; no inline `page.route()` in specs
- **Separated concerns (SOLID)** — schema (`fr05.schema.ts`), data (`api-test-data.ts`), helpers (`api.helpers.ts`) are independent modules
- **Configurable base URL** — `BASE_URL` env var; defaults to `https://test.com`; no hardcoded URLs in tests
- **Type-safe** — full TypeScript strict mode; Zod inferred types for API responses
- **Mock-first** — all tests run offline via `page.route()`; no live server required

---

## Defects Identified in FR-05

| # | Field | Actual (assignment sample) | Expected | Severity |
|---|---|---|---|---|
| D1 | `start_date` | `"2024-03-15T10:30:00Z"` | `"2024-03-15T16:00:00+05:30"` | Critical |
| D2 | `end_date` | `"2024-03-15T10:32:00Z"` | `"2024-03-15T16:02:00+05:30"` | Critical |
| D3 | `locale` | `"en"` | `"en-IN"` | Critical |
| D4 | `completed` | `"true"` (string) | `true` (boolean) | Critical |

See `docs/3-defect-identification.md` for full analysis.

---

## Dependencies

| Package | Purpose |
|---|---|
| `@playwright/test` | Test runner, browser automation, route mocking, fixtures |
| `typescript` | Static typing, strict mode |
| `@types/node` | Node.js type definitions |
| `zod` | Runtime schema validation for FR-05 data contract |
| `allure-playwright` | Allure reporter plugin for Playwright |
| `allure-commandline` | Allure CLI to generate HTML report from raw results |

---

## CI/CD

GitHub Actions workflow at `.github/workflows/playwright.yml` runs on every push/PR to `main`/`develop`:

- Installs Node.js 20 + Playwright Chromium
- Runs all 75 tests
- Uploads **Playwright HTML report** artifact (30 days)
- Generates and uploads **Allure report** artifact (30 days)
- Deploys Allure report to **GitHub Pages** on `main` branch
- Uploads failure traces/screenshots/videos on test failure (7 days)

---

## AI Usage

- `docs/7-ai-reflection.md` — tools used, modifications, limitations
- `ai-conversation/conversation.json` — full AI conversation transcript (JSON)
- `ai-conversation/prompts.md` — exact prompts used

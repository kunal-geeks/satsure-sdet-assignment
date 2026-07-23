# SatSure SDET Practical Assignment

**Language:** TypeScript | **Framework:** Playwright | **Test Runner:** @playwright/test

---

## Project Structure

```
├── README.md                          # This file
├── package.json                       # Dependencies and npm scripts
├── tsconfig.json                      # TypeScript configuration
├── playwright.config.ts               # Playwright root configuration
├── _Practical Assignment_SDET.md      # Original assignment document
│
├── docs/
│   ├── 1-requirement-analysis.md     # FR breakdown, edge cases, gaps
│   ├── 2-test-scenarios.md           # Top 10 scenarios ranked by risk
│   ├── 3-defect-identification.md    # Defects vs FR-05 API response
│   ├── 4-test-cases.md               # 12 detailed test cases (TC-01 to TC-12)
│   ├── 7-ai-reflection.md            # AI tools, usage, modifications, limitations
│   └── 8-architecture-discussion.md  # Design patterns, folder rationale, tech choices
│
├── tests/
│   ├── ui/
│   │   ├── pages/
│   │   │   ├── AutocompleteFormPage.ts   # Page Object Model — all form interactions
│   │   │   └── LoginPage.ts              # Login page scaffold (out of scope)
│   │   ├── tests/
│   │   │   └── autocomplete-form.spec.ts # 18 UI test cases
│   │   ├── fixtures/
│   │   │   └── autocomplete-form.html    # Self-contained HTML form fixture
│   │   └── config/
│   │       └── playwright.env.ts         # Environment config reference
│   └── api/
│       └── tests/
│           └── api-contract.spec.ts      # 24 API contract test cases
│
└── ai-conversation/
    ├── conversation.json              # Full AI conversation transcript (JSON)
    └── prompts.md                     # Exact prompts used
```

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/kunal-geeks/satsure-sdet-assignment.git
cd satsure-sdet-assignment
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install Playwright browsers

```bash
npm run install:browsers
```

---

## Running the Tests

### Run all tests (UI + API)

```bash
npm test
```

### Run only UI tests

```bash
npm run test:ui
```

### Run only API tests

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

### View HTML report after a test run

```bash
npm run test:report
```

---

## Test Coverage Summary

### UI Tests (`tests/ui/tests/autocomplete-form.spec.ts`) — 18 tests

| Group | Tests |
|---|---|
| Suggestion Filtering | Empty input shows all, prefix match, no match, reset after clear |
| Suggestion Selection | Click exact item, verify input populated, verify re-filtering |
| Form Submission | Success on 200, error on empty, payload text, suggestion_list scoping |
| Keyboard Navigation | Tab order, Enter submits, Escape clears, Shift+Tab reverses |

### API Tests (`tests/api/tests/api-contract.spec.ts`) — 24 tests

| Group | Tests |
|---|---|
| Schema Validation | Compliant response passes; assignment sample fails with 4 defects |
| Data Type Validation | Boolean/string/number checks for completed, email, text |
| Timestamp Validation | UTC rejected, +05:30 accepted, temporal ordering |
| Locale Validation | en rejected, en-IN accepted, wrong casing rejected |
| suggestion_list Validation | Prefix-match logic, empty for no match |
| Negative Tests | Missing text (400), invalid locale (422), wrong types |

**Total: 42 tests | All passing**

---

## Defects Identified in FR-05 (Task 2)

The sample API response in the assignment contains **4 Critical defects**:

| # | Field | Actual | Expected | Severity |
|---|---|---|---|---|
| D1 | `start_date` | `"2024-03-15T10:30:00Z"` (UTC) | `"2024-03-15T16:00:00+05:30"` (IST) | Critical |
| D2 | `end_date` | `"2024-03-15T10:32:00Z"` (UTC) | `"2024-03-15T16:02:00+05:30"` (IST) | Critical |
| D3 | `locale` | `"en"` | `"en-IN"` (IETF BCP 47 with region) | Critical |
| D4 | `completed` | `"true"` (string) | `true` (boolean) | Critical |

See `docs/3-defect-identification.md` for full analysis.

---

## Architecture

- **Page Object Model (POM):** All UI locators and actions are encapsulated in `AutocompleteFormPage.ts`. Test specs only call page object methods and assertions.
- **Mock-first approach:** Tests use Playwright's `page.route()` to mock all network calls. The suite runs fully offline — no live server required.
- **Zod schema validation:** The FR-05 data contract is codified as a Zod schema, giving type-safe, self-documenting, and reusable validation.
- **HTML fixture:** A self-contained HTML file (`tests/ui/fixtures/autocomplete-form.html`) implements the form behaviour from the spec, including prefix filtering, suggestion selection, and Escape key handling.

See `docs/8-architecture-discussion.md` for full details.

---

## AI Usage

This assignment was completed with assistance from **GitHub Copilot (Claude Sonnet)** via VS Code Copilot CLI.

- See `docs/7-ai-reflection.md` for tools used, modifications made, and limitations identified.
- See `ai-conversation/conversation.json` for the full AI conversation transcript.
- See `ai-conversation/prompts.md` for the exact prompts submitted.

---

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@playwright/test` | ^1.44.0 | Test runner, browser automation, network mocking |
| `typescript` | ^5.4.5 | Static typing |
| `@types/node` | ^20.12.0 | Node.js type definitions |
| `zod` | ^3.23.0 | Runtime schema validation for API contract |

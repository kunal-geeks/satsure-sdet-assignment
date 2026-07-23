# AI Prompts Used — SatSure SDET Assignment

Exact prompts submitted to **GitHub Copilot (Claude Sonnet)** via VS Code Copilot CLI during this session.

---

## Prompt 1 — Initial Assignment

```
Based On Practical Assignment_SDET.md file complete the assignment as directed.
Also attach the transcript of the AI conversation in the json format in the folder
structure as per the assignment and answer everything.
Use playwright and typescript.
```

**Context:** Full content of `_Practical Assignment_SDET.md` provided.

---

## Prompt 2 — Add .gitignore and CI/CD

```
create .gitignore file and ci cd thrio github action
```

**Output:** `.gitignore` and `.github/workflows/playwright.yml` created.

---

## Prompt 3 — Add Dual Reporting

```
unable to see the report so add detailed reporting both allure and html
```

**Output:** `allure-playwright` + `allure-commandline` installed; playwright.config.ts updated with dual reporters; CI/CD updated to generate and publish both reports including GitHub Pages deployment.

---

## Prompt 4 — Full Enterprise Compliance Audit

```
Implement all functional requirements. UI Tests must include:
- Tab Navigation
- Keyboard interaction
- Suggestion filtering
- Suggestion selection
- Successful form submission
- Invalid form submission
- Error validation
- Page Object Model
- Reusable fixtures
- Clean assertions
- Configurable base URL

API Tests must include:
- Schema validation
- Response field validation
- Data type validation
- Timestamp validation
- Locale validation
- Suggestion list validation
- Negative tests
- Missing field tests
- Invalid datatype tests

Coding Standards:
- SOLID principles
- DRY
- Page Object Model
- Helper utilities
- Reusable locators
- Comments only where necessary
- Type-safe code
- Enterprise folder structure

README should include:
- Installation
- npm install
- Playwright install
- Running UI tests
- Running API tests
- Running all tests
- Report generation

verify all these if not then update accordingly
```

**Output:** Full enterprise refactor — test count grew from 42 → 75. New layers: `data/`, `helpers/`, `schema/`, `fixtures/`. All tests passing.

---

## Prompt 5 — Commit

```
commit
```

**Output:** `git add -A` staged all changes. Commit attempted (requires local git credentials).

---

## Prompt 6 — Update AI Conversation JSON

```
update the ai conversation json also to contain the complete chat history updated fully
```

**Output:** `ai-conversation/conversation.json` updated with all 15 turns of the complete session including timestamps, actions, files, bugs fixed, gap analysis, and final summary.

---

## Key Corrections Applied by Human Reviewer

1. **Timestamp defect severity** — AI classified as "formatting note"; human elevated to Critical citing FR-05 wording "user's local time"
2. **Playwright selectors** — AI generated generic selectors; human corrected to exact spec-defined IDs/classes
3. **Negative test coverage** — AI produced 1 negative test; human prompted expansion to 12 (5 missing fields + 5 invalid datatypes + 2 network-level)
4. **Architecture** — AI produced monolithic test files; human prompted full SOLID/DRY separation into `data/`, `helpers/`, `schema/`, `fixtures/` layers

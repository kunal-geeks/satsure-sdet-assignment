# Requirement Analysis

## Feature: Autocomplete Form

**URL:** `https://test.com/autocomplete-form`  
**Context:** Post-login redirect; configurable by Admin (login and admin config are out of scope).

---

## FR-01: Text Input

**Summary:** Users can type freely in the text input field OR click/tap a suggestion item to populate the field.

**Analysis:**
- Two input modes: manual typing and suggestion click/tap.
- Both modes populate the same `<input id="input-field">` element.
- No character restriction is mentioned; however, the backend validates the input on submission.
- Clicking a suggestion should transfer its full text into the input field.

**Assumptions:**
- The input field accepts all printable characters.
- Suggestion click triggers the same field-update mechanism as typing.
- Mobile tap should behave identically to desktop click (not in scope for automation, noted for risk).

---

## FR-02: Suggestion Filtering (Prefix Match — Default)

**Summary:** Suggestions visible only when typed text matches the START of the suggestion string.

**Analysis:**
- Default behaviour — no backend flag required.
- Case sensitivity is unspecified; safest assumption is case-insensitive matching.
- If typed text matches no suggestion prefix, the suggestion list becomes empty (all `<li>` items hidden).
- Partial prefix still shows matching suggestions; e.g. typing "ag" shows all three default suggestions.

**Edge cases identified:**
- Empty input — all suggestions should be visible.
- Whitespace-only input — unclear; likely no match.
- Exact full-match input — only the exact suggestion remains.
- Input exceeds longest suggestion — no matches.

---

## FR-03: Suggestion Filtering (Match Anywhere — Configurable)

**Summary:** When backend flag is enabled, suggestions are retained if the typed text appears ANYWHERE in the suggestion string.

**Analysis:**
- Requires backend config change; not testable without admin access.
- "Match anywhere" is a superset of prefix match.
- Typing "agile method" keeps all three default suggestions because all contain that substring.
- Risk: Backend config flag mismatch could silently change filtering behaviour without UI indication.

---

## FR-04: Form Submission

**Summary:** Clicking "Next" fires a REST API call; 200 → success message, invalid input → error message.

**Analysis:**
- Success condition: HTTP 200.
- Failure condition: non-200 (likely 4xx for invalid input, 5xx for server errors).
- UI elements: `<button id="next-button">`, `<span class="error-message">`, `<div class="success-container">`.
- The "invalid input" scenario implies server-side validation beyond what the frontend filters.
- Error message text: `"Error: Invalid input. Please select a valid suggestion."`
- Success message text: `"Success! Your response has been recorded."`

**Assumptions:**
- Only one of success or error is displayed at a time.
- The button is accessible via Enter key (standard HTML button behaviour).
- Network errors (timeout, 5xx) should display an appropriate error state (not explicitly specified — gap in requirements).

---

## FR-05: Backend Data Contract

**Summary:** The persisted payload must contain 8 specific properties with defined formats.

| Property | Type | Format / Constraint |
|---|---|---|
| account_id | string/number | ID of authenticated user |
| account_email | string | Valid email of authenticated user |
| start_date | timestamp | User's **local** time (IST for test environment) |
| end_date | timestamp | User's **local** time (IST for test environment) |
| locale | string | IETF BCP 47, e.g. `en-IN` |
| text | string | Exact text from input field |
| suggestion_list | string | Comma-separated; only suggestions matching current input |
| completed | boolean | `true`/`false` (JSON boolean, NOT string) |

**Analysis — Gaps & Risks:**

1. **Timestamp format**: `start_date`/`end_date` must be in local time. The test environment is IST (UTC+05:30). UTC timestamps with `Z` suffix are non-compliant.
2. **locale format**: Must include region subtag. `"en"` is insufficient; `"en-IN"` is required.
3. **completed type**: Must be a JSON boolean. String `"true"` is incorrect.
4. **suggestion_list scope**: Must contain only suggestions that match the submitted text — not the entire suggestion list.
5. **start_date / end_date ordering**: `end_date` must be ≥ `start_date`. A reversed or equal timestamp could indicate a bug.
6. **account_id / account_email**: Must correspond to the authenticated user. No cross-user data leakage.

---

## Test Environment Constraints

| Parameter | Value |
|---|---|
| Browser | Chrome on Windows 10 |
| Language | English |
| Login user | test123@gmail.com |
| Location | India |
| Timezone | IST (UTC+05:30) |
| Locale (expected) | en-IN |

---

## Scope Boundaries

| In Scope | Out of Scope |
|---|---|
| Autocomplete form UI behaviour | Login flow |
| Suggestion filtering (prefix / anywhere) | Admin configuration UI |
| Form submission (success / error) | User registration |
| Backend data contract (FR-05) | Payment or other post-form pages |
| Keyboard & tab accessibility | Mobile-specific gestures |
| API schema validation | Load / performance testing |

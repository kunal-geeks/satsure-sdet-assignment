# AI Reflection — Task 6

## a. Tools Used

- **GitHub Copilot (Claude Sonnet)** via VS Code Copilot CLI — used throughout the entire assignment as the primary AI assistant.

---

## b. Usage Areas

The AI was used to assist with:

1. **Requirement Analysis (Task 1):** Generating an initial breakdown of each functional requirement, identifying edge cases, assumptions, and gaps in the spec.

2. **Test Scenario Identification (Task 2):** Proposing an initial list of test scenarios and risk classifications. The AI's suggestions were reviewed, re-ranked, and supplemented with scenarios it initially missed.

3. **Defect Identification (Task 3):** Comparing the sample API response against FR-05. The AI correctly identified the `completed` type mismatch and the `locale` gap. However, it initially missed the timezone offset issue (see Section d).

4. **Test Case Writing (Task 4):** Generating structured test case templates with Test Case ID, Title, Preconditions, Steps, Expected Results, and Test Data. The AI provided a good starting scaffold that was then refined for accuracy and completeness.

5. **Playwright TypeScript Code (Task 5 / Task 4):** Generating Page Object Model classes, test specs for UI navigation, filtering, selection, submission, and API schema validation scripts using Zod.

6. **API Test Scripts (Task 5):** Writing schema validation, data-type checks, locale format validation, suggestion_list scoping, and negative test cases.

7. **Architecture Discussion:** Drafting the architecture and design pattern documentation.

---

## c. Modifications Made

### Modification 1 — Corrected Timezone Defect Classification

**AI Output:**  
The AI initially described the `start_date`/`end_date` discrepancy as a "formatting issue" — stating the timestamps use UTC, whereas ISO 8601 allows both UTC and offset formats.

**What I Changed:**  
I elevated this from a "formatting note" to a **Critical defect** and added a precise explanation:

> FR-05 states: *"Timestamp in the user's local time"*. This is an explicit requirement, not a formatting preference. UTC (`Z`) timestamps are technically valid ISO 8601 but are NOT local time for an IST user. The correct value for `10:30 UTC` in IST is `16:00:00+05:30`. This is a data contract violation — the backend must apply the user's timezone offset before persisting.

**Reasoning:**  
The AI treated this as a cosmetic difference. I recognised it as a semantic violation of the data contract — the stored value misrepresents the actual local time. An analytics system relying on these timestamps for "what time did the user complete the form?" would be wrong by 5 hours 30 minutes.

---

### Modification 2 — Tightened `suggestion_list` Expected Behaviour in Test Cases

**AI Output:**  
The AI generated a test case for `suggestion_list` that simply checked "the list is not empty." It passed the scenario where all three suggestions were in the list without asserting whether non-matching suggestions were excluded.

**What I Changed:**  
I rewrote the test case (TC-04 / API test for suggestion_list) to:
1. Assert that only suggestions matching the **current input value** at time of submission are included.
2. Add an assertion that verifies the number of suggestions in the list (not just non-empty).
3. Added a specific sub-case: if the input is "agile methodology process", the list must NOT include "agile methodology" (which doesn't start with "agile methodology process").

**Reasoning:**  
FR-05 states "matching the value entered/selected". The AI interpreted this loosely. I applied strict prefix-match logic: if the user typed/selected X, only suggestions with X as a prefix belong in `suggestion_list`. Broader inclusion misrepresents the user's filtering context.

---

### Modification 3 — Added Negative API Test Cases

**AI Output:**  
The AI initially generated only happy-path API tests and one negative case (wrong data type for `completed`).

**What I Changed:**  
I added two additional negative test cases:
1. **Missing required fields** — submitting a payload without the `text` field.
2. **Invalid locale format** — submitting with `locale: "english"` (not a valid BCP 47 tag).

These were added to the API test spec with assertions on HTTP 400/422 status codes and error response bodies.

**Reasoning:**  
The assignment explicitly requires at least 2 negative test cases. The AI's initial output had only 1. Additionally, validating the API's rejection of invalid data is as important as validating correct data acceptance.

---

## d. AI Limitations

### Limitation 1 — Initial Misclassification of UTC vs. Local Time Defect

The AI initially failed to identify the UTC timestamp as a **data contract violation**. It recognised the `Z` suffix as "technically valid ISO 8601" and treated it as acceptable. It required explicit prompting with the FR-05 wording ("user's local time") to re-evaluate and correctly classify it as a Critical defect.

**Root cause:** The AI has strong exposure to ISO 8601 as a universal standard and defaulted to "UTC is fine" — a common engineering assumption — without grounding the judgement in the specific requirement text.

---

### Limitation 2 — Generic Playwright Selectors Without HTML Context

When first generating the Playwright Page Object, the AI used generic CSS selectors (`.form-container input`, `.suggestions li:first-child`) without referencing the specific IDs and classes from the provided HTML. I had to correct the selectors to use the exact attributes from the spec: `#input-field`, `#next-button`, `.suggestions`, `.error-message`, `.success-container`.

**Root cause:** The AI generated plausible but imprecise selectors by pattern-matching from similar form structures rather than parsing the specific HTML structure provided in the assignment.

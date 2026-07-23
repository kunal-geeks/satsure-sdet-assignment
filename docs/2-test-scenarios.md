# Top 10 Test Scenarios — Autocomplete Form

Ranked highest to lowest risk. Risk is assessed based on data integrity impact, user experience degradation, and compliance with the specified data contract.

---

## Rank 1

**Summary:** Submitted API payload contains `start_date`/`end_date` in UTC (`Z`) instead of user's local IST timezone.  
**Risk Level:** Critical  
**Rationale:** Timestamps with incorrect timezone violate FR-05 explicitly and corrupt audit/analytics data for every submission — a systemic data-integrity defect affecting all users.

---

## Rank 2

**Summary:** `completed` field is persisted as string `"true"` instead of JSON boolean `true`.  
**Risk Level:** Critical  
**Rationale:** A wrong data type breaks downstream consumers (dashboards, ETL pipelines, conditional logic) that perform strict boolean comparison; affects 100% of submissions.

---

## Rank 3

**Summary:** `locale` field contains `"en"` (language-only tag) instead of the required IETF BCP 47 `"en-IN"` (language + region).  
**Risk Level:** Critical  
**Rationale:** Missing region subtag means locale-based routing, content personalisation, and regulatory compliance checks all fail silently for every Indian user.

---

## Rank 4

**Summary:** Suggestion list filtering (prefix match) does not hide suggestions when typed text does not match any prefix.  
**Risk Level:** High  
**Rationale:** Core UI feature; if filtering is broken, users may see irrelevant suggestions and submit incorrect data, breaking the intended guided-input flow.

---

## Rank 5

**Summary:** Clicking a suggestion item does NOT populate the input field with the selected text.  
**Risk Level:** High  
**Rationale:** One of the two primary input modes (FR-01); if selection fails, users cannot complete the form without typing manually, breaking the advertised UX.

---

## Rank 6

**Summary:** Form submission with an empty input field does not display the error message.  
**Risk Level:** High  
**Rationale:** Missing validation gate allows blank or invalid submissions to reach the API, corrupting the `text` field in the stored record and producing misleading `suggestion_list` values.

---

## Rank 7

**Summary:** `suggestion_list` in the API response includes suggestions that do NOT match the submitted input text.  
**Risk Level:** High  
**Rationale:** FR-05 requires only matching suggestions; including non-matching ones pollutes analytics and misrepresents user intent in downstream reporting.

---

## Rank 8

**Summary:** Keyboard Tab navigation does not correctly cycle through form elements (input → suggestions → Next button).  
**Risk Level:** Medium  
**Rationale:** Accessibility requirement; failure blocks keyboard-only and assistive-technology users from completing the form, risking WCAG non-compliance.

---

## Rank 9

**Summary:** Pressing Enter on the Next button while a suggestion is highlighted submits the form instead of selecting the suggestion.  
**Risk Level:** Medium  
**Rationale:** Keyboard interaction ambiguity (Enter = select vs. submit) can cause unintentional submissions with the wrong input text.

---

## Rank 10

**Summary:** "Match Anywhere" suggestion filtering (FR-03) continues to function when the backend config flag is disabled (falls back to prefix match).  
**Risk Level:** Low  
**Rationale:** Config-controlled behaviour; incorrect fallback is an edge-case regression limited to misconfigured environments and not the default path. Its impact is contained, but it should still be verified.

---

## Summary Table

| Rank | Summary | Risk Level |
|---|---|---|
| 1 | Timestamps in UTC instead of IST | Critical |
| 2 | `completed` is a string not a boolean | Critical |
| 3 | `locale` missing region subtag | Critical |
| 4 | Prefix filtering fails to hide non-matching suggestions | High |
| 5 | Suggestion click does not populate input | High |
| 6 | Empty submission shows no error | High |
| 7 | `suggestion_list` includes non-matching suggestions | High |
| 8 | Tab navigation order is incorrect | Medium |
| 9 | Enter key submits instead of selecting highlighted suggestion | Medium |
| 10 | Match-anywhere filtering not falling back to prefix match | Low |

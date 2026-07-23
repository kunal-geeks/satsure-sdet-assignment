# Defect Identification — FR-05 API Response Analysis

## Scenario

After completing the autocomplete form by selecting **"agile methodology"** from the suggestion list, a GET request to the API returns the following response:

```json
{
  "account_id": "98765",
  "account_email": "test123@gmail.com",
  "start_date": "2024-03-15T10:30:00Z",
  "end_date": "2024-03-15T10:32:00Z",
  "locale": "en",
  "text": "agile methodology",
  "suggestion_list": "agile methodology, agile methodology process, agile methodology process testing",
  "completed": "true"
}
```

**Test environment:** Chrome on Windows 10, English, user location India (IST, UTC+05:30), login: test123@gmail.com

---

## Discrepancies Found

### Defect 1 — Timestamps Not in User's Local Time

| Field | Actual Value | Expected Value | FR Reference |
|---|---|---|---|
| `start_date` | `"2024-03-15T10:30:00Z"` | `"2024-03-15T16:00:00+05:30"` | FR-05: *"Timestamp in the user's local time"* |
| `end_date` | `"2024-03-15T10:32:00Z"` | `"2024-03-15T16:02:00+05:30"` | FR-05: *"Timestamp in the user's local time"* |

**Explanation:**  
The response contains UTC timestamps (indicated by the trailing `Z` = UTC/Zulu). The requirement explicitly states timestamps must be in **the user's local time**. For a user in India (IST = UTC+05:30), the correct timestamp representation is `10:30 UTC` → `16:00 IST`, written as `2024-03-15T16:00:00+05:30`. Both `start_date` and `end_date` are in violation.

**Severity:** Critical — affects every submission, corrupts time-based analytics, violates data contract.

---

### Defect 2 — `locale` Missing Region Subtag

| Field | Actual Value | Expected Value | FR Reference |
|---|---|---|---|
| `locale` | `"en"` | `"en-IN"` | FR-05: *"IETF BCP 47 format (e.g., en-IN)"* |

**Explanation:**  
The requirement explicitly gives `en-IN` as an example. IETF BCP 47 language tags consist of a primary language subtag (`en`) optionally followed by a region subtag (`IN`). The value `"en"` is a valid BCP 47 tag but is under-specified — it does not convey the user's geographic region (India). The test environment is India with the browser language set to English, so the correct tag is `"en-IN"`. This can affect locale-based content delivery, tax/regulatory logic, and downstream i18n systems.

**Severity:** Critical — wrong locale for every Indian user.

---

### Defect 3 — `completed` Field is a String Instead of a Boolean

| Field | Actual Value | Expected Value | FR Reference |
|---|---|---|---|
| `completed` | `"true"` (string) | `true` (boolean) | FR-05: *"Boolean representing the status of form response upload"* |

**Explanation:**  
The requirement specifies `completed` as a **Boolean**. In the JSON response, `"true"` (with surrounding double-quotes) is a string literal. The correct JSON representation of a boolean true value is `true` (without quotes). This distinction matters critically because:
- `"true" === true` is `false` in strict type comparison (e.g., JavaScript, Python, Java).
- ETL pipelines, dashboards, and API consumers that check `if (completed === true)` would fail silently.
- Any consumer using strict schema validation (JSON Schema, Zod, Pydantic) would reject the response.

**Severity:** Critical — breaks type-safe consumers; affects 100% of submissions.

---

## Summary of Defects

| # | Field | Actual | Expected | Severity |
|---|---|---|---|---|
| D1 | `start_date` | UTC (`Z`) | IST (`+05:30`) | Critical |
| D2 | `end_date` | UTC (`Z`) | IST (`+05:30`) | Critical |
| D3 | `locale` | `"en"` | `"en-IN"` | Critical |
| D4 | `completed` | `"true"` (string) | `true` (boolean) | Critical |

---

## Fields That Are Correct

| Field | Value | Assessment |
|---|---|---|
| `account_id` | `"98765"` | Matches authenticated user (assumed) ✅ |
| `account_email` | `"test123@gmail.com"` | Matches login credentials ✅ |
| `text` | `"agile methodology"` | Matches user selection ✅ |
| `suggestion_list` | all three suggestions | All three suggestions start with "agile methodology" (prefix match) ✅ |

> **Note on `suggestion_list`:** The user selected "agile methodology". With prefix-match filtering active, all three suggestions (`agile methodology`, `agile methodology process`, `agile methodology process testing`) match the prefix and are correctly included. If "Match Anywhere" mode (FR-03) were active, the same result applies. The list is correct for this scenario.

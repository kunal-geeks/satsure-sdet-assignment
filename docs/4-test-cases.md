# Detailed Test Cases — Autocomplete Form

## Test Environment

- **Browser:** Chrome on Windows 10
- **Language:** English
- **User:** test123@gmail.com
- **Timezone:** IST (UTC+05:30)
- **URL:** https://test.com/autocomplete-form

---

## TC-01: Successful Form Submission via Suggestion Selection

**Test Case ID:** TC-01  
**Title:** Verify successful form submission after selecting a suggestion from the list  
**Risk Level:** Critical

**Preconditions:**
1. User is logged in as test123@gmail.com.
2. User has been redirected to the autocomplete form page.
3. The suggestion list contains: "agile methodology", "agile methodology process", "agile methodology process testing".

**Test Steps:**
1. Navigate to `https://test.com/autocomplete-form`.
2. Verify the page loads with the input field, suggestion list (3 items), and Next button visible.
3. Click the suggestion item "agile methodology" from the list.
4. Verify the input field now contains the text "agile methodology".
5. Click the "Next" button.
6. Observe the API call fired (via network interception).
7. Verify the HTTP response status is 200.
8. Verify the success message "Success! Your response has been recorded." is displayed.
9. Verify the error message is NOT displayed.

**Expected Results:**
- Input field populated with "agile methodology" after step 3.
- Next button triggers a REST API POST call.
- HTTP 200 response is received.
- `<div class="success-container">` becomes visible.
- `<span class="error-message">` remains hidden.

**Test Data:**
- User: test123@gmail.com
- Selected suggestion: "agile methodology"

---

## TC-02: Error Message on Invalid/Empty Input Submission

**Test Case ID:** TC-02  
**Title:** Verify error message is displayed when submitting with empty input  
**Risk Level:** High

**Preconditions:**
1. User is logged in as test123@gmail.com.
2. User is on the autocomplete form page.
3. Input field is empty (default state).

**Test Steps:**
1. Navigate to `https://test.com/autocomplete-form`.
2. Confirm input field is empty.
3. Click the "Next" button without entering any text or selecting a suggestion.
4. Observe the response.

**Expected Results:**
- The API call is fired or a client-side validation fires.
- An error message "Error: Invalid input. Please select a valid suggestion." is displayed.
- `<span class="error-message">` becomes visible.
- `<div class="success-container">` remains hidden.
- User remains on the same form page.

**Test Data:**
- Input: (empty)

---

## TC-03: Prefix Filtering — Suggestions Disappear on Non-Matching Input

**Test Case ID:** TC-03  
**Title:** Verify suggestions are hidden when typed text does not match any suggestion prefix  
**Risk Level:** High

**Preconditions:**
1. User is on the autocomplete form page.
2. Default suggestions visible: "agile methodology", "agile methodology process", "agile methodology process testing".

**Test Steps:**
1. Click on the input field.
2. Type the text "xyz".
3. Observe the suggestion list.

**Expected Results:**
- None of the three default suggestions are visible.
- The suggestion list (`<ul class="suggestions">`) is empty or all `<li>` items are hidden.

**Test Data:**
- Input: "xyz" (matches no suggestion prefix)

---

## TC-04: Prefix Filtering — Suggestions Visible on Matching Prefix

**Test Case ID:** TC-04  
**Title:** Verify only matching prefix suggestions remain visible when typing partial text  
**Risk Level:** High

**Preconditions:**
1. User is on the autocomplete form page.
2. All three default suggestions are visible.

**Test Steps:**
1. Click on the input field.
2. Type "agile methodology process".
3. Observe the suggestion list.

**Expected Results:**
- "agile methodology process" is visible.
- "agile methodology process testing" is visible.
- "agile methodology" is NOT visible (it does not start with "agile methodology process").

**Test Data:**
- Input: "agile methodology process"

---

## TC-05: Tab Keyboard Navigation Through Form Elements

**Test Case ID:** TC-05  
**Title:** Verify Tab key navigates sequentially through form elements  
**Risk Level:** Medium

**Preconditions:**
1. User is on the autocomplete form page.
2. No element is currently focused.

**Test Steps:**
1. Press Tab to focus the first form element.
2. Verify focus moves to the input field (`#input-field`).
3. Press Tab again.
4. Verify focus moves to the first suggestion list item (`<li>` in `<ul class="suggestions">`).
5. Continue pressing Tab through remaining suggestion items.
6. After the last suggestion, press Tab.
7. Verify focus moves to the "Next" button (`#next-button`).
8. Press Shift+Tab to navigate backwards.
9. Verify focus returns to the last suggestion item.

**Expected Results:**
- Tab order: input field → suggestion items (in order) → Next button.
- Shift+Tab reverses the order.
- Each focused element is visually highlighted (focus ring visible).

**Test Data:**
- N/A

---

## TC-06: Enter Key Submits Form When Next Button is Focused

**Test Case ID:** TC-06  
**Title:** Verify pressing Enter when Next button is focused submits the form  
**Risk Level:** Medium

**Preconditions:**
1. User is on the autocomplete form page.
2. A valid suggestion has been selected or typed text matches a suggestion.

**Test Steps:**
1. Type "agile methodology" in the input field.
2. Press Tab until the "Next" button gains focus.
3. Press Enter.
4. Observe the network call and UI response.

**Expected Results:**
- The REST API call is triggered.
- HTTP 200 is received.
- Success message is displayed.

**Test Data:**
- Input: "agile methodology"

---

## TC-07: Escape Key Clears Input Field

**Test Case ID:** TC-07  
**Title:** Verify pressing Escape clears the input field or closes the suggestion dropdown  
**Risk Level:** Medium

**Preconditions:**
1. User is on the autocomplete form page.
2. Input field contains typed text and suggestions are filtered.

**Test Steps:**
1. Click on the input field.
2. Type "agile".
3. Verify suggestions are filtered (all three visible since all start with "agile").
4. Press the Escape key.
5. Observe the input field and suggestion list.

**Expected Results:**
- The input field is cleared (empty), OR the suggestion list is collapsed/hidden.
- The form is still on the page (no navigation).

**Test Data:**
- Input before Escape: "agile"

---

## TC-08: API Response — `completed` Field Must Be JSON Boolean

**Test Case ID:** TC-08  
**Title:** Verify that the `completed` field in the API response is a JSON boolean, not a string  
**Risk Level:** Critical

**Preconditions:**
1. User is logged in as test123@gmail.com.
2. A form submission has been successfully made with "agile methodology".

**Test Steps:**
1. Complete the form by selecting "agile methodology" and clicking Next.
2. Capture the GET API response for the submission.
3. Parse the JSON response body.
4. Inspect the raw type of the `completed` field.

**Expected Results:**
- The raw JSON value of `completed` is `true` (without quotes) — a boolean primitive.
- Strict type check: `typeof completed === 'boolean'` returns `true`.
- `completed !== "true"` (not a string).

**Test Data:**
- API response field: `completed`
- Valid: `true` (boolean)
- Invalid: `"true"` (string)

---

## TC-09: API Response — `locale` Must Be IETF BCP 47 Format with Region Subtag

**Test Case ID:** TC-09  
**Title:** Verify that the `locale` field matches IETF BCP 47 format including the region subtag  
**Risk Level:** Critical

**Preconditions:**
1. Browser language set to English on Windows 10.
2. User location is India (IST).
3. A form submission has been completed.

**Test Steps:**
1. Complete the form and capture the GET API response.
2. Extract the `locale` field from the response.
3. Validate the value against the regex pattern `^[a-z]{2,3}(-[A-Z]{2,3})?$`.
4. Verify the value is exactly `"en-IN"` for the test environment (English + India).

**Expected Results:**
- `locale` equals `"en-IN"`.
- The value matches the IETF BCP 47 pattern (2-letter language code hyphen 2-letter country code).
- `locale` does NOT equal just `"en"` (missing region subtag).

**Test Data:**
- Expected locale: `"en-IN"`

---

## TC-10: API Response — `start_date` and `end_date` Must Be in Local Time (IST)

**Test Case ID:** TC-10  
**Title:** Verify that timestamps are stored in the user's local timezone (IST, UTC+05:30)  
**Risk Level:** Critical

**Preconditions:**
1. User is in India; browser/OS timezone is IST (UTC+05:30).
2. A form submission has been completed.

**Test Steps:**
1. Note the local time before clicking "Next" (T1).
2. Complete and submit the form.
3. Note the local time after clicking "Next" (T2).
4. Retrieve the GET API response.
5. Extract `start_date` and `end_date`.
6. Verify that the timezone offset in both timestamps is `+05:30`.
7. Verify that `start_date` ≤ `end_date`.
8. Verify that `start_date` is within the form's session time window.

**Expected Results:**
- Both timestamps end with `+05:30` (not `Z`).
- Example valid format: `"2024-03-15T16:00:00+05:30"`.
- `end_date` is greater than or equal to `start_date`.
- Timestamps fall within the actual form interaction window.

**Test Data:**
- Expected offset: `+05:30`
- Invalid: timestamps ending in `Z` (UTC)

---

## TC-11: Suggestion Selection Populates Input Field

**Test Case ID:** TC-11  
**Title:** Verify clicking a suggestion from the list populates the input field with its exact text  
**Risk Level:** High

**Preconditions:**
1. User is on the autocomplete form page.
2. All three default suggestions are visible.

**Test Steps:**
1. Click on the suggestion "agile methodology process" in the list.
2. Observe the input field value.
3. Observe the suggestion list state after selection.

**Expected Results:**
- The input field contains exactly "agile methodology process".
- The suggestion list is updated to reflect filtered state (only suggestions matching "agile methodology process" remain visible).

**Test Data:**
- Clicked suggestion: "agile methodology process"
- Expected input value: "agile methodology process"

---

## TC-12: Negative API Test — Missing Required Fields

**Test Case ID:** TC-12  
**Title:** Verify API returns an error when required fields are missing from the submission payload  
**Risk Level:** High

**Preconditions:**
1. Direct API access is available.
2. Authentication token for test123@gmail.com is available.

**Test Steps:**
1. Send a POST request to the form submission API endpoint.
2. Omit the `text` field from the request body.
3. Observe the HTTP status code and response body.

**Expected Results:**
- HTTP status 400 (Bad Request) or 422 (Unprocessable Entity) is returned.
- Response body contains an error message indicating the missing field.
- No record is persisted in the database.

**Test Data:**
- Payload: `{ "account_id": "98765", "account_email": "test123@gmail.com" }` (missing `text`, `locale`, timestamps, etc.)

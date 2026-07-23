# Practical Assignment 

Time Limit: 48 hours 

AI Usage Policy: You may use any AI tool during this assignment. However, Task 6 requires you to document how you used it and what you changed from any generated output. 

## **Autocomplete Form Requirements** 

After completing login, the user is redirected to an Autocomplete web form. This form contains a title, a text input field, a suggestion list, and a Next button. The form is configurable by an Admin (login and admin configuration are outside scope). 

Assume the URL: https://test.com/autocomplete-form 

### **HTML Structure:** 

<html> <head></head>v <body> <div class="form-container"> <label for="input-field">Enter a value:</label> <input type="text" id="input-field" placeholder="Type here..."> <ul class="suggestions"> <li>agile methodology</li> <li>agile methodology process</li> <li>agile methodology process testing</li> </ul> <button id="next-button">Next</button> <span class="error-message">Error: Invalid input. Please select a valid suggestion.</span> <div class="success-container"> <p>Success! Your response has been recorded.</p> </div> </div> </body> </html> 

## **Functional Requirements** 

### **_FR-01: Text Input_** 

- Users can type any response in the text field OR click/tap a suggestion list item to select it. 

### **_FR-02: Suggestion Filtering (Prefix Match — Default)_** 

- If the typed characters match the initial characters of a suggestion, that suggestion remains visible. 

- If the typed characters do NOT match the beginning of any suggestion, those suggestions disappear from the list. 

### **_FR-03: Suggestion Filtering (Match Anywhere — Configurable)_** 

- When enabled in backend configuration, suggestions remain visible if they contain the typed text anywhere in the string. 

- Example: Typing "agile method" keeps all three suggestions visible since all contain that substring. 

### **_FR-04: Form Submission_** 

- Selecting the Next button sends a REST API call to persist the response. 

- A successful submission returns HTTP status code 200. 

- On success, a success message is displayed. 

- On invalid input, an error message is displayed. 

### **_FR-05: Backend Data Contract_** 

The persisted response must contain the following properties: 

|Property|Description|
|---|---|
|account_id|ID of the user account that completed the form|
|account_email|Email of the user account that completed the form|
|start_date|Timestamp in the user's local time when they reached the form|
|end_date|Timestamp in the user's local time when they selected Next|



|locale|IETF BCP 47 format of the user's locale (e.g., en-IN)|
|---|---|
|text|Text given by the user in the input field|
|suggestion_list|Comma-separated string of suggestions matching the value|
||entered/selected|
|completed|Boolean representing the status of form response upload|



#### **Test Environment Details** 

Browser: Chrome on Windows 10, language configured as English 

Login user: test123@gmail.com User location: India (local timezone: IST, UTC+05:30) 

### **Practical Exercise** 

1.  Identify your top 10 test scenarios, ranked from highest to lowest risk. For each, provide: a. One-line summary 

   - b. Risk level: Critical / High / Medium / Low 

   - c. One sentence explaining your ranking rationale 

2. After completing the form by selecting "agile methodology" from the suggestion list, you perform a GET request to the API and receive this response: 

{ "account_id": "98765", "account_email": "test123@gmail.com", "start_date": "2024-03-15T10:30:00Z", "end_date": "2024-03-15T10:32:00Z", "locale": "en", "text": "agile methodology", "suggestion_list": "agile methodology, agile methodology process, agile methodology process testing", "completed": "true" } 

Task: Compare this response against the requirements in FR-05. Identify every discrepancy 

3. Write detailed test cases for the scenarios identified in Section 2. Each test case must include: 

   - a. Test Case ID 

   - b. Title 

   - c. Preconditions 

   - d. Test Steps (numbered) 

   - e. Expected Results 

   - f. Test Data 

   - g. Minimum: 8 detailed test cases covering both UI and API behavior. 

4. Write Playwright test scripts in your preferred programming language. Scripts must cover 

   - Tab Navigation - Navigate between form elements using Tab key 

   - Keyboard Interaction - Use Enter to submit, Escape to clear/close 

   - Suggestion Filtering - Type text and verify correct suggestions appear/disappear 

   - Suggestion Selection - Click a suggestion and verify input field is populated 

   - Form Submission - Submit and verify success/error message display 

   - Code Structure - Use Page Object Model or equivalent design pattern 

Scripts must be executable. Include a README with setup instructions, dependencies, and how to run the suite. 

5. Task: Write API automation scripts that: 

   - a. Validate response schema matches the data contract in FR-05 

   - b. Verify correct data types (boolean for completed, proper timestamp format, etc.) 

   - c. Validate IETF BCP 47 locale format 

   - d. Confirm suggestion_list contains only matching suggestions (not all suggestions) 

   - e. Include at least 2 negative test cases (missing fields, invalid data, etc.) 

### 6. Task: Answer the following: 

- a. Tools Used: Which AI tools did you use during this assignment? 

- b. Usage Areas: What specifically did you use them for? 

- c. Modifications Made: Provide at least 2 specific examples where you corrected, improved, or added to the AI output. Explain your reasoning. 

- d. AI Limitations: What did the AI get wrong or fail to identify? (minimum 1 example) 

### **Submission Structure** 

Submit as a Git repository with the following structure: 

├── README.md ├── docs/ │   ├── 1-requirement-analysis.md │   ├── 2-test-scenarios.md │   ├── 3-defect-identification.md │   ├── 4-test-cases.md │   ├── 7-ai-reflection.md │   └── 8-architecture-discussion.md ├── tests/ │   ├── ui/ │   │   ├── pages/           (Page Object classes) │   │   ├── tests/           (Test scripts) │   │   └── config/          (Browser/environment config) │   └── api/ │       └── tests/           (API test scripts) └── package.json / pom.xml / requirements.txt (dependency file) 

Note: 

```
Please submit the prompt file(s) you used to complete this
assignment, along with the complete JSON transcript of your AI
conversation(s).
```

```
Submissions without the prompt file(s) and the complete JSON
transcript will be considered incomplete and will be rejected.
```


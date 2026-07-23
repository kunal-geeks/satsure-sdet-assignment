import { ENV } from '../config/playwright.env';

/** All suggestion strings exactly as they appear in the form fixture */
export const SUGGESTIONS = [
  'agile methodology',
  'agile methodology process',
  'agile methodology process testing',
] as const;

export type Suggestion = (typeof SUGGESTIONS)[number];

/** Authenticated test user matching the assignment spec */
export const TEST_USER = {
  accountId: ENV.USER_ACCOUNT_ID,
  email: ENV.USER_EMAIL,
} as const;

/** Standard error text rendered by the form on invalid submission */
export const ERROR_MESSAGE_TEXT = 'Error: Invalid input. Please select a valid suggestion.';

/** Standard success text rendered by the form on successful submission */
export const SUCCESS_MESSAGE_TEXT = 'Success! Your response has been recorded.';

/** Form route path (relative to base URL) */
export const FORM_PATH = '/autocomplete-form';

/** API submission endpoint path */
export const API_SUBMISSION_PATH = '/api/submission';

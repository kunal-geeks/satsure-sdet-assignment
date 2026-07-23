import type { FR05Response } from '../schema/fr05.schema';

/** Fully compliant FR-05 response for positive test assertions. */
export const COMPLIANT_RESPONSE: FR05Response = {
  account_id: '98765',
  account_email: 'test123@gmail.com',
  start_date: '2024-03-15T16:00:00+05:30',
  end_date: '2024-03-15T16:02:00+05:30',
  locale: 'en-IN',
  text: 'agile methodology',
  suggestion_list: 'agile methodology, agile methodology process, agile methodology process testing',
  completed: true,
};

/**
 * Non-compliant response mirroring the assignment's sample API response.
 * Contains 4 defects: UTC timestamps, missing locale region, string boolean.
 */
export const ASSIGNMENT_SAMPLE_RESPONSE = {
  account_id: '98765',
  account_email: 'test123@gmail.com',
  start_date: '2024-03-15T10:30:00Z',
  end_date: '2024-03-15T10:32:00Z',
  locale: 'en',
  text: 'agile methodology',
  suggestion_list: 'agile methodology, agile methodology process, agile methodology process testing',
  completed: 'true',
};

/** All suggestions in the default form fixture. */
export const ALL_SUGGESTIONS = [
  'agile methodology',
  'agile methodology process',
  'agile methodology process testing',
] as const;

/** Centralised environment configuration — all env vars resolved here. */
export const ENV = {
  BASE_URL: process.env['BASE_URL'] ?? 'https://test.com',
  USER_EMAIL: process.env['USER_EMAIL'] ?? 'test123@gmail.com',
  USER_ACCOUNT_ID: process.env['USER_ACCOUNT_ID'] ?? '98765',
  LOCALE: process.env['LOCALE'] ?? 'en-IN',
  TIMEZONE: process.env['TIMEZONE'] ?? 'Asia/Kolkata',
} as const;

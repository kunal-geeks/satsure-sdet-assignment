import { z } from 'zod';

/** ISO 8601 datetime with explicit timezone offset — rejects Z/UTC. */
export const LOCAL_TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

/** IETF BCP 47 with required region subtag, e.g. "en-IN", "fr-FR". */
export const BCP47_WITH_REGION_REGEX = /^[a-z]{2,3}-[A-Z]{2,3}$/;

/**
 * Zod schema representing the FR-05 backend data contract.
 *
 * Key constraints:
 *  - start_date / end_date must be in user's local time (offset, not Z)
 *  - locale must include region subtag per IETF BCP 47
 *  - completed must be a JSON boolean (not string "true")
 */
export const FR05Schema = z.object({
  account_id: z.union([z.string().min(1), z.number()]),
  account_email: z.string().email(),
  start_date: z.string().regex(LOCAL_TIMESTAMP_REGEX, {
    message: 'start_date must be an ISO 8601 timestamp in local time with timezone offset (not UTC/Z)',
  }),
  end_date: z.string().regex(LOCAL_TIMESTAMP_REGEX, {
    message: 'end_date must be an ISO 8601 timestamp in local time with timezone offset (not UTC/Z)',
  }),
  locale: z.string().regex(BCP47_WITH_REGION_REGEX, {
    message: 'locale must be IETF BCP 47 format with region subtag, e.g. en-IN',
  }),
  text: z.string().min(1),
  suggestion_list: z.string().min(1),
  completed: z.boolean({
    invalid_type_error: 'completed must be a JSON boolean (true/false), not a string',
  }),
});

export type FR05Response = z.infer<typeof FR05Schema>;

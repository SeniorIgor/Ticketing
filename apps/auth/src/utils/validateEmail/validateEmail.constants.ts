import type { EmailValidationError } from '../../types';

export const EMAIL_ERROR_MESSAGES: Record<EmailValidationError, string> = {
  empty: 'Email address is required.',
  not_string: 'Email address must be a text value.',
  too_short: 'Email address is too short.',
  too_long: 'Email address is too long.',
  missing_at: 'Email address must contain an "@" symbol.',
  invalid_format: 'Email address format is invalid.',
  invalid_domain: 'Email domain is invalid.',
};

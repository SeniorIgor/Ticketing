import type { PasswordValidationError } from '../../types';

export const PASSWORD_ERROR_MESSAGES: Record<PasswordValidationError, string> = {
  empty: 'Password is required.',
  not_string: 'Password must be a text value.',
  too_short: 'Password must be at least 8 characters long.',
  too_long: 'Password must be no longer than 128 characters.',
  missing_uppercase: 'Password must contain at least one uppercase letter.',
  missing_lowercase: 'Password must contain at least one lowercase letter.',
  missing_number: 'Password must contain at least one number.',
  missing_special: 'Password must contain at least one special character.',
};

import type { EmailValidationResult } from '../../types';

import { EMAIL_ERROR_MESSAGES } from './validateEmail.constants';

export function validateEmail(email: unknown): EmailValidationResult {
  if (email === null || email === undefined) {
    return { valid: false, error: 'empty', message: EMAIL_ERROR_MESSAGES.empty };
  }

  if (typeof email !== 'string') {
    return {
      valid: false,
      error: 'not_string',
      message: EMAIL_ERROR_MESSAGES.not_string,
    };
  }

  const value = email.trim().toLowerCase();

  if (value.length === 0) {
    return { valid: false, error: 'empty', message: EMAIL_ERROR_MESSAGES.empty };
  }

  if (value.length < 5) {
    return {
      valid: false,
      error: 'too_short',
      message: EMAIL_ERROR_MESSAGES.too_short,
    };
  }

  if (value.length > 254) {
    return {
      valid: false,
      error: 'too_long',
      message: EMAIL_ERROR_MESSAGES.too_long,
    };
  }

  if (!value.includes('@')) {
    return {
      valid: false,
      error: 'missing_at',
      message: EMAIL_ERROR_MESSAGES.missing_at,
    };
  }

  const EMAIL_REGEX =
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

  if (!EMAIL_REGEX.test(value)) {
    return {
      valid: false,
      error: 'invalid_format',
      message: EMAIL_ERROR_MESSAGES.invalid_format,
    };
  }

  return { valid: true };
}

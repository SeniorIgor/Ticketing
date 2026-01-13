import { PASSWORD_ERROR_MESSAGES } from './validatePassword.constants';
import type { PasswordValidationResult } from './validatePassword.types';

export function validatePasswordBase(password: unknown): PasswordValidationResult {
  if (password === null || password === undefined) {
    return { valid: false, error: 'empty', message: PASSWORD_ERROR_MESSAGES.empty };
  }

  if (typeof password !== 'string') {
    return {
      valid: false,
      error: 'not_string',
      message: PASSWORD_ERROR_MESSAGES.not_string,
    };
  }

  const value = password;

  if (value.length === 0) {
    return { valid: false, error: 'empty', message: PASSWORD_ERROR_MESSAGES.empty };
  }

  if (value.length > 128) {
    return {
      valid: false,
      error: 'too_long',
      message: PASSWORD_ERROR_MESSAGES.too_long,
    };
  }

  return { valid: true };
}

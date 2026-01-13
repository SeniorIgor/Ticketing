import { PASSWORD_ERROR_MESSAGES } from './validatePassword.constants';
import type { PasswordValidationResult } from './validatePassword.types';
import { validatePasswordBase } from './validatePasswordBase';

export function validatePassword(password: unknown): PasswordValidationResult {
  const base = validatePasswordBase(password);

  if (!base.valid) {
    return base;
  }

  const value = password as string;

  if (value.length < 8) {
    return {
      valid: false,
      error: 'too_short',
      message: PASSWORD_ERROR_MESSAGES.too_short,
    };
  }

  if (!/[A-Z]/.test(value)) {
    return {
      valid: false,
      error: 'missing_uppercase',
      message: PASSWORD_ERROR_MESSAGES.missing_uppercase,
    };
  }

  if (!/[a-z]/.test(value)) {
    return {
      valid: false,
      error: 'missing_lowercase',
      message: PASSWORD_ERROR_MESSAGES.missing_lowercase,
    };
  }

  if (!/[0-9]/.test(value)) {
    return {
      valid: false,
      error: 'missing_number',
      message: PASSWORD_ERROR_MESSAGES.missing_number,
    };
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    return {
      valid: false,
      error: 'missing_special',
      message: PASSWORD_ERROR_MESSAGES.missing_special,
    };
  }

  return { valid: true };
}

export type { PasswordValidationError, PasswordValidationResult } from './validatePassword.types';

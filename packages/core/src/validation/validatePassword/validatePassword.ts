import { PASSWORD_ERROR_MESSAGES } from './validatePassword.constants';
import type { PasswordValidationResult } from './validatePassword.types';

export function validatePassword(password: unknown): PasswordValidationResult {
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

  if (value.length < 8) {
    return {
      valid: false,
      error: 'too_short',
      message: PASSWORD_ERROR_MESSAGES.too_short,
    };
  }

  if (value.length > 128) {
    return {
      valid: false,
      error: 'too_long',
      message: PASSWORD_ERROR_MESSAGES.too_long,
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

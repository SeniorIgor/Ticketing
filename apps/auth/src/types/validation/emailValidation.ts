import type { ValidationResult } from '@org/core';

export type EmailValidationError =
  | 'empty'
  | 'not_string'
  | 'too_short'
  | 'too_long'
  | 'missing_at'
  | 'invalid_format'
  | 'invalid_domain';

export type EmailValidationResult = ValidationResult<EmailValidationError>;

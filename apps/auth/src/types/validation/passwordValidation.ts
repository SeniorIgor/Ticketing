import type { ValidationResult } from '@org/core';

export type PasswordValidationError =
  | 'empty'
  | 'not_string'
  | 'too_short'
  | 'too_long'
  | 'missing_uppercase'
  | 'missing_lowercase'
  | 'missing_number'
  | 'missing_special';

export type PasswordValidationResult = ValidationResult<PasswordValidationError>;

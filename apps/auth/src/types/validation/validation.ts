import type { ValidationErrors } from '@org/core';

import type { EmailValidationError } from './emailValidation';
import type { PasswordValidationError } from './passwordValidation';

type SignupFields = 'email' | 'password';

type SignupErrorCodes = EmailValidationError | PasswordValidationError;

export type SignupValidationErrors = ValidationErrors<SignupFields, SignupErrorCodes>;

export * from './emailValidation';
export * from './passwordValidation';

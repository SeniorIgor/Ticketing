import type { EmailValidationError, ValidationErrors } from '@org/core';

import type { PasswordValidationError } from './passwordValidation';

type SignupFields = 'email' | 'password';

type SignupErrorCodes = EmailValidationError | PasswordValidationError;

export type SignupValidationErrors = ValidationErrors<SignupFields, SignupErrorCodes>;

import { type SignupReqBody, toFieldError, validateEmail, validatePassword } from '@org/core';

import type { SignupValidationErrors } from '../../types';

export function validateSignup(body: SignupReqBody): SignupValidationErrors {
  const errors: SignupValidationErrors = {};

  const email = validateEmail(body.email);
  if (!email.valid) {
    errors.email = toFieldError(email);
  }

  const password = validatePassword(body.password);
  if (!password.valid) {
    errors.password = toFieldError(password);
  }

  return errors;
}

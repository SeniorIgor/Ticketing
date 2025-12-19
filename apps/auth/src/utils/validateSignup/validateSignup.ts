import type { SignupReqBody } from '@org/core';

import type { SignupValidationErrors } from '../../types';
import { toFieldError } from '../toFieldError';
import { validateEmail } from '../validateEmail/validateEmail';
import { validatePassword } from '../validatePassword/validatePassword';

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

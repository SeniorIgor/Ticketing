import type { ErrorDetail } from '@org/core';
import { toFieldError, validateEmail, validatePasswordBase } from '@org/core';

import type { SigninReqBody } from '../types';

export function validateSignin(body: SigninReqBody): Array<ErrorDetail> {
  const errors: Array<ErrorDetail> = [];

  const email = validateEmail(body.email);
  if (!email.valid) {
    errors.push(toFieldError(email, 'email'));
  }

  const password = validatePasswordBase(body.password);
  if (!password.valid) {
    errors.push(toFieldError(password, 'password'));
  }

  return errors;
}

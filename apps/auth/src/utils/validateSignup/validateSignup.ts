import type { ErrorDetail } from '@org/core';
import { type SignupReqBody, toFieldError, validateEmail, validatePassword } from '@org/core';

export function validateSignup(body: SignupReqBody): Array<ErrorDetail> {
  const errors: Array<ErrorDetail> = [];

  const email = validateEmail(body.email);
  if (!email.valid) {
    errors.push(toFieldError(email, 'email'));
  }

  const password = validatePassword(body.password);
  if (!password.valid) {
    errors.push(toFieldError(password, 'password'));
  }

  return errors;
}

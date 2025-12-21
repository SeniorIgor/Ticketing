import { BaseError } from './base-error';

export class AuthenticationError extends BaseError {
  constructor(reason = 'NOT_AUTHENTICATED', message = 'Authentication required') {
    super(401, 'AUTHENTICATION', message, reason);
  }
}

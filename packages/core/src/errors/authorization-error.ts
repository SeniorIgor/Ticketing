import { BaseError } from './base-error';

export class AuthorizationError extends BaseError {
  constructor(reason = 'FORBIDDEN', message = 'You do not have access to this resource') {
    super(403, 'AUTHORIZATION', message, reason);
  }
}

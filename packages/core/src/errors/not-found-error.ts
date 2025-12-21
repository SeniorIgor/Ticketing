import { BaseError } from './base-error';

export class NotFoundError extends BaseError {
  constructor(reason: string, message = 'Resource not found') {
    super(404, 'NOT_FOUND', message, reason);
  }
}
